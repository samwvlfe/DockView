// POST Sensor Data
const broadcaster = require("../lib/broadcaster");

module.exports = async function (fastify, opts) {
    fastify.post("/sensor", async (request, reply) => {
        try {
            const { sensor_id, dock_bay_id, event_type, payload } = request.body;
            const NOW = new Date().toISOString();

            // Validate input
            if (!sensor_id || !dock_bay_id || !event_type) {
                return reply.code(400).send({ error: "Missing required fields" });
            }

            // Get all values for sensor associated with event
            const { data: sensor, error: sensorError } = await fastify.supabase
                .from("sensors")
                .select("*")
                .eq("id", sensor_id) //WHERE clause
                .single();
            if (sensorError || !sensor) {
                return reply.code(404).send({ error: "Sensor not found" });
            }

            // Get dock bay associated with sensor event
            const { data: dockBay, error: dockBayError } = await fastify.supabase
                .from("dock_bays")
                .select("*")
                .eq("id", dock_bay_id) //WHERE clause
                .single();
            if (dockBayError || !dockBay) {
                console.error("Dock bay error:", dockBayError);
                return reply.code(404).send({ error: "Dock bay not found" });
            }

            console.log('dock bay columns available:', Object.keys(dockBay));


            // Store old status for comparison
            const oldStatus = dockBay.status;
            let newStatus = oldStatus; //default to old value, could change below

            // Insert event into sensor_events table
            const { data: event, error: eventError } = await fastify.supabase
                .from("sensor_events")
                .insert({
                    sensor_id,
                    dock_bay_id,
                    event_type,
                    payload
                })
                .select()
                .single();
            if (eventError) {
                console.error(eventError);
                return reply.code(500).send({ error: "Failed to insert sensor event" });
            }

            // will be set with action taken
            let actionType = null;

            if (event_type === "manual change - POST") {
                newStatus = payload.open ? "occupied" : "idle";

                // Update status in dock_bays table
                const { error: updateError } = await fastify.supabase
                    .from("dock_bays")
                    .update({ 
                        status: newStatus,
                        status_changed_at: NOW
                    })
                    .eq("id", dock_bay_id); //WHERE clause

                if (updateError) {
                    console.error(updateError);
                    return reply.code(500).send({ error: "Failed to update dock bay status" });
                }

                // Broadcast status update to cards on dashboard - realtime 
                broadcaster.broadcast({
                    type: "dock_status_update",
                    payload: {
                        dock_bay_id,
                        old_status: oldStatus,
                        new_status: newStatus,
                        event_type,
                        status_changed_at: NOW
                    }
                });
                
                // DOCK BAY UPDATED TO OCCUPIED
                if (oldStatus === "idle" && newStatus === "occupied") {
                    actionType = "dock marked occupied";
                    
                    // update currLoad_started_at value to NOW()
                    const { error: timeError } = await fastify.supabase
                    .from("dock_bays")
                    .update({ 
                        currLoad_started_at: NOW
                    })
                    .eq("id", dock_bay_id); //WHERE clause
                    if (timeError) {
                        console.error(timeError);
                        return reply.code(500).send({ error: "Failed to update last occupied time" });
                    }
                }
                
                let turnoverTime = null;

                // DOCK BAY UPDATED TO IDLE
                if (oldStatus === "occupied" && newStatus === "idle") {
                    actionType = "dock marked idle";
                    // compute duration of turnover
                    if(dockBay && dockBay.currLoad_started_at){
                        //get time the load started then compute
                        const startedLoad = new Date(dockBay.currLoad_started_at);
                        if (!isNaN(startedLoad.getTime())) {
                            turnoverTime = (new Date(NOW).getTime() - startedLoad.getTime()) / 1000;
                        }
                    }

                    // Broadcast turnover
                    broadcaster.broadcast({
                        type: "dock_turnover",
                        payload: {
                            dock_bay_id: dock_bay_id,
                            duration: turnoverTime
                        }
                    });
                }


                // Insert dock bay history row
                const { error: historyError } = await fastify.supabase
                    .from("dock_bay_history")
                    .insert({
                        dock_bay_id,
                        old_status: oldStatus,
                        new_status: newStatus,
                        reason: event_type,
                        event_id: event.id
                    });

                if (historyError) {
                    console.error(historyError);
                    return reply.code(500).send({ error: "Failed to insert dock bay history" });
                }
            }

            // Log action (always do this)
            const { error: actionError } = await fastify.supabase
                .from("actions")
                .insert({
                    event_id: event.id,
                    dock_bay_id,
                    action_type: actionType ?? "no_action",
                    payload: {
                    oldStatus,
                    newStatus,
                    event_type
                    }
                });

            if (actionError) {
                console.error(actionError);
                return reply.code(500).send({ error: "Failed to insert backend action" });
            }

            // Respond to caller (Postman)
            return reply.send({
                status: "ok",
                event_id: event.id,
                old_status: oldStatus,
                new_status: newStatus,
                action: actionType
            });

        } catch (err) {
            console.error("SERVER ERROR:", err);
            reply.code(500).send({ error: "Server error" });
        }
    });
};