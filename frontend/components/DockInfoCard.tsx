import { formatDateTime, timeSince } from "@/lib/helpers";
import styles from "./DockBayCard.module.css"
import { DockInfoHistory } from "@/types/interfaces";

interface DockInfoCardProps {
    dock: DockInfoHistory;
}

export default function DockInfoCard({ dock }: DockInfoCardProps){
    //get dock bay info
    return(
        <div className="widget">
            <div className="widget-hdr">Dock Info</div>
            <div className={styles.info}>
                <div><span className="bold">Name: </span>{dock.name}</div>
                <div><span className="bold">Status: </span>{dock.status}</div>
                <div className="widget-subhdr" style={{ marginLeft: "10px" }}>
                    <span className="bold">Since: </span>
                    {formatDateTime(dock.status_changed_at)}
                </div>
                <div><span className="bold">ID: </span>{dock.friendly_id}</div>
            </div>
        </div>
    );
}