import InfoWidget from "../InfoWidget";
import Image from "next/image";
import avg from "@/public/avg-time-icon.png";
import { DockBay } from "@/templates/types";

interface AvgTurnoverWidgetProps {
  docks: DockBay[];
}

export default function AvgTurnoverWidget() {
    return (
        <InfoWidget
            icon={
                <Image
                    src={avg}
                    alt="Average Turnover Icon"
                    width={400}
                    height={400}
                    priority
                />
            }
            iconColor="#f59e0b"
            title="AVERAGE TURNOVER"
            value="225 mins"
        />
    );
}