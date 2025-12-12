"use client";
import { useEffect, useState } from "react";
import styles from "./InfoContainer.module.css";
import { WidgetKey, WIDGET_BANK } from "./widgets/WidgetBank";
import { DockBay } from "@/types/interfaces";
import { fetchDockByID } from "@/lib/api";
import SetDockInfoCard from "./DockInfoCard";

interface InfoContainerProps {
  docks: DockBay[];
  selectedWidgets: WidgetKey[];
  selectedDockID: string | null;
}   

export default function InfoContainer({ docks, selectedWidgets, selectedDockID }: InfoContainerProps) {

  const [selectedDock, setSelectedDock] = useState<DockBay | null>(null);

  useEffect(() => {
    if (!selectedDockID) {
      setSelectedDock(null)
      return
    }
    //fetch api data and set data to selectedDock
    const loadSelDock = async () => {
      try{
        const dock = await fetchDockByID(selectedDockID);
        setSelectedDock(dock);
      } catch (err) {
        console.error("failed to load selected dock", err);
        setSelectedDock(null);
      }
    }

    loadSelDock();
  }, [selectedDockID]);


  return (
    <div className="info-cont">
      {selectedDock && (<div className="widget">Selected Dock ID:{selectedDock.id}</div>)}
      <div className={styles["widgets-grid"]}>
          {selectedWidgets.map(key => {
              const Widget = WIDGET_BANK[key];
              return <Widget key={key} docks={docks}/>;
          })}
      </div>
    </div>
  );
}