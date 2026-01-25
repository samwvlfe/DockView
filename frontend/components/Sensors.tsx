"use client"
import { useEffect, useState } from "react"
import styles from "./DockBayCard.module.css";
import { Sensor } from "@/types/interfaces";
import { fetchSensorsByDockID } from "@/lib/api";
import { createSupabaseClient } from "@/lib/supabaseClient";

interface SensorProps {
    dock_bay: string | null;
}

export default function Sensors({ dock_bay }: SensorProps){
    const [theseSensors, setSensors] = useState<Sensor[]>([]);

    useEffect(() => {
        if (!dock_bay) return;

        console.log('🔵 Setting up realtime for dock_bay:', dock_bay);
        const supabase = createSupabaseClient();

        const initData = async () => {    
            const initSensors = await fetchSensorsByDockID(dock_bay);
            setSensors(initSensors);
        };
        initData();
        
        // Subscribe to real-time updates
        const channel = supabase
            .channel(`sensors-${dock_bay}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'sensors',
                    filter: `dock_bay_id=eq.${dock_bay}`
                },
                (payload) => {
                    console.log('🔴 REALTIME UPDATE RECEIVED:', payload);
                    console.log('Event type:', payload.eventType);
                    console.log('New data:', payload.new);
                    console.log('Old data:', payload.old);

                    // Update the specific sensor in state
                    setSensors(prev => 
                        prev.map(sensor => 
                            sensor.id === payload.new.id 
                                ? { ...sensor, ...payload.new as Sensor }
                                : sensor
                        )
                    );
                }
            )
            .subscribe((status) => {
                console.log('Subscription Status:', status);
            });

        // Cleanup subscription on unmount
        return () => {
            console.log('UNSubscribing');
            supabase.removeChannel(channel);
        };

    }, [dock_bay])

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