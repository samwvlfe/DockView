export async function fetchDocks() {
  const res = await fetch("https://dockview.onrender.com/api/docks");
  return res.json();
}
