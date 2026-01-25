"use client";
import { useEffect, useState } from "react";
import styles from "./DockBayCard.module.css";
import Sensors from "@/components/Sensors";
import { Sensor } from "@/types/interfaces";
import { fetchSensorsByDockID } from "@/lib/api";
import { createSupabaseClient } from "@/lib/supabaseClient";

interface DockBayCardProps {
  id: string;
  friendly_id: number;
  name: string;
  status: string;
  status_changed_at?: string;
  onClick: () => void;
  isSelected: boolean;
}

export default function DockBayCard({ id, friendly_id, name, status, status_changed_at, onClick, isSelected}: DockBayCardProps) {
  const [elapsed, setElapsed] = useState("00:00:00");
  const [sensors, setSensors] = useState<Sensor[]>([]);

  // Timer effect (unchanged)
  useEffect(() => {
    if (status !== 'occupied' || !status_changed_at) {
      setElapsed("closed");
      return;
    }

    function updateElapsed() {
      const start = new Date(status_changed_at!).getTime();
      const now = Date.now();
      const diff = now - start;

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setElapsed(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`
      );
    }

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [status, status_changed_at]);

  // NEW: Sensors fetch + realtime subscription
  useEffect(() => {
    if (!id) return;

    console.log('🔵 Setting up realtime for dock_bay:', id);
    const supabase = createSupabaseClient();

    // Initial fetch of sensors for this dock bay
    const initData = async () => {
      const initSensors = await fetchSensorsByDockID(id);
      console.log('📊 Initial sensors loaded for', name, ':', initSensors);
      setSensors(initSensors);
    };
    initData();

    // Subscribe to realtime updates for sensors in THIS dock bay only
    const channel = supabase
      .channel(`dock-sensors-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sensors',
          filter: `dock_bay_id=eq.${id}`
        },
        (payload) => {
          console.log('🔴 Sensor updated in', name, ':', payload.new);
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
        console.log('✅ Subscription status for', name, ':', status);
      });

    // Cleanup subscription when component unmounts
    return () => {
      console.log('🔌 Unsubscribing from', name);
      supabase.removeChannel(channel);
    };
  }, [id, name]);

  return (
    <div 
      className={`
        nested-widget
        row apart
        ${styles.bay} 
        ${status === 'occupied' ? styles.activeBorder : ''}
        ${isSelected ? 'selected' : ''}
      `}
      onClick={onClick}
    >
      <div className="stack gap5">
        <div className={styles.bayName}>{name}</div>
        <div className={styles.bayStatus}>
            <div className={`${styles.openTime} ${status === 'occupied' ? 'active-font' : 'inactive-font'}`}>
                {elapsed}
            </div>
        </div>
      </div>

      <Sensors sensors={sensors} />
    </div>
  );
}