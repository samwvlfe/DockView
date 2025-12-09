"use client";
import { useEffect, useState } from "react";
import InfoWidget from "../InfoWidget";
import Image from "next/image";
import comp from "@/public/completed-icon.png";

export default function LoadsCompletedWidget() {
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        async function fetchLoadsCompleted() {
            try{
                const res = await fetch("https://dockview.onrender.com/api/stats/loadsCompleted");
                if(!res.ok){
                    throw new Error("Failed to fetch loads completed");
                }
                const data = await res.json();
                setCount(data.length);
            } catch (error) {
                console.error("Error fetching loads completed:", error);
            }
        }
        const interval = setInterval(fetchLoadsCompleted, 15000); // update every 15 sec
        return () => clearInterval(interval);

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
            value={count}
        />
    );
}