interface WebSocketMessage {
    [key: string]: unknown;
}

export function connectWebSocket(onMessage: (message: WebSocketMessage) => void): WebSocket {
    const ws = new WebSocket("wss://YOUR_BACKEND/ws");
    ws.onmessage = (event: MessageEvent<string>) => onMessage(JSON.parse(event.data));
    return ws;
}
