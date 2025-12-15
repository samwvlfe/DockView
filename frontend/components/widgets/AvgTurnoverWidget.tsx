"use client";
import { useEffect, useState } from "react";
import InfoWidget from "../InfoWidget";
import Image from "next/image";
import avg from "@/public/avg-time-icon.png";
import { secondsToHuman } from "@/lib/helpers";
import { fetchAvgTurnoverTime } from "@/lib/api";
import { AvgTurnoverResponse } from "@/types/interfaces";


export default function AvgTurnoverWidget() {
    const [avgTurnover, setAvgTurnover] = useState("0s");
    const [turnoverCount, setTurnoverCount] = useState(0);
    const [runningSecs, setRunningSecs] = useState(0);
    //eventually have options for user to select between day/week
    const [days, setDays] = useState("1");

    // Fetch avg when days changes
    useEffect(() => {
        fetchAvgTurnoverTime(days).then((data: AvgTurnoverResponse) => {
            setRunningSecs(data.avg_turnover_time ?? 0);
            setAvgTurnover(data.avg_turnover_time ? secondsToHuman(data.avg_turnover_time) : "0s" );
            setTurnoverCount(data.turnover_count ?? 0);
        });
    }, [days]);

    // WebSocket: connect ONCE
    useEffect(() => {
        const ws = new WebSocket("wss://dockview.onrender.com/ws");

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);

            if (msg.type === "dock_turnover") {
                const duration = msg.payload.duration;

                setRunningSecs((prevAvg) => {
                    setTurnoverCount((prevCount) => {
                        const newAvg =(prevAvg * prevCount + duration) / (prevCount + 1);
                        setAvgTurnover(secondsToHuman(newAvg));
                        return prevCount + 1;
                    });

                    return prevAvg; // updated via count callback
                });
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