import InfoWidget from "../InfoWidget";
import Image from "next/image";
import comp from "@/public/completed-icon.png";
import { DockBay } from "@/templates/types";

interface LoadsCompletedWidgetProps {
  docks: DockBay[];
}

export default function LoadsCompletedWidget({ docks }: LoadsCompletedWidgetProps) {
    return (
        <InfoWidget
            icon={
                <Image
                    src={comp}
                    alt="Loads Completed Icon"
                    width={400}
                    height={400}
                    priority
                />
            }
            iconColor="#14b8a6"
            title="LOADS COMPLETED"
            value="225"
        />
    );
}