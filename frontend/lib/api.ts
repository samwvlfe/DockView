// FUNCTIONS that call the routes defined in backend/routes/*
import { AvgTurnoverResponse } from "@/types/interfaces";

//eventually make baseURL an .env variable
const baseURL = "https://dockview.onrender.com";

export async function fetchDocks() {
  const res = await fetch(`${baseURL}/docks`, {
    method: "GET",
  });
  if(!res.ok){
    throw new Error("Failed to fetch docks");
  }
  return res.json();
}

export async function fetchDockByID(id:string) {
  const res = await fetch(`${baseURL}/dock/${id}`, {
    method: "GET",
  });
  if(!res.ok){
    throw new Error(`Failed to fetch dock ${id}`);
  }
  return res.json();
}

export async function fetchLoadsCompleted() {
  const res = await fetch(`${baseURL}/stats/loadsCompleted`, {
    method: "GET",
  });
  if(!res.ok){
    throw new Error("Failed to fetch loads completed");
  }
  return res.json();
}

export async function fetchAvgTurnoverTime(days:string): Promise<AvgTurnoverResponse> {
  const res = await fetch(`${baseURL}/stats/turnover/${days}`, {
    method: "GET",
  });
  if(!res.ok){
    throw new Error('Failed to fetch avg turnover');
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
  const res = await fetch(`${baseURL}/controller/action/`, {
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
