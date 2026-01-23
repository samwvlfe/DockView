"use client";
import { useEffect, useState } from "react";
import styles from "./InfoContainer.module.css";
import { WidgetKey, WIDGET_BANK } from "./widgets/WidgetBank";
import { DockBay, DockInfoHistory } from "@/types/interfaces";
import { fetchDockByID } from "@/lib/api";
import DockInfoCard from "./DockInfoCard";

interface InfoContainerProps {
  docks: DockBay[];
  selectedWidgets: WidgetKey[];
  selectedDockID: string | null;
}

export default function InfoContainer({ docks, selectedWidgets, selectedDockID }: InfoContainerProps) {

  const [selectedDock, setSelectedDock] = useState<DockInfoHistory | null>(null);

  useEffect(() => {
    if (!selectedDockID) {
      setSelectedDock(null)
      return
    }
    //fetch api data and set data to selectedDock
    const loadSelDock = async () => {
      try{
        const dock = await fetchDockByID(selectedDockID);

        const MappedDock: DockInfoHistory = {
          id: dock.id,
          friendly_id: dock.friendly_id,
          name: dock.name,
          status: dock.status,
          status_changed_at: dock.status_changed_at,
          history: dock.dock_bay_history ?? []
        };

        setSelectedDock(MappedDock);
      } catch (err) {
        console.error("failed to load selected dock", err);
        setSelectedDock(null);
      }
    }

    loadSelDock();
  }, [selectedDockID]);


  return (
    <div className="stack gap10">
      {selectedDock && <DockInfoCard dock={selectedDock}/>}
      <div className={`${styles['widgets-grid']} gap10`}>
          {selectedWidgets.map(key => { 
              const Widget = WIDGET_BANK[key];
              return <Widget key={key} docks={docks}/>;
          })}
      </div>
    </div>
  );
}