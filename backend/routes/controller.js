//Controller Actions
const { stateMachine } = require("../lib/helpers/controllerHelpers");

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

            // insert new state into test table
            const { data: insertedRow, error: insertError } = await fastify.supabase
                .from("test_table")
                .insert({ next_state: nextState })
                .select("*")
                .single();
            if (insertError) {
                console.error("Insert error:", insertError);
                return reply.code(500).send({ error: "Failed to insert row" });
            }

            // insert data into cycle or create one
            const { data: insertCycle, error: cycleError} = await fastify.supabase
                .from("dock_cycles")
                .insert({
                    dock_bay_id: dockId,
                    terminal_state: nextState,
                    terminal_reason: action,
                    state_started_at: NOW,
                    meta: conditions,
                    ended_at: nextState === "Cycle_Complete" ? NOW : null
                })
                .select("*")
                .single();

            if (cycleError) {
                console.error("Insert error: ", cycleError);
                return reply.code(500).send({ error: "Failed to insert cycle data"});
            } 
                
            // update dock_bay info
            const { data: insertDockInfo, error: dockErr} = await fastify.supabase
                .from("dock_bays")
                .update({
                    fsm_state: nextState,
                    last_valid_fsm_state: dock.fsm_state,
                    exception_code: nextState === "Exception" ? "EXCEPTION1" : null,
                    exception_payload: null,
                    conditions: conditions,
                    active_cycle_id: dock.active_cycle_id,
                    fsm_state_entered_at: NOW
                })
                .eq("dock_bay_id", dockId)
                .select("*")
                .single();

            if (dockErr) {
                console.error("Update error: ", dockErr);
                return reply.code(500).send({ error: "Failed to update dock"});
            } 

            // Find the specific sensor from conditions array for insert
            const targetSensor = conditions.find(s => s.sensor_id === sensorId);
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
                
            return reply.send({ insertedRow, debug: debugInfo });

        } catch (err) {
            return reply.code(500).send({ error: "Error with state controller" });
        }
    });

}   