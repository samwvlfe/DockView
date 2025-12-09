import InfoWidget from "../InfoWidget";
import Image from "next/image";
import comp from "@/public/completed-icon.png";
import { DockBay } from "@/templates/types";

interface TrucksQueuedWidgetProps {
  docks: DockBay[];
}

export default function TrucksQueuedWidget({ docks }: TrucksQueuedWidgetProps) {
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
            iconColor="#ef4444"
            title="TRUCKS QUEUED"
            value="225"
        />
    );
}