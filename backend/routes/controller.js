//Controller Actions
const { stateMachine, boolFlipper } = require("../lib/helpers/controllerHelpers");

module.exports = async function (fastify, opts) {
    // any button pressed
    fastify.post("/controller/action", async (request, reply) => {
        try{
            const { dockId, sensorId, action } = request.body;
            if (!dockId || !sensorId || !action) {
                return reply.code(400).send({ error: "Missing required fields" });
            }

            const NOW = new Date().toISOString();

            // Get dock data
            const { data: dock, error: dockError } = await fastify.supabase
                .from("dock_bays")
                .select("fsm_state, last_valid_fsm_state, active_cycle_id")
                .eq("id", dockId)
                .single();
            
            if (dockError) {
                return reply.code(500).send({ error: "Database Error", dockError });
            }
            if (!dock) {
                return reply.code(404).send({ error: "Dock not found" });
            }

            // get sensor conditions
            const { data: conditions, error: sensorsError } = await fastify.supabase
                .from("sensors")
                .select("id, sensor_type, sensor_state")
                .eq("dock_bay_id", dockId);
            
            if (sensorsError) {
                return reply.code(500).send({ error: "Database Error (sensors)", sensorsError });
            }
            if (!conditions || conditions.length === 0) {
                return reply.code(404).send({ error: "Sensors not found" });
            }

            // call stateMachine function
            const nextState = stateMachine(dock.fsm_state, dock.last_valid_fsm_state, conditions, action);

            // Get updated sensor states based on next state
            const updatedConditions = boolFlipper(nextState, conditions);

            // Update sensors value in public.sensors
            const sensorUpdatePromises = updatedConditions.map(async (sensor) => {
                const { data, error } = await fastify.supabase
                    .from("sensors")
                    .update({
                        sensor_state: sensor.sensor_state
                    })
                    .eq("id", sensor.id)
                    .select("*")
                    .single();

                if (error) {
                    console.error(`Failed to update sensor ${sensor.id}:`, error);
                    throw error;
                }
                return data;
            });
            // Wait for all sensor updates to complete
            const updatedSensors = await Promise.all(sensorUpdatePromises);


            // insert data into cycle or create one in public.dock_cycles
            //FIX!!!! right now its just insert, needs to be update if one already made for current dock bay load
            const { data: insertCycle, error: cycleError} = await fastify.supabase
                .from("dock_cycles")
                .insert({
                    dock_bay_id: dockId,
                    terminal_state: nextState,
                    terminal_reason: action,
                    state_started_at: NOW,
                    meta: updatedConditions,
                    ended_at: nextState === "Cycle_Complete" ? NOW : null
                })
                .select("*")
                .single();

            if (cycleError) {
                console.error("Insert error: ", cycleError);
                return reply.code(500).send({ error: "Failed to insert cycle data"});
            } 

            // Find the specific sensor from updated conditions
            const targetSensor = updatedConditions.find(s => s.id === sensorId);
            if (!targetSensor) {
                return reply.code(404).send({ error: "Sensor not found in conditions" });
            }

            // insert data into sensor_events
            const { data: insertEvent, error: eventError} = await fastify.supabase
                .from("sensor_events")
                .insert({
                    sensor_id: sensorId, 
                    dock_bay_id: dockId,
                    payload: {
                        sensor_state: targetSensor.sensor_state,
                        sensor_type: targetSensor.sensor_type
                    },
                    cycle_id: dock.active_cycle_id,
                    action: action
                })
                .select("*")
                .single();

            if (eventError) {
                console.error("Insert error: ", eventError);
                return reply.code(500).send({ error: "Failed to insert sensor event data"});
            } 
                
            // update info in public.dock_bays
            // add exceptions!
            const { data: insertDockInfo, error: dockErr} = await fastify.supabase
                .from("dock_bays")
                .update({
                    fsm_state: nextState,
                    last_valid_fsm_state: dock.fsm_state,
                    // exception_code: nextState === "Exception" ? "EXCEPTION1" : null,
                    // exception_payload: null,
                    conditions: updatedConditions,
                    active_cycle_id: dock.active_cycle_id,
                    fsm_state_entered_at: NOW
                })
                .eq("id", dockId)
                .select("*")
                .single();

            if (dockErr) {
                console.error("Update error: ", dockErr);
                return reply.code(500).send({ error: "Failed to update dock"});
            } 
                
            // POST return body
            return reply.send({ 
                success: true,
                nextState,
                updatedSensors,
                insertedRow,
                insertCycle,
                insertDockInfo,
                insertEvent
            });

        } catch (err) {
            return reply.code(500).send({ error: "Error with state controller" });
        }
    });

}   