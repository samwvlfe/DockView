import { formatTimeDate } from "@/lib/helpers";
import styles from "./DockInfoCard.module.css"
import { DockInfoHistory } from "@/types/interfaces";

interface DockInfoCardProps {
    dock: DockInfoHistory;
}

export default function DockInfoCard({ dock }: DockInfoCardProps){
    //get dock bay info
    return(
        <div className="widget row gap10 selected">
            <div className={`${styles.dinfo} stack gap10`}>
                <div className="widget-hdr">Dock Info</div>
                <div className="nested-widget stack gap10">
                    <div><span className="bold">Name: </span><span>{dock.name}</span></div>
                    <div><span className="bold">Status: </span><span className={dock.status === 'occupied' ? 'active-font' : ''}>{dock.status}</span></div>
                    <div><span className="bold">ID: </span><span>{dock.friendly_id}</span></div>
                </div>
            </div>
            <div className={`${styles.dhist} stack gap10`}>
                <div className="widget-hdr">History</div>
                <div className="nested-widget stack gap10" style={{flex: "1"}}>
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