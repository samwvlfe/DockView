"use client";
import { useEffect, useState } from "react";
import InfoWidget from "../InfoWidget";
import Image from "next/image";
import comp from "@/public/completed-icon.png";
import { fetchLoadsCompleted } from "@/lib/api";

export default function LoadsCompletedWidget() {
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        async function fetchLoadsCompletedData() {
            try {
                const data = await fetchLoadsCompleted();
                setCount(data.length);
            } catch (error) {
                console.error("Error fetching loads completed:", error);
            }
        }

        // Initial fetch
        fetchLoadsCompletedData();

        // Set interval to fetch periodically
        //change to connect to web socket later
        const interval = setInterval(fetchLoadsCompletedData, 15000); 
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