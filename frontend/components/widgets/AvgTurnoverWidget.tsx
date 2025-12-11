"use client";
import { useEffect, useState } from "react";
import InfoWidget from "../InfoWidget";
import Image from "next/image";
import avg from "@/public/avg-time-icon.png";


export default function AvgTurnoverWidget() {
    const [avgTurnover, setAvgTurnover] = useState<number | null>(null);

    useEffect(() => {
        // Listen for turnover messages from the websocket
        const ws = new WebSocket("wss://dockview.onrender.com/ws");

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "dock_turnover") {
                const payload = msg.payload;
                // payload.duration expected to be seconds (number)
                setAvgTurnover(typeof payload.duration === "number" ? payload.duration : null);
            }
        };

        return () => ws.close();
    }, []);

    function formatDuration(seconds: number | null) {
        if (seconds === null || isNaN(seconds)) return "—";
        const total = Math.max(0, seconds);
        let mins = Math.floor(total / 60);
        let secs = Math.round(total - mins * 60);
        if (secs === 60) {
            mins += 1;
            secs = 0;
        }
        if (mins > 0) {
            return `${mins} mins ${secs} secs`;
        }
        return `${secs} secs`;
    }

    return (
        <InfoWidget
            icon={
                <Image
                    src={avg}
                    alt="Average Turnover Icon"
                    width={400}
                    height={400}
                    priority
                />
            }
            iconColor="#f59e0b"
            title="LAST TURNOVER"
            value={formatDuration(avgTurnover)}
        />
    );
}