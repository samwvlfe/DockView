import { DockBay } from "@/types/interfaces";


//eventually make baseURL an .env variable
const baseURL = process.env.BASE_URL;

// initial setting of all docks 
export async function fetchDocks() {
  const res = await fetch(`${baseURL}/docks`, {
    method: "GET",
  });
  if(!res.ok){
    throw new Error("Failed to fetch docks");
  }
  return res.json();
}

// used in dock bay history component
export async function fetchDockByID(id:string) {
  const res = await fetch(`${baseURL}/dock/${id}`, {
    method: "GET",
  });
  if(!res.ok){
    throw new Error(`Failed to fetch dock ${id}`);
  }
  return res.json();
}

// need to change to looking at dock_cycles.ended_at()
export async function fetchLoadsCompleted() {
  const res = await fetch(`${baseURL}/stats/loadsCompleted`, {
    method: "GET",
  });
  if(!res.ok){
    throw new Error("Failed to fetch loads completed");
  }
  return res.json();
}

//get all sensors
export async function fetchSensors() {
  const res = await fetch(`${baseURL}/sensors/all`, {
    method: "GET",
  });
     
  if(!res.ok){
    throw new Error(`Failed to fetch sensors`);
  }
  return res.json();
}

//get sensors by dock_id
export async function fetchSensorsByDockID(id:string) {
  const res = await fetch(`${baseURL}/sensors/${id}`, {
    method: "GET",
  });
     
  if(!res.ok){
    throw new Error(`Failed to fetch sensors for dock ${id}`);
  }
  return res.json();
}

// POST controller actions
export async function sendControllerAction(dockId: string, sensorId: string, action: string) {
  const res = await fetch(`${baseURL}/controller/action`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ dockId, sensorId, action}),
  });

  if(!res.ok){
    const text = await res.text().catch(() => "");
    throw new Error(`Controller Action failed: ${res.status} ${text}`);
  } 
  return res.json();
}

// POST reset dock bay after "Cycle_Complete" to "Bay_Available"
export async function DockCycle(theDock: DockBay, status: boolean) {
  const res = await fetch(`${baseURL}/controller/reset`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ theDock, status }),
  });

  if(!res.ok){
    const text = await res.text().catch(() => "");
    throw new Error(`Reset failed: ${res.status} ${text}`);
  } 
  return res.json();
}