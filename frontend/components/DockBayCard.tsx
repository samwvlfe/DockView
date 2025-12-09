"use client";
import styles from "./DockBayCard.module.css";

interface DockBayCardProps {
  name: string;
  status: string;
  // other props as needed (timer value)
}

export default function DockBayCard({ name, status }: DockBayCardProps) {
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