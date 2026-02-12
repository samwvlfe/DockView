"use client"
import { useEffect, useState } from "react";
import styles from "./DockBayCard.module.css";
import { Sensor } from "@/types/interfaces";

interface SensorProps {
    dock_bay: string | null;
    sensors: Sensor[];
}

export default function Sensors({ dock_bay, sensors }: SensorProps) {

    const [theseSensors, setSensors] = useState<Sensor[]>([]);

    useEffect(() => {
        setSensors(sensors);
    }, [sensors]);

    useEffect(() => {
        if (!dock_bay) return;

        // Connect to WebSocket
        const ws = new WebSocket(`${process.env.WEBSOCKET_URL}`);

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            
            // Only handle sensor updates for THIS dock bay
            if (msg.type === "sensor_updated" && msg.payload.dock_bay_id === dock_bay) {                
                setSensors(prev => 
                    prev.map(sensor => 
                        sensor.id === msg.payload.sensor_id 
                            ? { 
                                ...sensor, 
                                sensor_state: msg.payload.sensor_state,
                                sensor_type: msg.payload.sensor_type
                            }
                            : sensor
                    )
                );
            }
        };

        ws.onerror = (err) => console.error("WS ERROR:", err);
        ws.onclose = () => console.log(`WS Disconnected for dock ${dock_bay}`);

        // Cleanup on unmount
        return () => {
            console.log(`Closing WS for dock ${dock_bay}`);
            ws.close();
        };
    }, [dock_bay]);


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