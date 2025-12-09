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

  // const testDocks = [
  //   { id: 1, name: "Dock A", status: "occupied" },
  //   { id: 2, name: "Dock B", status: "occupied" },
  //   { id: 3, name: "Dock C", status: "idle" },
  //   { id: 4, name: "Dock D", status: "idle" },
  //   { id: 5, name: "Dock E", status: "occupied" },
  //   { id: 6, name: "Dock F", status: "idle" },
  // ];


  return (
      <main>
        <Header />
        <div className="content">  
          <DockGridCont docks={docks}/>
          <InfoContainer selectedWidgets={["utilization", "loadsCompleted", "turnover", "queued"]} />
          </div>
      </main>
  );
}