"use client"
import { useEffect, useState } from "react"
import styles from "./DockBayCard.module.css";
import { Sensor } from "@/types/interfaces";
import { fetchSensorsByDockID } from "@/lib/api";

interface SensorProps {
    dock_bay: string | null;
}

export default function Sensors({ dock_bay }: SensorProps){
    const [theseSensors, setSensors] = useState<Sensor[]>([]);

    useEffect(() => {
        const initData = async () => {
            if (!dock_bay) return;
            
            const initSensors = await fetchSensorsByDockID(dock_bay);
            setSensors(initSensors);
        };
        initData();
        
    }, [dock_bay]) // Add dock_bay to dependency array

    // Helper function to get friendly sensor names
    // const getSensorDisplayName = (sensorType: string) => {
    //     const nameMap: Record<string, string> = {
    //         'truck_restrained': 'Truck Restrained',
    //         'door_open': 'Door Open',
    //         'leveler_deployed': 'Leveler Deployed',
    //         // Add more mappings as needed
    //     };
    //     return nameMap[sensorType] || sensorType;
    // };

    return (
        <div className={`${styles.sensorCont} stack`}>
            {theseSensors.length === 0 ? (
                <div>No sensors found</div>
            ) : (
                theseSensors.map((sensor) => (
                    <div key={sensor.id} className={`row center gap5`}>
                        <div 
                            className={`${styles.sensStatus} ${
                                sensor.sensor_state ? 'sensorColActive' : 'sensorColInactive'
                            }`}
                        ></div>
                        <div className={styles.sensName}>
                            {sensor.sensor_type}
                            {/* {getSensorDisplayName(sensor.sensor_type)} */}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}