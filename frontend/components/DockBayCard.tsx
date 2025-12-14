"use client";
import { useEffect, useState } from "react";
import styles from "./DockBayCard.module.css";

interface DockBayCardProps {
  id: string;
  friendly_id: number;
  name: string;
  status: string;
  status_changed_at?: string;
  onClick: () => void;
}

export default function DockBayCard({ id, friendly_id, name, status, status_changed_at, onClick }: DockBayCardProps) {
  // Keep track of time since status change
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    // If dock is not occupied or missing timestamp → no timer needed
    if (status !== "occupied" || !status_changed_at) {
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
    <div className={`${styles.bay} ${status === 'occupied' ? styles["active-border"] : ''}`} onClick={onClick}>
        <div className="apart">
            <div className={styles["bay-name"]}>{name}</div>
            <div className={styles["bay-status"]}>
                <div className={`${styles["open-time"]} ${status === 'occupied' ? 'active-font' : 'inactive-font'}`}>
                    {elapsed}
                </div>
            </div>
        </div>
        <div className={styles.hist}><span>see info</span></div>
    </div>
  );
}