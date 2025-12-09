import styles from "./InfoContainer.module.css";
import { WidgetKey, WIDGET_BANK } from "./widgets/WidgetBank";

interface InfoContainerProps {
  selectedWidgets: WidgetKey[];
}   

export default function InfoContainer({ selectedWidgets }: InfoContainerProps) {
  return (
    <div className={styles["widgets-grid"]}>    
        {selectedWidgets.map(key => {
            const Widget = WIDGET_BANK[key];
            return <Widget key={key} />;
        })}
    </div>
  );
}

