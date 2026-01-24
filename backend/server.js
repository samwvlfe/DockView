if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");

// Register plugins
fastify.register(cors, { origin: "*" });
fastify.register(require("./plugins/supabase"));

// WebSocket route
fastify.register(require("@fastify/websocket"));

// Register routes
fastify.register(require("./routes/ws"));
fastify.register(require("./routes/sensors"));
fastify.register(require("./routes/sensors/all"));
fastify.register(require("./routes/docks"));
fastify.register(require("./routes/index"));
fastify.register(require("./routes/messages"));
fastify.register(require("./routes/controller"));



// Start server
const PORT = process.env.PORT || 3001;
fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) throw err;
  console.log("Server running on port", PORT);
});
