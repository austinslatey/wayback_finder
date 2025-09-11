import fetch from "node-fetch";

export async function fetchWaybackSnapshot(url, year = new Date().getFullYear() - 1) {
    if (!url) return null;

    try {
        // YYYY0101 → Jan 1 of last year by default
        const timestamp = `${year}0101`;
        const apiUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}&timestamp=${timestamp}`;

        const res = await fetch(apiUrl);
        if (!res.ok) {
            console.warn(`Wayback API request failed for URL: ${url}`);
            return null;
        }

        const data = await res.json();
        return data.archived_snapshots?.closest?.url || null;

    } catch (err) {
        console.error(`Error fetching Wayback snapshot for URL: ${url}`, err.message);
        return null;
    }
}
