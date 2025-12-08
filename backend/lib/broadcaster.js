// Allow broadcasting messages to all connected WebSocket clients

const clients = new Set();

function addClient(connection) {
    clients.add(connection);
}

function removeClient(connection) {
    clients.delete(connection);
}

function broadcast(msg) {
    const payload = JSON.stringify(msg);
    for (const client of clients) {
        try {
            client.socket.send(payload);
        } catch (err) {
            console.error("WebSocket send error:", err);
        }
    }
}

module.exports = {
    addClient,
    removeClient,
    broadcast,
};