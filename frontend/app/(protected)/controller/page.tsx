"use client";
import { useEffect, useState, useMemo } from "react";
import styles from "./controllerpage.module.css";
import { fetchDocks } from "@/lib/api";
import { DockBay } from "@/types/interfaces";
import { fetchSensorsByDockID } from "@/lib/api";

export default function Controller() {
    // Hold dock data here
    const [docks, setDocks] = useState<DockBay[]>([]);
    const [selectedDockID, setselectedDockID] = useState<string | null>(null);

    // fetch dock data to use id's for selection
    useEffect(() => {
        const initializeData = async () => {
            const initDocks = await fetchDocks();
            setDocks(initDocks);
        };
        initializeData();
    }, []);

    console.log(docks);



  const dockss = useMemo(
    () => [
      { label: "Dock 1", uuid: "22d3242a-c2cf-459c-95ca-8bec86657fdd" },
      { label: "Dock 2", uuid: "9f121f79-fe3c-42f7-ba6c-ac64dc6c1228" },
      { label: "Dock 3", uuid: "a58185f4-f36d-46c8-a83e-0e2735330a64" },
      { label: "Dock 4", uuid: "6805b8ee-f780-435f-9696-42e76deadbf8" },
      { label: "Dock 5", uuid: "cc3d90ad-74e7-4e38-b2f3-b157d4d86621" },
      { label: "Dock 6", uuid: "b5dfc09d-af85-4fb8-8fa5-0c98b223f1cf" },
      { label: "Dock 7", uuid: "d8bbee0c-9461-44b5-95bd-88f3e31075ac" },
      { label: "Dock 8", uuid: "504e021b-c0ae-4aab-95ee-38cb7d456743" },
      { label: "Dock 9", uuid: "b81b4c65-eb9a-4cc0-b71e-4ddf020b2fde" },
      { label: "Dock 10", uuid: "61d718f2-69bb-4bb3-9057-4cde811e917e" },
      // add more...
    ],
    []
  );

  const [selectedUuid, setSelectedUuid] = useState<string>("");

  const selectedDock = dockss.find((d) => d.uuid === selectedUuid) ?? null;

  return (
    <div className={`stack center`}>
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

                {dockss.map((d) => (
                    <option key={d.uuid} value={d.uuid}>
                    {d.label}
                </option>
                ))}
            </select>

        </div>

        <div className={`${styles.buttonCont} stack gap20`}>
            <div className={`${styles.buttonRow} row center gap10`}>
                <div className={styles.buttonName}>Vehicle Restraint:</div>
                <button
                    type="button"
                    className={styles.open}
                >
                    ARM
                </button>
                <button
                    type="button"
                    className={styles.close}
                >
                    DISARM
                </button>
            </div>
            <div className={`${styles.buttonRow} row center gap10`}>
                <div className={styles.buttonName}>Dock Bay Door:</div>
                <button
                    type="button"
                    className={styles.open}
                >
                    OPEN
                </button>
                <button
                    type="button"
                    className={styles.close}
                >
                    CLOSE
                </button>
            </div>
            <div className={`${styles.buttonRow} row center gap10`}>
                <div className={styles.buttonName}>Dock Leveler:</div>
                <button
                    type="button"
                    className={styles.open}
                >
                    DEPLOY
                </button>
                <button
                    type="button"
                    className={styles.close}
                >
                    RESET
                </button>
            </div>
        </div>
    </div>
  );
}
