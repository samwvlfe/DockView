import { useEffect, useState } from "react";
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
            <div className="allinfo stack">
                <div><span className="bold">Name: </span>{dock.name}</div>
                <div className="apart">
                    <div><span className="bold">Status: </span>{dock.status}</div>
                    <div className="widget-subhdr"><span className="bold">Since: </span>{dock.status_changed_at}</div>
                </div>
                <div><span className="bold">ID: </span>{dock.friendly_id}</div>

            </div>

        </div>
    );
}