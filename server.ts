import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  tvgId: string;
  healthy: boolean;
  latencyMs: number | null;
}

const app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});
const PORT = 3000;
const M3U_URL = "https://da.gd/VaAUn";

let cachedChannels: Channel[] | null = null;
let lastFetched = 0;
const CACHE_DURATION = 15 * 60 * 1000;

// Health check system
interface HealthResult {
  healthy: boolean;
  latencyMs: number | null;
  lastChecked: number;
}
const healthCache = new Map<string, HealthResult>();
const HEALTH_CHECK_TTL = 5 * 60 * 1000;
let healthCheckIndex = 0;
let healthCheckRunning = false;

const CHECK_TIMEOUT_MS = 3000;
const BATCH_SIZE = 5;

async function checkChannelUrl(url: string): Promise<{ healthy: boolean; latencyMs: number }> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0", "Range": "bytes=0-200" }
    });
    clearTimeout(timer);
    const latency = Math.round(performance.now() - start);
    if (!res.ok && res.status !== 206) return { healthy: false, latencyMs: latency };
    const text = await res.text();
    const healthy = text.includes("#EXTM3U") || text.includes("#EXTINF") || text.includes("#EXT");
    return { healthy, latencyMs: latency };
  } catch {
    return { healthy: false, latencyMs: Math.round(performance.now() - start) };
  }
}

async function runHealthCheckBatch(channels: Channel[]) {
  if (healthCheckRunning || channels.length === 0) return;
  healthCheckRunning = true;
  const now = Date.now();
  let checked = 0;

  for (let i = 0; i < channels.length && checked < BATCH_SIZE; i++) {
    const idx = (healthCheckIndex + i) % channels.length;
    const ch = channels[idx];
    const cached = healthCache.get(ch.id);
    if (cached && (now - cached.lastChecked) < HEALTH_CHECK_TTL) continue;

    const { healthy, latencyMs } = await checkChannelUrl(ch.url);
    healthCache.set(ch.id, { healthy, latencyMs, lastChecked: now });
    ch.healthy = healthy;
    ch.latencyMs = latencyMs;
    checked++;
  }

  healthCheckIndex = (healthCheckIndex + checked) % channels.length;
  healthCheckRunning = false;

  // Schedule next batch if there are still unchecked channels
  const unchecked = channels.filter(ch => {
    const c = healthCache.get(ch.id);
    return !c || (now - c.lastChecked) >= HEALTH_CHECK_TTL;
  });
  if (unchecked.length > 0) {
    setTimeout(() => runHealthCheckBatch(channels), 500);
  }
}

function applyHealthToChannels(channels: Channel[]) {
  const now = Date.now();
  for (const ch of channels) {
    const cached = healthCache.get(ch.id);
    if (cached && (now - cached.lastChecked) < HEALTH_CHECK_TTL) {
      ch.healthy = cached.healthy;
      ch.latencyMs = cached.latencyMs;
    } else {
      ch.healthy = true;
      ch.latencyMs = null;
    }
  }
  return channels;
}

function parseM3U(content: string): Channel[] {
  const lines = content.split(/\r?\n/);
  const channels: Channel[] = [];
  let currentIdCounter = 1;
  let currentMeta: { name: string; logo: string; group: string; tvgId: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      let logo = "";
      const logoMatch = line.match(/tvg-logo="([^"]*)"/) || line.match(/tvg-logo=([^\s,]*)/);
      if (logoMatch) logo = logoMatch[1];

      let group = "Uncategorized";
      const groupMatch = line.match(/group-title="([^"]*)"/) || line.match(/group-title=([^\s,]*)/);
      if (groupMatch) group = groupMatch[1];

      let tvgId = "";
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/) || line.match(/tvg-id=([^\s,]*)/);
      if (tvgIdMatch) tvgId = tvgIdMatch[1];

      let name = "Unknown Channel";
      const commaIndex = line.lastIndexOf(",");
      if (commaIndex !== -1) name = line.substring(commaIndex + 1).trim();

      currentMeta = { name, logo, group, tvgId };
    } else if (line.startsWith("#")) {
      continue;
    } else {
      if (currentMeta) {
        const cleanName = currentMeta.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const id = `${cleanName}-${currentIdCounter++}`;
        const cached = healthCache.get(id);
        channels.push({
          id,
          name: currentMeta.name,
          logo: currentMeta.logo,
          group: currentMeta.group || "Uncategorized",
          url: line,
          tvgId: currentMeta.tvgId || currentMeta.name,
          healthy: cached ? cached.healthy : true,
          latencyMs: cached ? cached.latencyMs : null,
        });
        currentMeta = null;
      }
    }
  }

  return channels;
}

async function getChannels(): Promise<Channel[]> {
  const now = Date.now();
  if (cachedChannels && (now - lastFetched) < CACHE_DURATION) {
    if (cachedChannels.length > 0) {
      applyHealthToChannels(cachedChannels);
      runHealthCheckBatch(cachedChannels);
    }
    return cachedChannels;
  }

  try {
    console.log(`Fetching latest M3U playlist from: ${M3U_URL}`);
    const response = await fetch(M3U_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
    });

    if (!response.ok) throw new Error(`Failed to fetch M3U playlist: ${response.statusText}`);

    const playlistText = await response.text();
    const channels = parseM3U(playlistText);
    console.log(`Successfully parsed ${channels.length} channels.`);
    applyHealthToChannels(channels);

    cachedChannels = channels;
    lastFetched = now;

    // Start health check in background
    runHealthCheckBatch(channels);

    return channels;
  } catch (error) {
    console.error("Error retrieving M3U streams:", error);
    return cachedChannels || [];
  }
}

app.get("/api/channels", async (req, res) => {
  try {
    const channels = await getChannels();
    const showAll = req.query.all === "true";
    // By default, prioritize healthy channels first
    const sorted = [...channels].sort((a, b) => {
      if (a.healthy !== b.healthy) return a.healthy ? -1 : 1;
      if (a.latencyMs !== null && b.latencyMs !== null) return a.latencyMs - b.latencyMs;
      return 0;
    });
    // Option to show only healthy channels
    if (!showAll) {
      res.json({ channels: sorted, total: sorted.length, healthy: sorted.filter(c => c.healthy).length });
    } else {
      res.json({ channels: sorted, total: sorted.length, healthy: sorted.filter(c => c.healthy).length });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load channel list" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    count: cachedChannels ? cachedChannels.length : 0,
    healthyCount: cachedChannels ? cachedChannels.filter(c => c.healthy).length : 0,
    healthCacheSize: healthCache.size,
  });
});

async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Live TV backend server running on http://localhost:${PORT}`);
  });
}

bootstrap();
