import styles from "./InfoContainer.module.css";
import { WidgetKey, WIDGET_BANK } from "./widgets/WidgetBank";
import { DockBay } from "@/templates/types";

interface InfoContainerProps {
  docks: DockBay[];
  selectedWidgets: WidgetKey[];
}   

export default function InfoContainer({ docks, selectedWidgets }: InfoContainerProps) {
  return (
    <div className={styles["widgets-grid"]}>    
        {selectedWidgets.map(key => {
            const Widget = WIDGET_BANK[key];
            return <Widget key={key} docks={docks}/>;
        })}
    </div>
  );
}

