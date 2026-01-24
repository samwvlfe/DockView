"use client"
import { useEffect, useState } from "react"
import styles from "./DockBayCard.module.css";
import { Sensor } from "@/types/interfaces";
import { fetchSensors } from "@/lib/api";

interface SensorProps {
    dock_bay: string | null;
}

export default function Sensors({ dock_bay }: SensorProps){
    // sensor data
    const [theseSensors, setSensors] = useState<Sensor[]>([]);
    console.log("id: ", dock_bay);
    
    useEffect(() => {
        const initData = async () => {
            //load sensors
            const initSensors = await fetchSensors();
            setSensors(initSensors);
        };
        initData();
        
    }, [])

    return (
        <div className={`${styles.sensorCont} stack`}>
        <div className={`row center gap5`}>
          <div className={`${styles.sensStatus} sensorColActive`}></div>
          <div className={styles.sensName}>Truck Restrained</div>
        </div>
        <div className={`row center gap5`}>
          <div className={`${styles.sensStatus} sensorColActive`}></div>
          <div className={styles.sensName}>Door Open</div>
        </div>
        <div className={`row center gap5`}>
          <div className={`${styles.sensStatus} sensorColActive`}></div>
          <div className={styles.sensName}>Leveler Deployed</div>
        </div>
      </div>
    )
}