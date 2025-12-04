const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");

// CORS for now (we'll restrict later)
fastify.register(cors, {
  origin: "*"
});

// Test route
fastify.get("/", async () => {
  return { message: "Backend running!" };
});

// Required for Render:
const PORT = process.env.PORT || 3001;

fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) throw err;
  console.log("My own server running on port", PORT);
});

// ------------ READ ALL MESSAGES ------------
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
