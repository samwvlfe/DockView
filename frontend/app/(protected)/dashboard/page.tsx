// Master page component

"use client";
import { useEffect, useState } from "react";
import DockGridCont from "@/components/DockGridCont";
import InfoContainer from "@/components/InfoContainer";
import NotificationBanner from "@/components/Notification";
import { fetchDocks } from "@/lib/api";
import { DockBay } from "@/types/interfaces";
import { Notification } from '@/types/interfaces';

export default function DashboardPage() {
    // dock data
    const [docks, setDocks] = useState<DockBay[]>([]);
    const [selectedDockID, setselectedDockID] = useState<string | null>(null);
    //notification data
    const [notifications, setNotifications] = useState<Notification[]>([]);

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
                // listen for status updates (truck enter/leave)
                if (msg.type === "dock_status_update") {
                    const payload = msg.payload;
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
                // Listen for FSM state updates (fsm_states)
                if (msg.type === "sensor_updated") {
                    const payload = msg.payload;
                    setDocks((prevDocks) =>
                        prevDocks.map((dock: DockBay) =>
                            dock.id === payload.dock_bay_id
                            ? {
                                ...dock,
                                fsm_state: payload.new_fsm_state
                                }
                            : dock
                        )
                    );
                }
                // Listen for exceptions and send notification to sreen
                if(msg.type === "exception") {
                    const payload = msg.payload;
                    console.log("payload", payload);
                    
                    // Create new notification with unique ID
                    const newNotification: Notification = {
                        //random id
                        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                        isException: true,
                        message: payload.ExceptionDetails.message,
                        dock_bay: payload.dock_bay_id,
                        sensor: payload.ExceptionDetails.payload,
                        action_fix: payload.ExceptionDetails.fix,
                        timestamp: payload.timestamp
                    };

                    setNotifications(prev => [...prev, newNotification]);
                }
            };
        };
    initializeData();
  }, []);

  return (
        <>
            <NotificationBanner 
                notifications={notifications}
                onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
            />
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
        </>
  );
}