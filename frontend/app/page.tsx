// Master page component

"use client";
import { useEffect, useState } from "react";
import DockGridCont from "@/components/DockGridCont";
import Header from "@/components/Header";
import InfoContainer from "@/components/InfoContainer";


export default function Home() {
  // Hold dock data
  const [docks, setDocks] = useState([]);

  // State to track selected dock bay (for future use)
  // const [selectedDock, setSelectedDock] = useState<number | null>(null);

  // Fetch dock data from backend on component mount
  useEffect(() => {
    async function loadDocks() {
      const res = await fetch("https://dockview.onrender.com/api/docks");
      const data = await res.json();
      setDocks(data);
    }

    loadDocks();
  }, []);

  return (
      <main>
        <Header />
        <div className="content">  
          <DockGridCont docks={docks}/>
          <InfoContainer docks={docks} selectedWidgets={["utilization", "loadsCompleted", "turnover", "queued"]} />
          </div>
      </main>
  );
}