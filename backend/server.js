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
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return { error: "Failed to fetch messages" };
  }

  return { messages: data };
});

// Render requirement
const PORT = process.env.PORT || 3001;
fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) throw err;
  console.log("Server running on port", PORT);
});
