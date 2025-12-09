import InfoWidget from "../InfoWidget";
import Image from "next/image";
import util from "@/public/utilization-icon.png";
import { DockBay } from "@/types/interfaces";

interface UtilizationWidgetProps {
  docks: DockBay[];
}

export default function UtilizationWidget({ docks }: UtilizationWidgetProps) {
    // calculate utilization
    const total = docks.length;
    const occupied = docks.filter(d => d.status === "occupied").length;
    const utilization = total === 0 ? 0 : Math.round((occupied / total) * 100);
    return (
        <InfoWidget
            icon={
                <Image
                    src={util}
                    alt="Utilization Icon"
                    width={400}
                    height={400}
                    priority
                />
            }
            iconColor="#3b82f6"
            title="UTILIZATION"
            value={`${utilization}%`}
        />
    );
}