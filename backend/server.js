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

fastify.post("/sensor", async (request, reply) => {
  try {
    const { sensor_id, dock_bay_id, event_type, payload } = request.body;

    if (!sensor_id || !dock_bay_id || !event_type) {
      return reply.code(400).send({ error: "Missing required fields" });
    }

    // Get sensor
    const { data: sensor, error: sensorError } = await supabase
      .from("sensors")
      .select("*")
      .eq("id", sensor_id)
      .single();

    if (sensorError || !sensor) {
      return reply.code(404).send({ error: "Sensor not found" });
    }

    // Create sensor event
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

    // Update dock bay status
    let oldStatus = null;
    let newStatus = null;

    if (event_type === "leveler_state") {
      oldStatus = sensor.status;
      newStatus = payload.open ? "occupied" : "idle";

      await supabase
        .from("dock_bays")
        .update({ status: newStatus })
        .eq("id", dock_bay_id);

      // Insert history
      await supabase.from("dock_bay_history").insert({
        dock_bay_id,
        old_status: oldStatus,
        new_status: newStatus,
        reason: "leveler_state",
        event_id: event.id
      });
    }

    // Log backend action
    await supabase.from("actions").insert({
      event_id: event.id,
      dock_bay_id,
      action_type: "leveler_state_change",
      payload: { oldStatus, newStatus }
    });

    return reply.send({
      status: "ok",
      event_id: event.id,
      old_status: oldStatus,
      new_status: newStatus
    });

  } catch (err) {
    console.error(err);
    reply.code(500).send({ error: "Server error" });
  }
});


// Render requirement
const PORT = process.env.PORT || 3001;
fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) throw err;
  console.log("Server running on port", PORT);
});
