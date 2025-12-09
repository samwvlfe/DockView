import InfoWidget from "../InfoWidget";
import Image from "next/image";
import comp from "@/public/completed-icon.png";

export default function LoadsCompletedWidget() {
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
            title="LOADS COMPLETED"
            value="225"
        />
    );
}