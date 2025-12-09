// Master page component

"use client";
import { useEffect, useState } from "react";
import DockGridCont from "@/components/DockGridCont";
import Header from "@/components/Header";
import InfoContainer from "@/components/InfoContainer";
import { fetchDocks } from "@/lib/api";
import { DockBay } from "@/types/interfaces";


export default function Home() {
  // Hold dock data
  const [docks, setDocks] = useState<DockBay[]>([]);

  // State to track selected dock bay (for future use)
  // const [selectedDock, setSelectedDock] = useState<number | null>(null);

  // Fetch dock data from backend on component mount
  useEffect(() => {
    const initializeData = async () => {
      const initialDocks = await fetchDocks();
      setDocks(initialDocks);

      const ws = new WebSocket("wss://dockview.onrender.com/ws");

      ws.onopen = () => console.log("WebSocket connection established");

      ws.onmessage = (event) => {
        const update = JSON.parse(event.data);
        console.log("WS update:", update);

        setDocks((prevDocks) =>
          prevDocks.map((dock: DockBay) =>
            dock.id === update.dock_bay_id
              ? {
                  ...dock,
                  status: update.new_status,
                  status_changed_at: update.status_changed_at
                }
              : dock
          )
        );
      };


      setDocks(await fetchDocks());
    };

    initializeData();
  }, []);

  return (
      <main>
        <Header />
        <div className="content">  
          <DockGridCont docks={docks}/>
          <InfoContainer docks={docks} selectedWidgets={["utilization", "loadsCompleted", "turnover", "queued"]} />
          </div>
      </main>
  );
}