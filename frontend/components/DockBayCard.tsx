"use client";
import styles from "./DockBayCard.module.css";
import DockBay from "@/components/DockGridCont";

interface DockBayCardProps {
  id: number;
  friendly_id: number;
  name: string;
  status: string;
  created_at?: string;
}

export default function DockBayCard({ id, friendly_id, name, status, created_at }: DockBayCardProps) {
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