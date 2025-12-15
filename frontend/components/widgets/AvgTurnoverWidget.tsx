"use client";
import { useEffect, useState } from "react";
import InfoWidget from "../InfoWidget";
import Image from "next/image";
import avg from "@/public/avg-time-icon.png";
import { fetchAvgTurnoverTime } from "@/lib/api";


export default function AvgTurnoverWidget() {
    const [avgTurnover, setAvgTurnover] = useState<string>("")
    //eventually have options for user to select between day/week
    const [days, setDays] = useState<string>("1");

    useEffect(() => {
        //fetch last recorded turnover from DB first
        fetchAvgTurnoverTime(days).then(data => {
            setAvgTurnover(data);
        })

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