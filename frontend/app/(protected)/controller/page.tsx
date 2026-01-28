"use client";
import { useEffect, useState, useMemo } from "react";
import styles from "./controllerpage.module.css";
import { fetchDocks, fetchSensorsByDockID, sendControllerAction, DockCycle } from "@/lib/api";
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

    // get selected dock to access state
    const selectedDock = docks.find(d => d.id === selectedUuid) ?? null;
    const selectedState = selectedDock?.fsm_state ?? null;

    // set initial state when dock changes
    useEffect(() => {
        setCurrState(selectedState);
    }, [selectedState]);

    // change state/status automatically via websocket from controller.js
    useEffect(() => {
        if (!selectedUuid) return;

        const ws = new WebSocket("wss://dockview.onrender.com/ws");

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);

            //listen for sensor updates, update currstate and docks array
            if (msg.type === "sensor_updated" && msg.payload.dock_bay_id === selectedUuid) {
                setCurrState(msg.payload.new_fsm_state);
                setDocks(prevDocks =>
                    prevDocks.map(d =>
                        d.id === selectedUuid
                            ? { ...d, fsm_state: msg.payload.new_fsm_state }
                            : d
                    )
                );
            }
            //listen for status updates to get active dock cycle id for reset
            if (msg.type === "dock_cycle_updated") {
                setCurrState(msg.payload.fsm_state);
                setDocks(prevDocks =>
                    prevDocks.map(d =>
                        d.id === msg.payload.dock_bay_id
                            ? {
                                ...d,
                                active_cycle_id: msg.payload.active_cycle_id,
                                fsm_state: msg.payload.fsm_state
                            }
                            : d
                    )
                );
            }
        };

        return () => ws.close();
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

    async function toggleStatus(status: boolean) {
        try{
            const theDock = docks.find(dock => dock.id === selectedUuid);
            if (!theDock) {
                throw new Error("Dock not found");
            }
                        
            console.log("Sending dock to server:", {
                id: theDock.id,
                name: theDock.name,
                active_cycle_id: theDock.active_cycle_id,
                fsm_state: theDock.fsm_state
            });
            
            const result = await DockCycle(theDock, status);
            if(result){
                setCurrState(result.new_state);

                //update dock with return
                setDocks(prevDocks => 
                    prevDocks.map(d => 
                        d.id === result.dock_bay_id 
                            ? { ...d, active_cycle_id: result.active_cycle_id, fsm_state: result.new_state }
                            : d
                    )
                );
            }
        } catch (e) {
            console.error("action failed:", e);
        }
    }

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
            
            {/* Start cycle button - only show when Bay_Available */}
            {selectedDock?.fsm_state === "Bay_Available" && (
                <div>
                    <span>Start Load Cycle: </span>
                    <button
                        type="button"
                        disabled={!selectedUuid || !levelerSensorId}
                        className={styles.bayReadyBtn}
                        onClick={() => toggleStatus(true)}
                    >
                        START
                    </button>
                </div>
            )}

            {/* Fake Sensor Data Buttons */}
            <div className="row center gap20">
                <div className={`${styles.buttonCont} stack gap20`}>
                    <div className={`${styles.buttonRow} row center gap10`}>
                        <div className={styles.buttonName}>Vehicle Restraint:</div>
                        <button
                            type="button"
                            disabled={!selectedUuid || !restraintSensorId}
                            className={`${hasRestraint ? styles.open : styles.buttonNotReady}`}
                            onClick={() => handleAction("Vehicle Restraint Engaged", restraintSensorId)}
                        >
                            ARM
                        </button>
                        <button
                            type="button"
                            disabled={!selectedUuid || !restraintSensorId}
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
                            disabled={!selectedUuid || !doorSensorId}
                            className={`${hasDoor ? styles.open : styles.buttonNotReady}`}
                            onClick={() => handleAction("Door Opened", doorSensorId)}
                        >
                            OPEN
                        </button>
                        <button
                            type="button"
                            disabled={!selectedUuid || !doorSensorId}
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
                            disabled={!selectedUuid || !levelerSensorId}
                            className={`${hasLeveler ? styles.open : styles.buttonNotReady}`}
                            onClick={() => handleAction("Dock Leveler Deployed", levelerSensorId)}
                        >
                            DEPLOY
                        </button>
                        <button
                            type="button"
                            disabled={!selectedUuid || !levelerSensorId}
                            className={`${hasLeveler ? styles.close : styles.buttonNotReady}`}
                            onClick={() => handleAction("Dock Leveler Reset", levelerSensorId)}
                        >
                            RESET
                        </button>
                    </div>
                </div>

                {currState !== null && (
                    <div>
                        <h3>Bay Status: {currState}</h3>
                    </div>
                )}
            </div>

            {/* End Cycle Button - only shown when Cycle_Complete */}
            {selectedDock?.fsm_state === "Cycle_Complete" && (
                <div>
                    <span>Close Load Cycle: </span>
                    <button
                        type="button"
                        disabled={!selectedUuid || !levelerSensorId}
                        className={styles.bayReadyBtn}
                        onClick={() => toggleStatus(false)}
                        >
                        END
                    </button>
                </div>
            )}
        </div>
    );
}
