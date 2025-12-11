"use client";
import { useEffect, useState } from "react";
import InfoWidget from "../InfoWidget";
import Image from "next/image";
import avg from "@/public/avg-time-icon.png";


export default function AvgTurnoverWidget() {
    const [avgTurnover, setAvgTurnover] = useState(0);

    useEffect(() => {
        //Initially fetch from DB
        //create API to fetch the avg turnover for the day
        // turnover data for today? average of it : 0
        const ws = new WebSocket("wss://dockview.onrender.com/ws");

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if(msg.type === "dock_turnover"){
                setAvgTurnover(msg.payload.turnover);
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
            title="AVERAGE TURNOVER"
            value={avgTurnover + " secs"}
        />
    );
}