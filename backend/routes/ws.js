//Websocket route to broadcast updates to clients
module.exports = async function (fastify, opts) {
  const clients = new Set(); // store connected clients

  // WebSocket endpoint
  fastify.get("/ws", { websocket: true }, (connection, req) => {
    clients.add(connection);

    connection.socket.on("close", () => {
      clients.delete(connection);
    });
  });

  // Broadcast helper function
  fastify.decorate("broadcast", (msg) => {
    for (const client of clients) {
      client.socket.send(JSON.stringify(msg));
    }
  });
};
