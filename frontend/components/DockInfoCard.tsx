import { formatDateTime, formatTimeDate } from "@/lib/helpers";
import styles from "./DockInfoCard.module.css"
import styless from "./DockBayCard.module.css"
import { DockInfoHistory } from "@/types/interfaces";

interface DockInfoCardProps {
    dock: DockInfoHistory;
}

export default function DockInfoCard({ dock }: DockInfoCardProps){
    //get dock bay info
    return(
        <div className={`widget row gap ${styless.selected}`}>
            <div className="stack gap">
                <div className="widget-hdr">Dock Info</div>
                <div className="nested-widget stack gap" style={{minWidth: "110px"}}>
                    <div><span className="bold">Name: </span><span className="orgColor">{dock.name}</span></div>
                    <div><span className="bold">Status: </span><span className="orgColor">{dock.status}</span></div>
                    <div><span className="bold">ID: </span><span className="orgColor">{dock.friendly_id}</span></div>
                </div>
            </div>
            <div className="stack gap">
                <div className="widget-hdr">History</div>
                <div className="nested-widget stack gap" style={{flex: "1"}}>
                    <div className={`${styles.historyTable} stack`}>
                        <div className={styles.historyHeader}>
                            <span>Update</span>
                            <span>Reason</span>
                            <span>Time</span>
                        </div>
                        <div className={`${styles.historyRowCont} stack`}>
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