"use client";
import { createContext, useContext, useEffect, useRef, useCallback } from "react";
import { WebSocketMessage } from "@/types/websocketTypes";

type MessageType = WebSocketMessage["type"];
type Callback = (payload: any) => void;

interface WebSocketContextValue {
    subscribe: (type: MessageType, cb: Callback) => void;
    unsubscribe: (type: MessageType, cb: Callback) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const listenersRef = useRef<Map<MessageType, Set<Callback>>>(new Map());
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket("wss://dockview.onrender.com/ws");
        wsRef.current = ws;

        ws.onopen = () => console.log("WS Connected");

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data) as WebSocketMessage;
            const callbacks = listenersRef.current.get(msg.type);
            if (callbacks) {
                callbacks.forEach((cb) => cb(msg.payload));
            }
        };

        ws.onclose = () => console.log("WS Disconnected");
        ws.onerror = (err) => console.error("WS Error:", err);

        return () => ws.close();
    }, []);

    const subscribe = useCallback((type: MessageType, cb: Callback) => {
        const map = listenersRef.current;
        if (!map.has(type)) map.set(type, new Set());
        map.get(type)!.add(cb);
    }, []);

    const unsubscribe = useCallback((type: MessageType, cb: Callback) => {
        listenersRef.current.get(type)?.delete(cb);
    }, []);

    return (
        <WebSocketContext.Provider value={{ subscribe, unsubscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocketContext() {
    const ctx = useContext(WebSocketContext);
    if (!ctx) throw new Error("useWebSocketContext must be used within WebSocketProvider");
    return ctx;
}
