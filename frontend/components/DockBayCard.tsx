"use client";
import { useEffect, useState } from "react";
import styles from "./DockBayCard.module.css";
import Sensors from "@/components/Sensors";

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
  // Keep track of time since status change
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {

    // If dock is not occupied or missing timestamp → no timer needed
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

    // Update immediately + then every second
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [status, status_changed_at]);

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

      <Sensors
        dock_bay={id}
      />
    </div>
  );
}