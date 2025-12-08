// Use lib/broadcaster to manage WebSocket clients and broadcasting

module.exports = async function (fastify, opts) {
    const broadcaster = require("../lib/broadcaster");

    // WebSocket endpoint
    fastify.get("/ws", { websocket: true }, (connection, req) => {
        broadcaster.addClient(connection);

        connection.socket.on("close", () => {
            broadcaster.removeClient(connection);
        });
    });
};