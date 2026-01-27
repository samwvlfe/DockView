// Master page component

"use client";
import { useEffect, useState } from "react";
import DockGridCont from "@/components/DockGridCont";
import InfoContainer from "@/components/InfoContainer";
import { fetchDocks } from "@/lib/api";
import { DockBay } from "@/types/interfaces";


export default function DashboardPage() {
    // dock data
    const [docks, setDocks] = useState<DockBay[]>([]);
    const [selectedDockID, setselectedDockID] = useState<string | null>(null);

    // Fetch dock data first then listen for WS updates
    useEffect(() => {
        const initializeData = async () => {
            // Load initial docks
            const initDocks = await fetchDocks();
            setDocks(initDocks);

            // Open WS connection
            const ws = new WebSocket("wss://dockview.onrender.com/ws");
            ws.onopen = () => console.log("WebSocket connection established");
            // Handle incoming messages
            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);

                if (msg.type === "dock_status_update") {
                    const payload = msg.payload;
                    console.log("dock_status_update payload: ", payload);
                    // Update the relevant dock's status onMessage 
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
            <div className="content row gap10">  
            <DockGridCont 
                docks={docks}
                selectedDockId={selectedDockID}
                onSelectDock={setselectedDockID}
            />

            <InfoContainer 
                docks={docks} 
                selectedWidgets={["utilization", "loadsCompleted"]}
                selectedDockID={selectedDockID}
                />
            </div>
        </main>
  );
}