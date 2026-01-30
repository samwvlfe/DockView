"use client";
import styles from "./DockGridCont.module.css";
import DockBayCard from "@/components/DockBayCard";
import { DockBay } from "@/types/interfaces";

interface DockBayGridProps {
    docks: DockBay[];
    onSelectDock: (id: string) => void;
    selectedDockId: string | null;
}

export default function DockGridCont({ docks, onSelectDock, selectedDockId }: DockBayGridProps) {
    // Make a shallow copy and sort so 'occupied' items come first.
    const sortedDocks = [...docks].sort((a, b) => {
        const aOcc = (a.status ?? "").toLowerCase().trim() === "occupied";
        const bOcc = (b.status ?? "").toLowerCase().trim() === "occupied";

        if (aOcc && !bOcc) return -1;
        if (!aOcc && bOcc) return 1;

        // Same status -> deterministic fallback (by id)
        return a.friendly_id - b.friendly_id;
    });

    const activeCount = sortedDocks.filter(d => (d.status ?? "").toLowerCase().trim() === "occupied").length;

    return (
        <div className='row'>
            <div className="widget stack gap10">
                <div className="apart">
                    <div className="widget-hdr">Dock Status Overview</div>
                    <div className="widget-hdr active-font">Active Docks: {activeCount}</div>
                </div>
                
                <div className={`${styles.baylist} gap10`}>
                    {sortedDocks.map((dock) => (
                        <DockBayCard
                            key={dock.id}
                            id={dock.id}
                            name={dock.name}
                            status={dock.status}
                            fsm_state={dock.fsm_state ?? ""}
                            loadStarted_at={dock.currLoad_started_at}
                            onClick={() => onSelectDock(dock.id)}
                            isSelected={dock.id === selectedDockId}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
