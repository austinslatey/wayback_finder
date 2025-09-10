import fetch from "node-fetch";

export async function fetchWaybackSnapshot(url) {
  const apiUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
  const res = await fetch(apiUrl);
  if (!res.ok) return null;
  const data = await res.json();
  return data.archived_snapshots?.closest?.url || null;
}
