// Master page component

"use client";
import { useEffect, useState } from "react";
import DockGridCont from "@/components/DockGridCont";
import Header from "@/components/Header";
import InfoContainer from "@/components/InfoContainer";
import { fetchDocks } from "@/lib/api";
import { DockBay } from "@/types/interfaces";


export default function Home() {
  // Hold dock data here
  const [docks, setDocks] = useState<DockBay[]>([]);
  const [selectedDockID, setselectedDockID] = useState<string | null>(null);

  // Fetch dock data first then listen for WS updates
  useEffect(() => {
    const initializeData = async () => {
      // Load initial docks
      const initialDocks = await fetchDocks();
      setDocks(initialDocks);

      // Open WS connection
      const ws = new WebSocket("wss://dockview.onrender.com/ws");
      ws.onopen = () => console.log("WebSocket connection established");
      // Handle incoming messages
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        console.log("WS update:", msg);
        // Dock status updates
        if (msg.type === "dock_status_update") {
          const payload = msg.payload;
          // Update the relevant dock's status
          setDocks((prevDocks) =>
            prevDocks.map((dock: DockBay) =>
              dock.id === payload.dock_bay_id
                ? {
                    ...dock,
                    status: payload.new_status,
                    status_changed_at: payload.status_changed_at
                  }
                : dock
            )
          );
        }
      };
    };

    initializeData();
  }, []);


  return (
      <main>
        <Header />
        <div className="content row gap">  
          <DockGridCont 
            docks={docks}
            onSelectDock={setselectedDockID}
          />

          <InfoContainer 
            docks={docks} 
            selectedWidgets={["utilization", "loadsCompleted", "turnover"]}
            selectedDockID={selectedDockID}
            />
          </div>
      </main>
  );
}