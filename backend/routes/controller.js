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

            // if repeat action or already in that new state
            if (dock.fsm_state === nextState){
                return reply.send({ 
                    success: true,
                    sensor_name: targetSensor.name,
                    nextState: nextState,
                    event: insertEvent,
                    notes: "Equipment already in position"
                });
            }

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
                
                // update dock cycle
                const { data: updateCycle, error: cycleUpdateError} = await fastify.supabase
                .from("dock_cycles")
                .update({
                    terminal_state: nextState,
                    terminal_reason: action,
                    state_started_at: NOW,
                    meta: updatedConditions
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
                    active_cycle_id: activeCycleId
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
                    new_fsm_state: nextState,
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

    // Start cycle or End cycle
    fastify.post("/controller/reset", async (request, reply) => {
        try{
            const NOW = new Date().toISOString();

            // json body incoming
            const { theDock, status } = request.body;
            
            if(!theDock || status === undefined){
                return reply.code(400).send({error: "Missing required fields"});
            }

            const oldStatus = theDock.status;
            let newStatus = oldStatus;

            const oldFsm = theDock.fsm_state;
            let newFsm = oldFsm;

            let activeCycleId = null;

            if ( status ){ // truck enters bay
                newStatus = "occupied"
                newFsm = "Truck_Present"

                //start cycle
                const { data: cycleStart, error: cycleStartError} = await fastify.supabase
                .from("dock_cycles")
                .insert({
                    dock_name: theDock.name,
                    terminal_state: newFsm,
                    terminal_reason: "Truck Entered, Start Cycle",
                    state_started_at: NOW,
                    created_at: NOW,
                    dock_bay_id: theDock.id
                })
                .select()
                .single();
                if ( cycleStartError ){
                    return reply.code(500).send({ error: "Failed to start cycle" });
                }
                console.log("Newly created cycle id: ", cycleStart.id);
                activeCycleId = cycleStart.id;
                
                // Update dock bay state to occupied
                const { data: dock, error: dockError } = await fastify.supabase
                .from("dock_bays")
                .update({
                    status: newStatus,
                    status_changed_at: NOW,
                    fsm_state_entered_at: NOW,
                    fsm_state: newFsm,
                    last_valid_fsm_state: oldFsm,
                    active_cycle_id: activeCycleId
                })
                .eq("id", theDock.id)
                .select()
                .single();
                if ( dockError ) {
                    return reply.code(500).send({ error: "Database Error", dockError });
                }

                // Broadcast status update to dock opened
                broadcaster.broadcast({
                    type: "dock_status_update",
                    payload: {
                        dock_bay_id: theDock.id,
                        old_status: oldStatus,
                        new_status: newStatus,
                        event_type: "Start Cycle",
                        status_changed_at: NOW, 
                        active_cycle_id: activeCycleId
                    }
                });
            }
            //truck leaves Bay
            else{
                activeCycleId = null;
                newStatus = "idle";
                newFsm = "Bay_Available";

                // end cycle
                if (!theDock.active_cycle_id) {
                    return reply.code(400).send({ error: "No active cycle to end" });
                }
                const { data: cycleEnd, error: cycleEndError} = await fastify.supabase
                .from("dock_cycles")
                .update({
                    terminal_state: newFsm,
                    terminal_reason: "Truck Left Bay, End Cycle",
                    ended_at: NOW
                })
                .eq("id", theDock.active_cycle_id)
                .select()
                .single();
                if ( cycleEndError ){
                    return reply.code(500).send({ error: "Failed to end cycle" });
                }

                // Update dock bay state to idle
                const { data: dock, error: dockError } = await fastify.supabase
                .from("dock_bays")
                .update({
                    status: newStatus,
                    status_changed_at: NOW,
                    fsm_state_entered_at: NOW,
                    fsm_state: "awsldfawdc",
                    last_valid_fsm_state: oldFsm,
                    conditions: null,
                    active_cycle_id: activeCycleId
                })
                .eq("id", theDock.id)
                .select()
                .single();
                if ( dockError ) {
                    return reply.code(500).send({ error: "Database Error", dockError });
                }

                // Broadcast status update dock closed 
                broadcaster.broadcast({
                    type: "dock_status_update",
                    payload: {
                        dock_bay_id: theDock.id,
                        old_status: oldStatus,
                        new_status: newStatus,
                        event_type: "End Cycle",
                        status_changed_at: NOW,
                        // pass this to dashboard/page.tsx to update status to closed
                        active_cycle_id: theDock.active_cycle_id
                    }
                });

                // Broadcast load complete to widget
                broadcaster.broadcast({
                    type: "load_completed",
                    payload: {
                        dock_bay_id: theDock.id,
                        completed_at: NOW
                    }
                });
            }
            
            // Insert event into dock_bay_history
            const { data: hist, error: histError} = await fastify.supabase
            .from("dock_bay_history")
            .insert({
                dock_bay_id: theDock.id,
                old_status: oldStatus,
                new_status: newStatus,
                reason: newStatus === "occupied" ? "Truck Entered, Start Cycle" : "Truck Left Bay, End Cycle",
                event_id: null,
                old_fsm_state: oldFsm,
                new_fsm_state: newFsm
            })
            .select()
            .single();
            if ( histError ){
                return reply.code(500).send({ error: "Failed to insert history", histError });
            }


            // POST return body
            return reply.send({ 
                success: true,
                status: newStatus,
                new_state: newFsm,
                active_cycle_id: activeCycleId,
                dock_bay_id: theDock.id
            });

        } catch (err) {
            console.error("Controller error:", err);
            return reply.code(500).send({ error: "Error with state controller" });
        }
    })

}