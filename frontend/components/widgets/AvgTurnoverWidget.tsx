"use client";
import { useEffect, useState } from "react";
import InfoWidget from "../InfoWidget";
import Image from "next/image";
import avg from "@/public/avg-time-icon.png";


export default function AvgTurnoverWidget() {
    const [avgTurnover, setAvgTurnover] = useState<string>("")

    useEffect(() => {
        // Listen for turnover messages from the websocket
        const ws = new WebSocket("wss://dockview.onrender.com/ws");

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "dock_turnover") {
                const payload = msg.payload;
                // payload.duration expected to be seconds (number)
                setAvgTurnover(payload.duration);
            }
        };

        return () => ws.close();
    }, []);

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
            value= {avgTurnover}
        />
    );
}