"use client";
import { useEffect, useRef } from "react";
import { WebSocketMessage } from "@/types/websocketTypes";

type Handlers = {
    dock_status_update?: (payload: any) => void;
    load_completed?: (payload: any) => void;
    sensor_event?: (payload: any) => void;
};

export default function useWebSocket(handlers: Handlers) {
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket("wss://dockview.onrender.com/ws");
        wsRef.current = ws;

        ws.onopen = () => console.log("WS Connected");

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data) as WebSocketMessage;
            console.log("WS message:", msg);

            // message dispatcher
            if (msg.type == "dock_status_update") {
                handlers.dock_status_update?.(msg.payload);
            }
            else if(msg.type == "load_completed") {
                handlers.load_completed?.(msg.payload);
            }
            else{
                console.warn("Unknown WS message:", msg);
            }
        };

        ws.onclose = () => console.log("WS disconnected");
        ws.onerror = (err) => console.error("WS ERROR:", err);

        return () => ws.close();
    }, [handlers]);

    return wsRef;
}
