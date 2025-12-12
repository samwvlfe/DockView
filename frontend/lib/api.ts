// Fetch database data

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