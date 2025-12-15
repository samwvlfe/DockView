import { formatDateTime, formatTimeDate } from "@/lib/helpers";
import styles from "./DockInfoCard.module.css"
import { DockInfoHistory } from "@/types/interfaces";

interface DockInfoCardProps {
    dock: DockInfoHistory;
}

export default function DockInfoCard({ dock }: DockInfoCardProps){
    //get dock bay info
    return(
        <div className="widget">
            <div className="row gap">
                <div className="nested-widget">
                    <div className="widget-hdr">Dock Info</div>
                    <div><span className="bold">Name: </span><span className="orgColor">{dock.name}</span></div>
                    <div><span className="bold">Status: </span><span className="orgColor">{dock.status}</span></div>
                    <div><span className="bold">ID: </span><span className="orgColor">{dock.friendly_id}</span></div>
                </div>
                <div className="nested-widget">
                    <div className="widget-hdr">History</div>
                    <div className={styles.historyTable}>
                        <div className={styles.historyHeader}>
                            <span>Update</span>
                            <span>Reason</span>
                            <span>Time</span>
                        </div>
                        <div className="historyRowCont">
                            {[...dock.history]
                            .sort((a, b) =>
                                new Date(b.created_at).getTime() -
                                new Date(a.created_at).getTime()
                            )
                            .map((row) => (
                                <div key={row.id} className={styles.historyRow}>
                                    <span>{row.new_status}</span>
                                    <span>{row.reason}</span>
                                    <span>{formatTimeDate(row.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}