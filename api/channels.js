const M3U_URL = "https://raw.githubusercontent.com/swampod/Live/refs/heads/main/Swamp.m3u";

function parseM3U(text) {
  const lines = text.split(/\r?\n/);
  const channels = [];
  let currentMeta = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      const nameMatch = line.match(/,([^,]+)$/);
      const name = nameMatch ? nameMatch[1].trim() : "Unknown";
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const logo = logoMatch ? logoMatch[1] : "";
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const group = groupMatch ? groupMatch[1] : "Uncategorized";
      currentMeta = { name, logo, group };
    } else if (!line.startsWith("#") && currentMeta) {
      if (line.startsWith("http")) {
        channels.push({
          id: String(channels.length + 1),
          name: currentMeta.name || "Unknown",
          logo: currentMeta.logo || "",
          group: currentMeta.group || "Uncategorized",
          url: line,
        });
      }
      currentMeta = null;
    }
  }
  return channels;
}

export default async function handler(_req, res) {
  try {
    const resp = await fetch(M3U_URL);
    if (!resp.ok) {
      res.status(502).json({ channels: [], total: 0, error: "Failed to fetch M3U" });
      return;
    }
    const text = await resp.text();
    const channels = parseM3U(text);
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate");
    res.status(200).json({ channels, total: channels.length });
  } catch (err) {
    res.status(500).json({ channels: [], total: 0, error: String(err) });
  }
}
