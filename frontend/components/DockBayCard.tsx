"use client";
import { useState } from "react";
import styles from "./DockBayCard.module.css";

interface DockBayCardProps {
  id: number;
  friendly_id: number;
  name: string;
  status: string;
  status_changed_at: string;
}

export default function DockBayCard({ id, friendly_id, name, status, status_changed_at }: DockBayCardProps) {
  // Keep track of time since status change
  const [elapsed, setElapsed] = useState("00:00:00");
  return (
    <div className={`${styles.bay} ${status === 'occupied' ? styles["active-border"] : ''}`}>
        <div className="apart">
            <div className={styles["bay-name"]}>{name}</div>
            <div className={styles["bay-status"]}>
                <div className={`${styles["open-time"]} ${status === 'occupied' ? 'active-font' : 'inactive-font'}`}>
                    {status === 'occupied' ? '00:99:99' : 'closed'}
                </div>
            </div>
        </div>
        <div className={styles.hist}><span>see history</span></div>
    </div>
  );
}