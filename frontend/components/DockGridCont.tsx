"use client";
import styles from "./DockGridCont.module.css";
import DockBayCard from "@/components/DockBayCard";

interface DockBay {
    id: number;
    friendly_id: number;
    name: string;
    status: string;
    status_changed_at: string;
}

interface DockBayGridProps {
    docks: DockBay[];
}

export default function DockGridCont({ docks }: DockBayGridProps) {
    // Make a shallow copy and sort so 'occupied' items come first.
    const sortedDocks = [...docks].sort((a, b) => {
        const aOcc = (a.status ?? "").toLowerCase().trim() === "occupied";
        const bOcc = (b.status ?? "").toLowerCase().trim() === "occupied";

        if (aOcc && !bOcc) return -1;
        if (!aOcc && bOcc) return 1;

        // Same status -> deterministic fallback (by id)
        return a.id - b.id;
    });

    const activeCount = sortedDocks.filter(d => (d.status ?? "").toLowerCase().trim() === "occupied").length;

    return (
        <div className="bays-container">
            <div className="widget">
                <div className="apart">
                    <div className="widget-hdr">Dock Status Overview</div>
                    <div className="widget-hdr active-font">Active Docks: {activeCount}</div>
                </div>
                
                <div className={styles.baylist}>
                    {sortedDocks.map((dock) => (
                        <DockBayCard
                            key={dock.id}
                            id={dock.id}
                            friendly_id={dock.friendly_id}
                            name={dock.name}
                            status={dock.status}
                            status_changed_at={dock.status_changed_at}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
