import styles from "./InfoWidget.module.css";

interface InfoWidgetProps {
    icon?: React.ReactNode;   // icon component or <img>
    iconColor: string;
    title: string;
    value?: string | number;
    //   children?: React.ReactNode; // optional custom content
}

export default function InfoWidget({ icon, iconColor, title, value }: InfoWidgetProps) {
    return (
        
        <div className="widget stack">
            <div className={`${styles['info-widget-hdr']} gap10`}>
                <div className={styles['info-widget-icon']} style={{backgroundColor: iconColor}}>
                    {icon}
                </div>
                <div className="stack">
                    <div className="widget-subhdr">{title}</div>
                    <div className="widget-hdr">{value}</div>
                </div>
            </div>
        </div>
    );
}   