// Master page component

"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import DockGridCont from "@/components/DockGridCont";
import InfoContainer from "@/components/InfoContainer";
import NotificationBanner from "@/components/Notification";
import useWebSocket from "@/hooks/useWebSocket";
import { fetchDocks } from "@/lib/api";
import { DockBay } from "@/types/interfaces";
import { Notification } from '@/types/interfaces';
import { WidgetKey } from "@/components/widgets/WidgetBank";

export default function DashboardPage() {
    // dock data
    const [docks, setDocks] = useState<DockBay[]>([]);
    const [selectedDockID, setselectedDockID] = useState<string | null>(null);
    //notification data
    const [notifications, setNotifications] = useState<Notification[]>([]);
    // widget selection
    const [selectedWidgets, setSelectedWidgets] = useState<WidgetKey[]>(["utilization", "loadsCompleted"]);

    // Fetch dock data on mount
    useEffect(() => {
        fetchDocks().then(setDocks);
    }, []);

    // WS handlers
    const handleDockStatusUpdate = useCallback((payload: any) => {
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
    }, []);

    const handleSensorUpdated = useCallback((payload: any) => {
        setDocks((prevDocks) =>
            prevDocks.map((dock: DockBay) =>
                dock.id === payload.dock_bay_id
                ? {
                    ...dock,
                    fsm_state: payload.new_fsm_state,
                    currLoad_started_at: payload.loadingStarted_at
                    }
                : dock
            )
        );
    }, []);

    const handleException = useCallback((p: any) => {
        const ex = p.payload;

        const newNotification: Notification = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            isException: true,
            message: ex.message,
            dock_bay: p.dock_bay_id,
            sensor: ex.sensor,
            action_fix: ex.fix,
            timestamp: p.timestamp,
        };

        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const wsHandlers = useMemo(() => ({
        dock_status_update: handleDockStatusUpdate,
        sensor_updated: handleSensorUpdated,
        exception: handleException,
    }), [handleDockStatusUpdate, handleSensorUpdated, handleException]);

    useWebSocket(wsHandlers);

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
                    selectedWidgets={selectedWidgets}
                    onWidgetChange={setSelectedWidgets}
                    selectedDockID={selectedDockID}
                />
            </div>
        </>
  );
}
