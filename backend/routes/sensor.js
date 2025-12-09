// POST Sensor Data

const broadcaster = require("../lib/broadcaster");

module.exports = async function (fastify, opts) {
    fastify.post("/sensor", async (request, reply) => {
        try {
            const { sensor_id, dock_bay_id, event_type, payload } = request.body;

            // Validate input
            if (!sensor_id || !dock_bay_id || !event_type) {
                return reply.code(400).send({ error: "Missing required fields" });
            }

            // Look up sensor
            const { data: sensor, error: sensorError } = await fastify.supabase
                .from("sensors")
                .select("*")
                .eq("id", sensor_id)
                .single();

            if (sensorError || !sensor) {
                return reply.code(404).send({ error: "Sensor not found" });
            }

            // Look up dock bay to get CURRENT status
            const { data: dockBay, error: dockBayError } = await fastify.supabase
                .from("dock_bays")
                .select("*")
                .eq("id", dock_bay_id)
                .single();

            if (dockBayError || !dockBay) {
                return reply.code(404).send({ error: "Dock bay not found" });
            }

            //store current associated dock bay status
            const oldStatus = dockBay.status;
            let newStatus = oldStatus;

            // Create sensor event in DB
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

            // Decide what event means
            let actionType = null;

            if (event_type === "manual change - POST") {  //add more event_types for different sensor actions
                newStatus = payload.open ? "occupied" : "idle";
                actionType = "update_status";

                // Update dock bay status
                const { error: updateError } = await fastify.supabase
                    .from("dock_bays")
                    .update({ 
                        status: newStatus,
                        status_changed_at: new Date().toISOString()
                     })
                    .eq("id", dock_bay_id);

                if (updateError) {
                    console.error(updateError);
                    return reply.code(500).send({ error: "Failed to update dock bay status" });
                }

                // Broadcast update via WebSocket
                broadcaster.broadcast({
                    dock_bay_id,
                    old_status: oldStatus,
                    new_status: newStatus,
                    event_type,
                    status_changed_at: new Date().toISOString()
                });

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