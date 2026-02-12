interface WebSocketMessage {
    [key: string]: unknown;
}

export function connectWebSocket(onMessage: (message: WebSocketMessage) => void): WebSocket {
    const ws = new WebSocket(`wss:${process.env.BASE_URL}/ws`);
    ws.onmessage = (event: MessageEvent<string>) => onMessage(JSON.parse(event.data));
    return ws;
}
