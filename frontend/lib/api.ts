// FUNCTIONS that call the routes defined in backend/routes/*

//eventually make baseURL an .env variable

import { AvgTurnoverResponse } from "@/types/interfaces";

export async function fetchDocks() {
  const res = await fetch("https://dockview.onrender.com/api/docks");
  if(!res.ok){
    throw new Error("Failed to fetch docks");
  }
  return res.json();
}

export async function fetchDockByID(id:string) {
  const res = await fetch(`https://dockview.onrender.com/api/dock/${id}`);
  if(!res.ok){
    throw new Error(`Failed to fetch dock ${id}`);
  }
  return res.json();
}

export async function fetchLoadsCompleted() {
  const res = await fetch("https://dockview.onrender.com/api/stats/loadsCompleted");
  if(!res.ok){
    throw new Error("Failed to fetch loads completed");
  }
  return res.json();
}

export async function fetchAvgTurnoverTime(days:string): Promise<AvgTurnoverResponse> {
  const res = await fetch(`https://dockview.onrender.com/api/stats/turnover/${days}`);
  if(!res.ok){
    throw new Error('Failed to fetch avg turnover');
  } 
  return res.json();
}

//get sensors by dock_id
export async function fetchSensorsByDockID(id:string) {
  const res = await fetch(`http://dockview.onrender.com/sensors/${id}`);
  if(!res.ok){
    throw new Error(`Failed to fetch sensors for dock ${id}`);
  }
  return res.json();
}