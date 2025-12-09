import InfoWidget from "../InfoWidget";
import Image from "next/image";
import util from "@/public/utilization-icon.png";

export default function UtilizationWidget() {
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
            value="225%"
        />
    );
}