"use client";
import { useEffect, useState } from "react";
import styles from "./DockBayCard.module.css";
import Sensors from "@/components/Sensors";
import { Sensor } from "@/types/interfaces";
import { fetchSensorsByDockID } from "@/lib/api";
import { dockCardClass } from "@/lib/helpers/ClassSetter"

interface DockBayCardProps {
  id: string;
  name: string;
  status: string;
  fsm_state: string;
  status_changed_at?: string;
  onClick: () => void;
  isSelected: boolean;
}

export default function DockBayCard({ id, name, status, fsm_state, status_changed_at, onClick, isSelected}: DockBayCardProps) {
  const [elapsed, setElapsed] = useState("00:00:00");
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [classes, setClasses] = useState("");

  // Classes effect
  useEffect(() => {
    setClasses(dockCardClass(status, fsm_state) || "");
    console.log("set class: ", dockCardClass(status, fsm_state));
  }, [status, fsm_state]);

  // Fetch sensors effect
  useEffect(() => {
    const initData = async () => {
      const initSensors = await fetchSensorsByDockID(id);
      setSensors(initSensors);
    };
    initData();
  }, [id]);

  // Timer effect
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

  return (
    <div 
      className={`
        nested-widget
        stack
        ${styles.bay} 
        ${classes}
      `}
      onClick={onClick}
    >
      <div className="row apart">
        <div className="stack gap5">
          <div className={styles.bayName}>{name}</div>
          <div className={styles.bayStatus}>
              <div className={`${styles.openTime} ${status === 'occupied' ? 'active-font' : 'inactive-font'}`}>
                  {elapsed}
              </div>
          </div>
        </div>

        <Sensors dock_bay={id} sensors={sensors} />
      </div>
      {/* <div className={`
          ${status === "occupied" ? "activeCardShow" : "activeCardHide"}
          row center
        `}>
          <div>State: {fsm_state}</div>
      </div> */}
    </div>
  );
}