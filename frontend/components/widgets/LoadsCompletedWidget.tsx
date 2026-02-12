"use client";
import { useEffect, useState } from "react";
import InfoWidget from "../InfoWidget";
import Image from "next/image";
import comp from "@/public/completed-icon.png";
import { fetchLoadsCompleted } from "@/lib/api";

export default function LoadsCompletedWidget() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Initially fetch from DB
        fetchLoadsCompleted().then(data => {
            setCount(data.length);
        });
        //connect to websocket for real-time updates
        const ws = new WebSocket("wss://dockview.onrender.com/ws");

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if(msg.type === "load_completed"){
                setCount(prevCount => prevCount + 1);
            }
        };

        return () => ws.close();
    }, []);

    return (
        <InfoWidget
            icon={
                <Image
                    src={comp}
                    alt="Loads Completed Icon"
                    width={400}
                    height={400}
                    priority
                />
            }
            iconColor="#14b8a6"
            title="LOADS COMPLETED"
            value= {count}
        />
    );
}