"use client"
import styles from "./Notification.module.css";
import { Notification } from '@/types/interfaces';

interface NotificationBannerProps {
    notifications: Notification[];
    onDismiss: (id: string) => void;
}

export default function NotificationBanner({ notifications, onDismiss } : NotificationBannerProps) {
    return (
        <div className={`${styles.notiCont} stack center gap10`}>
            {notifications.map(notification => (
                    <div key={notification.id} className="stack center gap10">
                        <div>
                            <p>{notification.message}</p>
                            <p>Dock: {notification.dock_bay}</p>
                            <p>Fix: {notification.action_fix}</p>
                        </div>
                        <button 
                            type="button"
                            onClick={() => onDismiss(notification.id)}                        >
                            X
                        </button>
                    </div>
                ))}
        </div>
    )
}