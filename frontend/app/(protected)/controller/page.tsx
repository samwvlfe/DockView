"use client";
import { useEffect, useState, useMemo } from "react";
import styles from "./controllerpage.module.css";
import { fetchDocks, fetchSensorsByDockID } from "@/lib/api";
import { DockBay, Sensor } from "@/types/interfaces";
import { init } from "next/dist/compiled/webpack/webpack";

export default function Controller() {
    // Dock data
    const [docks, setDocks] = useState<DockBay[]>([]);
    const [selectedUuid, setSelectedUuid] = useState<string>("");
    //Sensor data 
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [sensorsLoading, setSensorsLoading] = useState(false);

    // fetch docks
    useEffect(() => {
        (async () => {
            const initDocks = await fetchDocks();
            setDocks(initDocks);
            console.log(initDocks);
        })();
    }, []);

    // fetch sensors when dock selected/changed
    useEffect(() => {
        if (!selectedUuid) {
            setSensors([]);
            return;
        }

        let cancelled = false;

        (async () => {
        try {
            setSensorsLoading(true);
            const data: Sensor[] = await fetchSensorsByDockID(selectedUuid);
            if (!cancelled) setSensors(data);
        } catch (err) {
            console.error("Failed to fetch sensors:", err);
            if (!cancelled) setSensors([]);
        } finally {
            if (!cancelled) setSensorsLoading(false);
        }
        })();

        return () => {
        cancelled = true;
        };
    }, [selectedUuid]);

    // check for sensors
    const sensorTypes = useMemo(() => {
        return new Set(sensors.map((s) => s.sensor_type));
    }, [sensors]);
    const hasDoor = sensorTypes.has("DOOR");
    const hasLeveler = sensorTypes.has("LEVELER");
    const hasRestraint = sensorTypes.has("RESTRAINT") || sensorTypes.has("RESTRIANT");

    // get selected dock to access state
    const selectedDock = docks.find(d => d.id === selectedUuid) ?? null;
    const selectedState = selectedDock?.fsm_state ?? null;
    console.log(selectedState);

  return (
    <div className={`stack center gap20`}>
        <h1>Controller Test</h1>

        <div className={`${styles.selectCont} stack center`}>

            <label htmlFor="dock">Select dock</label>

            <select
                id="dock"
                name="dock"
                value={selectedUuid}
                onChange={(e) => setSelectedUuid(e.target.value)}
                >
                <option value="" disabled>
                    Select a dock…
                </option>

                {docks.map((d) => (
                    <option key={d.id} value={d.id}>
                    {d.name}
                </option>
                ))}
            </select>

        </div>

        <div className="row center gap20">

            <div className={`${styles.buttonCont} stack gap20`}>
                <div className={`${styles.buttonRow} row center gap10`}>
                    <div className={styles.buttonName}>Vehicle Restraint:</div>
                    <button
                        type="button"
                        className={`${hasRestraint ? styles.open : styles.buttonNotReady}`}
                        >
                        ARM
                    </button>
                    <button
                        type="button"
                        className={`${hasRestraint ? styles.close : styles.buttonNotReady}`}
                        >
                        DISARM
                    </button>
                </div>
                <div className={`${styles.buttonRow} row center gap10`}>
                    <div className={styles.buttonName}>Dock Bay Door:</div>
                    <button
                        type="button"
                        className={`${hasDoor ? styles.open : styles.buttonNotReady}`}
                        >
                        OPEN
                    </button>
                    <button
                        type="button"
                        className={`${hasDoor ? styles.close : styles.buttonNotReady}`}
                        >
                        CLOSE
                    </button>
                </div>
                <div className={`${styles.buttonRow} row center gap10`}>
                    <div className={styles.buttonName}>Dock Leveler:</div>
                    <button
                        type="button"
                        className={`${hasLeveler ? styles.open : styles.buttonNotReady}`}
                        >
                        DEPLOY
                    </button>
                    <button
                        type="button"
                        className={`${hasLeveler ? styles.close : styles.buttonNotReady}`}
                        >
                        RESET
                    </button>
                </div>
            </div>

            <div><h3>CURRENT STATE: {selectedState ? selectedState : "Loading"}</h3></div>
        </div>
    </div>
  );
}
