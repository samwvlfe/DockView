"use client";
import { useEffect } from "react";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { WebSocketMessage } from "@/types/websocketTypes";

type MessageType = WebSocketMessage["type"];
type Handlers = Partial<Record<MessageType, (payload: any) => void>>;

export default function useWebSocket(handlers: Handlers) {
    const { subscribe, unsubscribe } = useWebSocketContext();

    useEffect(() => {
        const entries = Object.entries(handlers) as [MessageType, (payload: any) => void][];

        for (const [type, cb] of entries) {
            subscribe(type, cb);
        }

        return () => {
            for (const [type, cb] of entries) {
                unsubscribe(type, cb);
            }
        };
    }, [handlers, subscribe, unsubscribe]);
}
