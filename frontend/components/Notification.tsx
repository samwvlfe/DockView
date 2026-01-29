"use client"
import styles from "./Notification.module.css";

export default function Notification() {
    return (
        <div className={`${styles.notiCont} stack center gap10`}>
            <h1>NOTIFICATION</h1>
            <span>payload</span>
        </div>
    )
}