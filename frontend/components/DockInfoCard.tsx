import { formatDateTime } from "@/lib/helpers";
import styles from "./DockInfoCard.module.css"
import { DockInfoHistory } from "@/types/interfaces";

interface DockInfoCardProps {
    dock: DockInfoHistory;
}

export default function DockInfoCard({ dock }: DockInfoCardProps){
    //get dock bay info
    return(
        <div className="widget">
            <div className="row">
                <div className="nested-widget">
                    <div className="widget-hdr">Dock Info</div>
                    <div><span className="bold">Name: </span>{dock.name}</div>
                    <div><span className="bold">Status: </span>{dock.status}</div>
                    <div className="widget-subhdr" style={{ marginLeft: "10px" }}>
                        <span className="bold">Since: </span>
                        {formatDateTime(dock.status_changed_at)}
                    </div>
                    <div><span className="bold">ID: </span>{dock.friendly_id}</div>
                </div>
                <div className="nested-widget">
                    <div className="widget-hdr">History</div>
                    <div className={styles.historyTable}>
                        <div className={styles.historyHeader}>
                            <span>Old Status</span>
                            <span>New Status</span>
                            <span>Reason</span>
                            <span>Time</span>
                        </div>
                        {[...dock.history]
                        .sort((a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime()
                        )
                        .map((row) => (
                            <div key={row.id} className={styles.historyRow}>
                            <span>{row.old_status}</span>
                            <span>{row.new_status}</span>
                            <span>{row.reason}</span>
                            <span>{formatDateTime(row.created_at)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}