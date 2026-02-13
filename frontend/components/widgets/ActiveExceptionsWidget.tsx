import InfoWidget from "../InfoWidget";
import { DockBay } from "@/types/interfaces";

interface ActiveExceptionsWidgetProps {
    docks: DockBay[];
}

export default function ActiveExceptionsWidget({ docks }: ActiveExceptionsWidgetProps) {
    const exceptionCount = docks.filter(d => d.fsm_state === "Exception").length;

    return (
        <InfoWidget
            icon={
                <span style={{ fontSize: "28px" }}>&#9888;</span>
            }
            iconColor="#f59e0b"
            title="ACTIVE EXCEPTIONS"
            value={exceptionCount}
        />
    );
}
