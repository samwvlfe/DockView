"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import InfoWidget from "../InfoWidget";
import Image from "next/image";
import comp from "@/public/completed-icon.png";
import { fetchLoadsCompleted } from "@/lib/api";
import useWebSocket from "@/hooks/useWebSocket";

export default function LoadsCompletedWidget() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        fetchLoadsCompleted().then(data => {
            setCount(data.length);
        });
    }, []);

    const handleLoadCompleted = useCallback(() => {
        setCount(prevCount => prevCount + 1);
    }, []);

    const wsHandlers = useMemo(() => ({
        load_completed: handleLoadCompleted,
    }), [handleLoadCompleted]);

    useWebSocket(wsHandlers);

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
