//Controller Actions
const broadcaster = require("../lib/broadcaster");
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
                .select("name, fsm_state, last_valid_fsm_state, active_cycle_id")
                .eq("id", dockId)
                .single();
            
            if (dockError) {
                return reply.code(500).send({ error: "Database Error", dockError });
            }
            if (!dock) {
                return reply.code(404).send({ error: "Dock not found" });
            }

            // get sensor CONDITIONS
            const { data: conditions, error: sensorsError } = await fastify.supabase
                .from("sensors")
                .select("id, sensor_type, name, sensor_state")
                .eq("dock_bay_id", dockId);
            
            if (sensorsError) {
                return reply.code(500).send({ error: "Database Error (sensors)", sensorsError });
            }
            if (!conditions || conditions.length === 0) {
                return reply.code(404).send({ error: "Sensors not found" });
            }

            // Find the specific sensor that triggered this action
            const targetSensor = conditions.find(s => s.id === sensorId);
            if (!targetSensor) {
                return reply.code(404).send({ error: "Sensor not found" });
            }

            // call stateMachine function
            const nextState = stateMachine(dock.fsm_state, dock.last_valid_fsm_state, conditions, action);

            console.log("action: ", action);
            console.log("NExt State: ", nextState);

            let updatedConditions = conditions;
            let cycleData = null;
            let activeCycleId = dock.active_cycle_id ?? null;

            let updatedSensor = null;
            let flippedSensorState = null;
            let updatedDockInfo = null;
            let insertEvent = null;

            //No exception, change state and log
            if(nextState !== "Exception"){

                // flip state of the sensor that caused POST and update in DB
                flippedSensorState = !targetSensor.sensor_state;
                const{ data: flippSensorVal, error: sensorUpdateErr } = await fastify.supabase
                .from("sensors")
                .update({
                    sensor_state: flippedSensorState,
                    updated_state_at: NOW
                })
                .eq("id", sensorId)
                .select("*")
                .single();
                if (sensorUpdateErr) {
                    console.error(`Failed to update sensor ${sensorId}:`, sensorUpdateErr);
                    return reply.code(500).send({ error: "Failed to update sensor"});
                }
                updatedSensor = flippSensorVal;
                
                // Create updated conditions array with the flipped sensor
                updatedConditions = conditions.map(sensor => 
                    sensor.id === sensorId 
                    ? { ...sensor, sensor_state: flippedSensorState }
                    : sensor
                );
                
                // No active cycle - create new one
                if (!dock.active_cycle_id) {
                    const { data: insertCycle, error: cycleError} = await fastify.supabase
                    .from("dock_cycles")
                    .insert({
                        dock_bay_id: dockId,
                        terminal_state: nextState,
                        terminal_reason: action,
                        state_started_at: NOW,
                        meta: updatedConditions,
                        created_at: NOW,
                        ended_at: nextState === "Cycle_Complete" ? NOW : null, 
                        dock_name: dock.name
                    })
                    .select("*")
                    .single();
                    
                    if (cycleError) {
                        console.error("Insert error: ", cycleError);
                        return reply.code(500).send({ error: "Failed to insert cycle data"});
                    }
                    cycleData = insertCycle;
                    activeCycleId = insertCycle.id;
                } 
                // Active cycle exists - update it
                else {
                    const { data: updateCycle, error: cycleUpdateError} = await fastify.supabase
                    .from("dock_cycles")
                    .update({
                        terminal_state: nextState,
                        terminal_reason: action,
                        state_started_at: NOW,
                        meta: updatedConditions,
                        ended_at: nextState === "Cycle_Complete" ? NOW : null
                    })
                    .eq("id", dock.active_cycle_id)
                    .select("*")
                    .single();
                    
                    if (cycleUpdateError) {
                        console.error("Update error: ", cycleUpdateError);
                        return reply.code(500).send({ error: "Failed to update cycle"});
                    }
                    cycleData = updateCycle;
                    activeCycleId = dock.active_cycle_id;
                }
                
                // insert data into sensor_events
                const { data: insertEvent, error: eventError} = await fastify.supabase
                .from("sensor_events")
                .insert({
                    sensor_id: sensorId, 
                    dock_bay_id: dockId,
                    payload: {
                        sensor_type: targetSensor.sensor_type,
                        sensor_state: flippedSensorState
                    },
                    cycle_id: activeCycleId,
                    action: action, 
                    sensor_name: targetSensor.name
                })
                .select("*")
                .single();
                
                if (eventError) {
                    console.error("Insert error: ", eventError);
                    return reply.code(500).send({ error: "Failed to insert sensor event data"});
                }
                
                // update info in public.dock_bays
                const { data: updatedDockInfo, error: dockErr} = await fastify.supabase
                .from("dock_bays")
                .update({
                    fsm_state: nextState,
                    last_valid_fsm_state: dock.fsm_state,
                    conditions: updatedConditions,
                    fsm_state_entered_at: NOW,
                    active_cycle_id: nextState === "Cycle_Complete" ? null : activeCycleId
                })
                .eq("id", dockId)
                .select("*")
                .single();
                
                if (dockErr) {
                    console.error("Update error: ", dockErr);
                    return reply.code(500).send({ error: "Failed to update dock"});
                }
                
            }
            // log exception and broadcast update
            else{
                //log in exception table
                const { data: exceptionInsert, error: exceptionInsertError} = await fastify.supabase
                .from("exceptions")
                .insert({
                    sensor_name: targetSensor.name, 
                    previous_state: dock.fsm_state,
                    conditions: conditions,
                    action: action
                })
                .select("*")
                .single();
                
                if (exceptionInsertError) {
                    console.error("Insert error: ", exceptionInsertError);
                    return reply.code(500).send({ error: "Failed to insert exception data"});
                }


                // if active cycle, update to exception
                if (dock.active_cycle_id) {
                    const { data: insertCycle, error: cycleError} = await fastify.supabase
                    .from("dock_cycles")
                    .update({
                        terminal_state: nextState,
                        terminal_reason: action,
                        state_started_at: NOW,
                        meta: updatedConditions,
                        ended_at: nextState === "Cycle_Complete" ? NOW : null,
                        dock_name: dock.name
                    })
                    .eq("id", activeCycleId)
                    .select("*")
                    .single();
                    
                    if (cycleError) {
                        console.error("Insert error: ", cycleError);
                        return reply.code(500).send({ error: "Failed to insert cycle data"});
                    }
                    cycleData = insertCycle;
                    activeCycleId = insertCycle.id;
                }

                // insert exception into public.sensor_events
                const { data: insertEvent, error: eventError} = await fastify.supabase
                .from("sensor_events")
                .insert({
                    sensor_id: sensorId, 
                    dock_bay_id: dockId,
                    payload: {
                        sensor_type: targetSensor.sensor_type,
                        sensor_state: nextState
                    },
                    cycle_id: activeCycleId,
                    action: action,
                    sensor_name: targetSensor.name
                })
                .select("*")
                .single();
                
                if (eventError) {
                    console.error("Insert error: ", eventError);
                    return reply.code(500).send({ error: "Failed to insert sensor event data"});
                }

                // update exception in public.dock_bays
                const { data: updatedDockInfo, error: dockErr} = await fastify.supabase
                .from("dock_bays")
                .update({
                    fsm_state: nextState,
                    last_valid_fsm_state: dock.fsm_state,
                    conditions: conditions,
                    fsm_state_entered_at: NOW
                })
                .eq("id", dockId)
                .select("*")
                .single();
                
                if (dockErr) {
                    console.error("Update error: ", dockErr);
                    return reply.code(500).send({ error: "Failed to update dock"});
                }
            }

            // broadcast update
            broadcaster.broadcast({
                type: 'sensor_updated',
                payload: {
                    dock_bay_id: dockId,
                    sensor_id: sensorId,
                    sensor_type: targetSensor.sensor_type,
                    sensor_state: flippedSensorState ?? targetSensor.sensor_state,
                    action: action,
                    timestamp: NOW
                }
            });

            // POST return body
            return reply.send({ 
                success: true,
                sensor_name: targetSensor.name,
                nextState: nextState,
                updated_sensor: updatedSensor,
                cycle: cycleData,
                dockBay: updatedDockInfo,
                event: insertEvent
            });

        } catch (err) {
            console.error("Controller error:", err);
            return reply.code(500).send({ error: "Error with state controller" });
        }
    });

    fastify.post("/controller/reset", async (request, reply) => {
        try{
            const NOW = new Date().toISOString();

            const { dockBay_Id } = request.body;
            
            if(!dockBay_Id){
                return reply.code(400).send({error: "Missing required fields"});
            }

            // Update dock bay state to available
            const { data: dock, error: dockError } = await fastify.supabase
                .from("dock_bays")
                .update({
                    fsm_state_entered_at: NOW,
                    fsm_state: "Bay_Available",
                    last_valid_fsm_state: "Cycle_Complete"
                })
                .eq("id", dockBay_Id)
                .select("fsm_state")
                .single();
            
            if (dockError) {
                return reply.code(500).send({ error: "Database Error", dockError });
            }
            if (!dock) {
                return reply.code(404).send({ error: "Dock not found" });
            }

            // POST return body
            return reply.send({ 
                success: true,
                resetState: "Bay_Available"
            });

        } catch (err) {
            console.error("Controller error:", err);
            return reply.code(500).send({ error: "Error with state controller" });
        }
    })

}