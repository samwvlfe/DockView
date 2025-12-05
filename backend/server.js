const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// CORS
fastify.register(cors, { origin: "*" });

// Test route
fastify.get("/", async () => {
  return { message: "Backend is running on Render!" };
});

// READ messages
fastify.get("/messages", async () => {
  const { data, error } = await supabase
    .from("messages")
    .select("*");

  if (error) {
    console.error(error);
    return { error: "Failed to fetch messages" };
  }
  return { messages: data };
});

// POST Sensor Data
fastify.post("/sensor", async (request, reply) => {
  try {
    const { sensor_id, dock_bay_id, event_type, payload } = request.body;

    // Validate input
    if (!sensor_id || !dock_bay_id || !event_type) {
      return reply.code(400).send({ error: "Missing required fields" });
    }

    // Look up sensor
    const { data: sensor, error: sensorError } = await supabase
      .from("sensors")
      .select("*")
      .eq("id", sensor_id)
      .single();

    if (sensorError || !sensor) {
      return reply.code(404).send({ error: "Sensor not found" });
    }

    // Look up dock bay to get CURRENT status
    const { data: dockBay, error: dockBayError } = await supabase
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
    const { data: event, error: eventError } = await supabase
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

    if (event_type === "leveler_state") {  //add more event_types for different sensor actions
      newStatus = payload.open ? "occupied" : "idle";
      actionType = "update_status";

      // Update dock bay status
      const { error: updateError } = await supabase
        .from("dock_bays")
        .update({ status: newStatus })
        .eq("id", dock_bay_id);

      if (updateError) {
        console.error(updateError);
        return reply.code(500).send({ error: "Failed to update dock bay status" });
      }

      // Insert dock bay history row
      const { error: historyError } = await supabase
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
    const { error: actionError } = await supabase
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



// Render requirement
const PORT = process.env.PORT || 3001;
fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) throw err;
  console.log("Server running on port", PORT);
});
