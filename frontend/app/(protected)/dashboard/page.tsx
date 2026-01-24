// Master page component

"use client";
import { useEffect, useState } from "react";
import DockGridCont from "@/components/DockGridCont";
import InfoContainer from "@/components/InfoContainer";
import { fetchDocks, fetchSensors } from "@/lib/api";
import { DockBay, Sensor } from "@/types/interfaces";


export default function DashboardPage() {
    // dock data
    const [docks, setDocks] = useState<DockBay[]>([]);
    const [selectedDockID, setselectedDockID] = useState<string | null>(null);
    // sensor data
    const [sensors, setSensors] = useState<Sensor[]>([]);

    // Fetch dock data first then listen for WS updates
    useEffect(() => {
    const initializeData = async () => {
        // Load initial docks and sensors
        const initDocks = await fetchDocks();
        setDocks(initDocks);
        const initSensors = await fetchSensors();
        setSensors(initSensors);
        console.log(sensors);


        // Open WS connection
        const ws = new WebSocket("wss://dockview.onrender.com/ws");
        ws.onopen = () => console.log("WebSocket connection established");
        // Handle incoming messages
        ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
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
            <div className="content row gap10">  
            <DockGridCont 
                docks={docks}
                selectedDockId={selectedDockID}
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