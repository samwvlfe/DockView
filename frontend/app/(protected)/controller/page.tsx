"use client";
import { useEffect, useState, useMemo } from "react";
import styles from "./controllerpage.module.css";
import { fetchDocks, fetchSensorsByDockID, sendControllerAction } from "@/lib/api";
import { DockBay, Sensor } from "@/types/interfaces";

export default function Controller() {
    // Dock data
    const [docks, setDocks] = useState<DockBay[]>([]);
    const [selectedUuid, setSelectedUuid] = useState<string>("");
    // Sensor data 
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [sensorsLoading, setSensorsLoading] = useState(false);
    // State
    const [currState, setCurrState] = useState<string | null>(null);

    // fetch docks for selection drop down
    useEffect(() => {
        (async () => {
            const initDocks = await fetchDocks();
            setDocks(initDocks);
        })();
    }, []);

    // fetch sensors for selected dock
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
    const hasRestraint = sensorTypes.has("RESTRAINT");

    //access sensor ID for seach sensor type for selected dock
    const doorSensorId = sensors.find(s => s.sensor_type === "DOOR")?.id ?? null;
    const levelerSensorId = sensors.find(s => s.sensor_type === "LEVELER")?.id ?? null;
    const restraintSensorId = sensors.find(s => s.sensor_type === "RESTRAINT")?.id ?? null;

    async function handleAction(action: string, sensorId: string | null) {
        if (!selectedUuid) return;
        if (!sensorId) return;

        try {
            const result = await sendControllerAction(selectedUuid, sensorId, action);
        } catch (e) {
            console.error("action failed:", e);
        }
    }

    // get selected dock to access state
    const selectedDock = docks.find(d => d.id === selectedUuid) ?? null;
    const selectedState = selectedDock?.fsm_state ?? null;

    useEffect(() => {
        // Connect to WebSocket
        const ws = new WebSocket("wss://dockview.onrender.com/ws");

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            
            // Only handle sensor updates for THIS dock bay
            if (msg.type === "sensor_updated" && msg.payload.dock_bay_id === selectedUuid) {                
                setCurrState(msg.payload.action);
            }
        };

        ws.onerror = (err) => console.error("WS ERROR:", err);
        ws.onclose = () => console.log(`WS Disconnected for dock ${selectedUuid}`);

        // Cleanup on unmount
        return () => {
            console.log(`Closing WS for dock ${selectedUuid}`);
            ws.close();
        };

    }, [selectedState]);

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
                            disabled={!selectedUuid || !restraintSensorId}  // ✓ Correct
                            className={`${hasRestraint ? styles.open : styles.buttonNotReady}`}
                            onClick={() => handleAction("Vehicle Restraint Engaged", restraintSensorId)}
                        >
                            ARM
                        </button>
                        <button
                            type="button"
                            disabled={!selectedUuid || !restraintSensorId}  // ✓ Correct
                            className={`${hasRestraint ? styles.close : styles.buttonNotReady}`}
                            onClick={() => handleAction("Vehicle Restraint Disengaged", restraintSensorId)}
                        >
                            DISARM
                        </button>
                    </div>
                    
                    <div className={`${styles.buttonRow} row center gap10`}>
                        <div className={styles.buttonName}>Dock Bay Door:</div>
                        <button
                            type="button"
                            disabled={!selectedUuid || !doorSensorId}  // ✓ Fixed: was restraintSensorId
                            className={`${hasDoor ? styles.open : styles.buttonNotReady}`}
                            onClick={() => handleAction("Door Opened", doorSensorId)}
                        >
                            OPEN
                        </button>
                        <button
                            type="button"
                            disabled={!selectedUuid || !doorSensorId}  // ✓ Fixed: was restraintSensorId
                            className={`${hasDoor ? styles.close : styles.buttonNotReady}`}
                            onClick={() => handleAction("Door Closed", doorSensorId)}
                        >
                            CLOSE
                        </button>
                    </div>
                    
                    <div className={`${styles.buttonRow} row center gap10`}>
                        <div className={styles.buttonName}>Dock Leveler:</div>
                        <button
                            type="button"
                            disabled={!selectedUuid || !levelerSensorId}  // ✓ Fixed: was restraintSensorId
                            className={`${hasLeveler ? styles.open : styles.buttonNotReady}`}
                            onClick={() => handleAction("Dock Leveler Deployed", levelerSensorId)}
                        >
                            DEPLOY
                        </button>
                        <button
                            type="button"
                            disabled={!selectedUuid || !levelerSensorId}  // ✓ Fixed: was restraintSensorId
                            className={`${hasLeveler ? styles.close : styles.buttonNotReady}`}
                            onClick={() => handleAction("Dock Leveler Reset", levelerSensorId)}
                        >
                            RESET
                        </button>
                    </div>
                </div>

                {currState !== null && (
                    <div>
                        <h3>CURRENT STATE: {currState}</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
