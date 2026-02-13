"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import InfoWidget from "../InfoWidget";
import Image from "next/image";
import avgIcon from "@/public/avg-time-icon.png";
import { fetchAvgLoadTime } from "@/lib/api";
import { DockBay } from "@/types/interfaces";
import useWebSocket from "@/hooks/useWebSocket";

interface AvgLoadTimeWidgetProps {
    docks: DockBay[];
}

export default function AvgLoadTimeWidget({ docks }: AvgLoadTimeWidgetProps) {
    const [avgSeconds, setAvgSeconds] = useState<number>(0);

    useEffect(() => {
        fetchAvgLoadTime().then(data => {
            setAvgSeconds(data.avgSeconds);
        });
    }, []);

    // Refetch average when a new load completes
    const handleLoadCompleted = useCallback(() => {
        fetchAvgLoadTime().then(data => {
            setAvgSeconds(data.avgSeconds);
        });
    }, []);

    const wsHandlers = useMemo(() => ({
        load_completed: handleLoadCompleted,
    }), [handleLoadCompleted]);

    useWebSocket(wsHandlers);

    // Format seconds as "Xh Ym" or "Xm" or "--"
    const formatAvg = (totalSeconds: number): string => {
        if (totalSeconds <= 0) return "--";
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        if (mins > 0) return `${mins}m`;
        return `${totalSeconds}s`;
    };

    return (
        <InfoWidget
            icon={
                <Image
                    src={avgIcon}
                    alt="Avg Load Time Icon"
                    width={400}
                    height={400}
                    priority
                />
            }
            iconColor="#8b5cf6"
            title="AVG LOAD TIME"
            value={formatAvg(avgSeconds)}
        />
    );
}
