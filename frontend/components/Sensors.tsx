"use client"
import { useEffect, useState, useCallback, useMemo } from "react";
import styles from "./DockBayCard.module.css";
import { Sensor } from "@/types/interfaces";
import useWebSocket from "@/hooks/useWebSocket";

interface SensorProps {
    dock_bay: string | null;
    sensors: Sensor[];
}

export default function Sensors({ dock_bay, sensors }: SensorProps) {

    const [theseSensors, setSensors] = useState<Sensor[]>([]);

    useEffect(() => {
        setSensors(sensors);
    }, [sensors]);

    const handleSensorUpdated = useCallback((payload: any) => {
        if (payload.dock_bay_id !== dock_bay) return;
        setSensors(prev =>
            prev.map(sensor =>
                sensor.id === payload.sensor_id
                    ? {
                        ...sensor,
                        sensor_state: payload.sensor_state,
                        sensor_type: payload.sensor_type
                    }
                    : sensor
            )
        );
    }, [dock_bay]);

    const wsHandlers = useMemo(() => ({
        sensor_updated: handleSensorUpdated,
    }), [handleSensorUpdated]);

    useWebSocket(wsHandlers);

    return (
    <div className={`${styles.sensorCont} stack`}>
        {theseSensors.length === 0 ? (
            <div>No sensors found</div>
        ) : (
            theseSensors.slice().reverse().map((s) => (
                <div key={s.id} className={`row center gap5`}>
                    <div
                        className={`${styles.sensStatus} ${
                            s.sensor_state ? 'sensorColActive' : 'sensorColInactive'
                        }`}
                    ></div>
                    <div className={styles.sensName}>
                        {s.sensor_type}
                    </div>
                </div>
            ))
        )}
    </div>
);
}
