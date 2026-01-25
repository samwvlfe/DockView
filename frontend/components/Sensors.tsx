"use client"
import styles from "./DockBayCard.module.css";
import { Sensor } from "@/types/interfaces";

interface SensorProps {
    sensors: Sensor[];
}

export default function Sensors({ sensors }: SensorProps) {
    return (
        <div className={`${styles.sensorCont} stack`}>
            {sensors.length === 0 ? (
                <div>No sensors found</div>
            ) : (
                sensors.map((sensor) => (
                    <div key={sensor.id} className={`row center gap5`}>
                        <div 
                            className={`${styles.sensStatus} ${
                                sensor.sensor_state ? 'sensorColActive' : 'sensorColInactive'
                            }`}
                        ></div>
                        <div className={styles.sensName}>
                            {sensor.sensor_type}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}