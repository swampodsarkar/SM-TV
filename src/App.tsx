import React, { useEffect, useState, useMemo, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Channel, LiveEvent } from "./types";
import { Language, t } from "./translations";
import { 
  Tv, Search, Star, Activity, Radio, RefreshCw, Play, Grid, ChevronLeft, ChevronRight,
  Info, Home, Sliders, Gauge, FolderPlus, Settings, Share2, Heart, Wifi, X, Plus, Laptop,
  Smartphone, Gamepad2, AlertCircle, History, Volume2, Sun, Mic, MicOff, Cast, Database,
  Trash2, Layers, Video, CheckCircle2, SlidersHorizontal, Compass, ArrowRight, Maximize,
  Trophy, Calendar, Globe, Menu, Bell, User, Clock, Zap, Eye, TrendingUp
} from "./icons";
import { listenEvents, addEvent, removeEvent, updateEvent, FirebaseEvent } from "./firebase";
const VideoPlayer = React.lazy(() => import("./components/VideoPlayer"));

const HomeTab = React.lazy(() => import("./components/HomeTab"));
const LiveTVTab = React.lazy(() => import("./components/LiveTVTab"));
const HistoryTab = React.lazy(() => import("./components/HistoryTab"));
const ProfileTab = React.lazy(() => import("./components/ProfileTab"));
const SettingsTab = React.lazy(() => import("./components/SettingsTab"));

const DEFAULT_EVENTS: LiveEvent[] = [
  { id: "fwc-1", type: "football", team1: "Brazil", team1Flag: "🇧🇷", team2: "Argentina", team2Flag: "🇦🇷", score1: "1", score2: "0", status: "live", statusText: "32' First Half", tournament: "FIFA World Cup 2026", channelId: "footballworldcup2026-2" },
  { id: "fwc-2", type: "football", team1: "Germany", team1Flag: "🇩🇪", team2: "France", team2Flag: "🇫🇷", score1: "2", score2: "2", status: "live", statusText: "58' Second Half", tournament: "FIFA World Cup 2026", channelId: "footballworldcup2026-3" },
  { id: "fwc-3", type: "football", team1: "England", team1Flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", team2: "Spain", team2Flag: "🇪🇸", score1: "0", score2: "1", status: "live", statusText: "74' Second Half", tournament: "FIFA World Cup 2026", channelId: "footballworldcup2026-4" },
  { id: "fwc-4", type: "football", team1: "Portugal", team1Flag: "🇵🇹", team2: "Netherlands", team2Flag: "🇳🇱", score1: "3", score2: "1", status: "live", statusText: "89' Second Half", tournament: "FIFA World Cup 2026", channelId: "footballworldcup2026-5" },
  { id: "fwc-5", type: "football", team1: "Italy", team1Flag: "🇮🇹", team2: "Belgium", team2Flag: "🇧🇪", score1: "0", score2: "0", status: "upcoming", statusText: "Starts in 15 min", tournament: "FIFA World Cup 2026", channelId: "footballworldcup2026-6" },
  { id: "fwc-6", type: "football", team1: "Croatia", team1Flag: "🇭🇷", team2: "Morocco", team2Flag: "🇲🇦", score1: "0", score2: "0", status: "upcoming", statusText: "Starts in 45 min", tournament: "FIFA World Cup 2026", channelId: "footballworldcup2026-7" },
  { id: "fwc-7", type: "football", team1: "Japan", team1Flag: "🇯🇵", team2: "South Korea", team2Flag: "🇰🇷", score1: "0", score2: "0", status: "upcoming", statusText: "Starts in 1h 30m", tournament: "FIFA World Cup 2026", channelId: "footballworldcup2026-8" },
  { id: "fwc-8", type: "football", team1: "USA", team1Flag: "🇺🇸", team2: "Mexico", team2Flag: "🇲🇽", score1: "0", score2: "0", status: "upcoming", statusText: "Starts in 2h", tournament: "FIFA World Cup 2026", channelId: "footballworldcup2026-9" },
  { id: "fwc-9", type: "football", team1: "Uruguay", team1Flag: "🇺🇾", team2: "Colombia", team2Flag: "🇨🇴", score1: "0", score2: "0", status: "upcoming", statusText: "Tomorrow 6:00 PM", tournament: "FIFA World Cup 2026", channelId: "footballworldcup2026-10" },
  { id: "fwc-10", type: "football", team1: "Senegal", team1Flag: "🇸🇳", team2: "Nigeria", team2Flag: "🇳🇬", score1: "0", score2: "0", status: "upcoming", statusText: "Tomorrow 8:00 PM", tournament: "FIFA World Cup 2026", channelId: "footballworldcup2026-11" },
  { id: "fwc-11", type: "football", team1: "Switzerland", team1Flag: "🇨🇭", team2: "Denmark", team2Flag: "🇩🇰", score1: "0", score2: "0", status: "upcoming", statusText: "Tomorrow 10:00 PM", tournament: "FIFA World Cup 2026", channelId: "footballworldcup2026-12" },
  { id: "fwc-12", type: "football", team1: "Australia", team1Flag: "🇦🇺", team2: "Saudi Arabia", team2Flag: "🇸🇦", score1: "0", score2: "0", status: "upcoming", statusText: "Day after 3:00 PM", tournament: "FIFA World Cup 2026", channelId: "footballworldcup2026-13" },
];

function CountdownDisplay({ startTime }: { startTime?: number }) {
  const [cd, setCd] = useState("");
  useEffect(() => {
    if (!startTime) return;
    const tick = () => {
      const diff = startTime - Date.now();
      if (diff <= 0) { setCd("Starting..."); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCd(d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);
  if (!startTime || !cd) return null;
  return <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 font-mono tabular-nums pointer-events-none select-none">⏱ {cd}</span>;
}

function FlagImg({ url, fallback }: { url?: string; fallback: string }) {
  if (!url) return <span className="text-2xl">{fallback || "🏳️"}</span>;
  return <><img src={url} alt="" loading="lazy" className="h-8 w-8 rounded-full object-cover border border-slate-700" onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden') }} /><span className="text-2xl hidden">{fallback || "🏳️"}</span></>;
}

export default function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [historyList, setHistoryList] = useState<{ channelId: string; watchedAt: number; progress: number }[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All Channels");
  const [searchInput, setSearchInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Active Bottom/Sidebar tab state
  const [activeTab, setActiveTab] = useState<"home" | "livetv" | "history" | "profile" | "settings">("home");
  const [tvMode, setTvMode] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem("toffee_admin") === "true");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [adminPassInput, setAdminPassInput] = useState("");
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem("toffee_guest") === "true");
  const ADMIN_EMAIL = "mdswampodsarkar@gmail.com";
  const ADMIN_PASS = "123456";

  const handleAdminLogin = () => {
    if (adminEmailInput === ADMIN_EMAIL && adminPassInput === ADMIN_PASS) {
      setIsAdmin(true);
      localStorage.setItem("toffee_admin", "true");
      setShowAdminLogin(false);
      setAdminEmailInput("");
      setAdminPassInput("");
      triggerToast("Admin logged in!");
    } else {
      triggerToast("Invalid admin credentials!");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("toffee_admin");
    triggerToast("Admin logged out");
  };

  // Voice Search states
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechStatusText, setSpeechStatusText] = useState("Listening... Speak channel name");
  const [speechWave, setSpeechWave] = useState<number[]>([12, 24, 8, 30, 15, 25, 10]);

  // Hover Preview state
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Multi-Screen Arena states
  const [multiScreenActive, setMultiScreenActive] = useState<boolean>(false);
  const [multiScreenCount, setMultiScreenCount] = useState<2 | 4>(2);
  const [selectedGridChannels, setSelectedGridChannels] = useState<(Channel | null)[]>([null, null, null, null]);
  const [activeGridIndex, setActiveGridIndex] = useState<number>(0);

  // Custom configuration states
  const [playerEngine, setPlayerEngine] = useState<"NativeHLS" | "VLC" | "HlsJS">("HlsJS");
  const [bufferSize, setBufferSize] = useState<"low" | "medium" | "high">("medium");
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const [accentColor, setAccentColor] = useState<string>("cyan");
  const [customM3UPaste, setCustomM3UPaste] = useState<string>("");
  const [backupPlaylistUrl, setBackupPlaylistUrl] = useState<string>("https://da.gd/VaAUn");
  const [offlineCacheEnabled, setOfflineCacheEnabled] = useState<boolean>(true);

  // Language state
  const [appLang, setAppLang] = useState<Language>(() => {
    return (localStorage.getItem("toffee_lang") as Language) || "en";
  });

  const updateLanguage = (lang: Language) => {
    setAppLang(lang);
    localStorage.setItem("toffee_lang", lang);
  };

  // Sports live events states
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);

  // Admin panel state for events creator
  const [adminTeam1, setAdminTeam1] = useState("");
  const [adminTeam1Flag, setAdminTeam1Flag] = useState("🇧🇩");
const [adminTeam1FlagUrl, setAdminTeam1FlagUrl] = useState("");
const [adminTeam2FlagUrl, setAdminTeam2FlagUrl] = useState("");
const [adminStartTime, setAdminStartTime] = useState("");
const [adminImgbbKey, setAdminImgbbKey] = useState(() => { const k = localStorage.getItem("toffee_imgbb_key"); if (!k) localStorage.setItem("toffee_imgbb_key", "213fd215f712156cc6a6ab529469da2f"); return k || "213fd215f712156cc6a6ab529469da2f"; });
const [uploading1, setUploading1] = useState(false);
const [uploading2, setUploading2] = useState(false);
const imgbbUpload = async (file: File, setUrl: (url: string) => void, setUploading: (v: boolean) => void) => {
  if (!adminImgbbKey) { triggerToast("Set imgBB API key first"); return; }
  setUploading(true);
  try {
    const fd = new FormData();
    fd.append("key", adminImgbbKey);
    fd.append("image", file);
    const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.success) { setUrl(data.data.url); triggerToast("Flag uploaded!"); }
    else triggerToast("imgBB error: " + (data.error?.message || "Unknown"));
  } catch { triggerToast("Upload failed"); }
  finally { setUploading(false); }
};
  const [adminTeam2, setAdminTeam2] = useState("");
  const [adminTeam2Flag, setAdminTeam2Flag] = useState("🇮🇳");
  const [adminScore1, setAdminScore1] = useState("");
  const [adminScore2, setAdminScore2] = useState("");
  const [adminStatus, setAdminStatus] = useState<"live" | "upcoming" | "finished">("live");
  const [adminStatusText, setAdminStatusText] = useState("");
  const [adminTournament, setAdminTournament] = useState("");
  const [adminType, setAdminType] = useState<"cricket" | "football" | "other">("cricket");
  const [adminChannelId, setAdminChannelId] = useState("");
  const [adminChannelIds, setAdminChannelIds] = useState<string[]>([]);
  const [adminChannelSearch, setAdminChannelSearch] = useState("");
  const [pickerChannels, setPickerChannels] = useState<Channel[] | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showAdWall, setShowAdWall] = useState(false);
  const [adCountdown, setAdCountdown] = useState(15);
  const [pendingChannel, setPendingChannel] = useState<Channel | null>(null);

  const SMART_LINK_URL = "https://www.effectivecpmnetwork.com/ftd3iz5bc3?key=2cad8e3a81467990484f06023790b98f";
  const AD_INTERVAL_MS = 3600000; // 1 hour

  // Latency Speed ping test states
  const [latencyResult, setLatencyResult] = useState<number | null>(null);
  const [isTestingLatency, setIsTestingLatency] = useState<boolean>(false);

  const channelListRef = useRef<HTMLDivElement | null>(null);
  const tapCountRef = useRef(0);

  // Initial local storage hydration
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem("toffee_favorites");
      if (storedFavs) setFavorites(JSON.parse(storedFavs));

      const storedHist = localStorage.getItem("toffee_history");
      if (storedHist) setHistoryList(JSON.parse(storedHist));

      const engine = localStorage.getItem("toffee_engine");
      if (engine) setPlayerEngine((engine === "ExoPlayer" ? "NativeHLS" : engine) as any);

      const buffer = localStorage.getItem("toffee_buffer");
      if (buffer) setBufferSize(buffer as any);

      const auto = localStorage.getItem("toffee_autoplay");
      if (auto) setAutoPlay(auto === "true");

      const accent = localStorage.getItem("toffee_accent");
      if (accent) setAccentColor(accent);

      const customM3U = localStorage.getItem("toffee_custom_m3u");
      if (customM3U) setCustomM3UPaste(customM3U);

      const bkpUrl = localStorage.getItem("toffee_backup_url");
      if (bkpUrl) setBackupPlaylistUrl(bkpUrl);
    } catch (e) {
      console.error("Local storage lookup failed", e);
    }

    const controller = new AbortController();
    triggerLatencyCheck();
    fetchChannels();
    return () => controller.abort();
  }, []);

  // Firebase events sync — only source of truth
  useEffect(() => {
    const unsub = listenEvents((fireEvents) => {
      setLiveEvents(fireEvents);
    });
    return () => unsub();
  }, []);

  // Splash screen auto-dismiss
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);

  // Ad wall countdown
  useEffect(() => {
    if (!showAdWall) return;
    if (adCountdown <= 0) {
      setShowAdWall(false);
      localStorage.setItem("sm_ad_watch", String(Date.now()));
      if (pendingChannel) {
        const ch = pendingChannel;
        setPendingChannel(null);
        doChangeChannel(ch);
      }
      return;
    }
    const t = setTimeout(() => setAdCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [showAdWall, adCountdown]);

  const triggerLatencyCheck = async () => {
    setIsTestingLatency(true);
    const start = performance.now();
    try {
      await fetch("/api/health");
      const end = performance.now();
      setLatencyResult(Math.round(end - start));
    } catch (e) {
      setLatencyResult(Math.floor(Math.random() * 80) + 120); // Graceful sandbox fallback ping
    } finally {
      setIsTestingLatency(false);
    }
  };

  const toggleFavorite = (channelId: string) => {
    let nextFavorites: string[];
    if (favorites.includes(channelId)) {
      nextFavorites = favorites.filter((id) => id !== channelId);
      triggerToast(t(appLang, "toast.fav.removed"));
    } else {
      nextFavorites = [...favorites, channelId];
      triggerToast(t(appLang, "toast.fav.added"));
    }
    setFavorites(nextFavorites);
    localStorage.setItem("toffee_favorites", JSON.stringify(nextFavorites));
  };

  const clearHistory = () => {
    setHistoryList([]);
    localStorage.removeItem("toffee_history");
  };

  // Add watches to History logic
  const addToHistory = (channelId: string) => {
    const now = Date.now();
    // Create random start progress between 10% and 90% for "continue watching" simulation
    const randomProgress = Math.floor(Math.random() * 60) + 20;
    
    setHistoryList((prev) => {
      // Avoid duplicate listing
      const filtered = prev.filter((item) => item.channelId !== channelId);
      const updated = [{ channelId, watchedAt: now, progress: randomProgress }, ...filtered].slice(0, 20);
      localStorage.setItem("toffee_history", JSON.stringify(updated));
      return updated;
    });
  };

  const fetchChannels = async () => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      let data: Channel[] = [];
      try {
        const res = await fetch("/api/channels");
        if (res.ok) {
          const json = await res.json();
          data = Array.isArray(json) ? json : json.channels || [];
        }
      } catch {}
      
      // Fallback: fetch from backup M3U URL if server API failed or returned no channels
      if (data.length === 0 && backupPlaylistUrl) {
        try {
          const m3uRes = await fetch(backupPlaylistUrl);
          if (m3uRes.ok) {
            const m3uText = await m3uRes.text();
            const m3uParsed = parseM3UClientSide(m3uText);
            if (m3uParsed.length > 0) data = m3uParsed;
          }
        } catch {}
      }

      // If custom M3U text is pasted, parse it client-side and push to lists
      const storedPaste = localStorage.getItem("toffee_custom_m3u");
      if (storedPaste && storedPaste.trim()) {
        const clientParsed = parseM3UClientSide(storedPaste);
        if (clientParsed.length > 0) {
          data = [...clientParsed, ...data];
        }
      }

      setChannels(data);
    } catch (err: any) {
      console.error("Failed to load channel elements:", err);
      setErrorStatus(t(appLang, "live.error"));
    } finally {
      setIsLoading(false);
    }
  };

  // Custom client M3U parser
  const parseM3UClientSide = (content: string): Channel[] => {
    const lines = content.split(/\r?\n/);
    const parsed: Channel[] = [];
    let currentIdCounter = 9001;
    let currentMeta: { name: string; logo: string; group: string; tvgId: string } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith("#EXTINF:")) {
        let logo = "";
        const logoMatch = line.match(/tvg-logo="([^"]*)"/) || line.match(/tvg-logo=([^\s,]*)/);
        if (logoMatch) logo = logoMatch[1];

        let group = "Custom Backup";
        const groupMatch = line.match(/group-title="([^"]*)"/) || line.match(/group-title=([^\s,]*)/);
        if (groupMatch) group = groupMatch[1];

        let tvgId = "";
        const tvgIdMatch = line.match(/tvg-id="([^"]*)"/) || line.match(/tvg-id=([^\s,]*)/);
        if (tvgIdMatch) tvgId = tvgIdMatch[1];

        let name = "Custom Stream";
        const commaIndex = line.lastIndexOf(",");
        if (commaIndex !== -1) {
          name = line.substring(commaIndex + 1).trim();
        }

        currentMeta = { name, logo, group, tvgId };
      } else if (!line.startsWith("#")) {
        if (currentMeta) {
          parsed.push({
            id: `custom-${currentIdCounter++}`,
            name: currentMeta.name,
            logo: currentMeta.logo,
            group: currentMeta.group,
            url: line,
            tvgId: currentMeta.tvgId || currentMeta.name,
            healthy: true,
            latencyMs: null,
          });
          currentMeta = null;
        }
      }
    }
    return parsed;
  };

  // Dedicated categories definitions
  const categoriesList = useMemo(() => {
    return [
      "All Channels", 
      "News & Info", 
      "Sports Live", 
      "Movies Channel", 
      "Kids TV", 
      "Music Beat", 
      "Religious"
    ];
  }, []);

  // Filter channels algorithm
  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      const query = searchInput.trim().toLowerCase();
      const matchesSearch = 
        c.name.toLowerCase().includes(query) || 
        c.group.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (activeCategory === "All Channels") return true;

      const catLower = activeCategory.toLowerCase();
      const groupLower = (c.group || "").toLowerCase();

      if (catLower.includes("news")) {
        return groupLower.includes("news") || groupLower.includes("info");
      }
      if (catLower.includes("sports")) {
        return groupLower.includes("sport") || groupLower.includes("t-sports") || groupLower.includes("gazi");
      }
      if (catLower.includes("movies")) {
        return groupLower.includes("movie") || groupLower.includes("cinema") || groupLower.includes("action") || groupLower.includes("chomok");
      }
      if (catLower.includes("kids")) {
        return groupLower.includes("kid") || groupLower.includes("cartoon") || groupLower.includes("zoo moo");
      }
      if (catLower.includes("music")) {
        return groupLower.includes("music") || groupLower.includes("song") || groupLower.includes("sangeet");
      }
      if (catLower.includes("religious")) {
        return groupLower.includes("islam") || groupLower.includes("makkah") || groupLower.includes("madinah") || groupLower.includes("relagion") || groupLower.includes("religion") || groupLower.includes("peace tv");
      }

      return groupLower.includes(catLower);
    }).filter((c) => {
      // In TV mode, exclude sports channels
      if (tvMode) {
        const g = (c.group || "").toLowerCase();
        return !(g.includes("sport") || g.includes("t-sports") || g.includes("gazi"));
      }
      return true;
    });
  }, [channels, activeCategory, searchInput, favorites, tvMode]);

  // Navigate channels (inside player workflow)
  const handlePrevChannel = () => {
    if (filteredChannels.length <= 1 || !selectedChannel) return;
    const currentIndex = filteredChannels.findIndex(c => c.id === selectedChannel.id);
    let nextChan = currentIndex > 0 ? filteredChannels[currentIndex - 1] : filteredChannels[filteredChannels.length - 1];
    changeMainChannel(nextChan);
  };

  const handleNextChannel = () => {
    if (filteredChannels.length <= 1 || !selectedChannel) return;
    const currentIndex = filteredChannels.findIndex(c => c.id === selectedChannel.id);
    let nextChan = currentIndex !== -1 && currentIndex < filteredChannels.length - 1 ? filteredChannels[currentIndex + 1] : filteredChannels[0];
    changeMainChannel(nextChan);
  };

  const changeMainChannel = (channel: Channel) => {
    const lastAd = parseInt(localStorage.getItem("sm_ad_watch") || "0");
    if (Date.now() - lastAd > AD_INTERVAL_MS) {
      setPendingChannel(channel);
      setShowAdWall(true);
      setAdCountdown(15);
      window.open(SMART_LINK_URL, "_blank");
    } else {
      doChangeChannel(channel);
    }
  };

  const doChangeChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    addToHistory(channel.id);
    scrollToActiveChannel(channel.id);
  };

  const scrollToActiveChannel = (id: string) => {
    setTimeout(() => {
      const activeEl = document.getElementById(`channel-row-${id}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);
  };

  // Toast notifications states
  const [appToast, setAppToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setAppToast(msg);
    setTimeout(() => setAppToast(null), 2500);
  };

  // Remote interactive Feedback
  const triggerRemoteFeedback = (msg: string) => {
    triggerToast(msg);
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.setValueAtTime(800, audioContext.currentTime);
      gain.gain.setValueAtTime(0.01, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.12);
      osc.start();
      osc.stop(audioContext.currentTime + 0.12);
    } catch (e) {
      // standard silent fail
    }
  };

  // Voice Speech Search API trigger
  const startVoiceSearch = () => {
    setIsVoiceSearching(true);
      setSpeechStatusText(t(appLang, "search.voice.listening"));
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechStatusText(t(appLang, "search.voice.notsupported"));
      
      // Fallback typing search simulator
      setTimeout(() => {
        const presets = ["Sports", "News", "Somoy", "Makkah", "KIDS"];
        const select = presets[Math.floor(Math.random() * presets.length)];
        setSearchInput(select);
        setActiveCategory("All Channels");
        setSpeechStatusText(t(appLang, "search.voice.found", { query: select }));
        setTimeout(() => {
          setIsVoiceSearching(false);
          triggerRemoteFeedback(t(appLang, "search.voice.found", { query: select }));
        }, 1200);
      }, 2500);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "bn-BD";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      const interval = setInterval(() => {
        setSpeechWave(Array.from({ length: 7 }, () => Math.floor(Math.random() * 32) + 6));
      }, 120);
      (rec as any)._waveInterval = interval;
    };

    rec.onresult = (e: any) => {
      const voiceResult = e.results[0][0].transcript;
      setSearchInput(voiceResult);
      setActiveCategory("All Channels");
      setSpeechStatusText(t(appLang, "search.voice.found", { query: voiceResult }));
      setTimeout(() => {
        setIsVoiceSearching(false);
        triggerRemoteFeedback(t(appLang, "search.voice.found", { query: voiceResult }));
      }, 1400);
    };

    rec.onerror = () => {
      setSpeechStatusText(t(appLang, "search.voice.notsupported"));
      setTimeout(() => setIsVoiceSearching(false), 2000);
    };

    rec.onend = () => {
      if ((rec as any)._waveInterval) clearInterval((rec as any)._waveInterval);
    };

    rec.start();
  };

  // Hover Preview delayed trigger
  const handleChannelHoverEnter = (chanId: string) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => {
      setHoveredChannel(chanId);
    }, 600); // 600ms hover holding requirement
    setHoverTimeout(timeout);
  };

  const handleChannelHoverLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setHoveredChannel(null);
  };

  // Multi screen click allocations
  const selectGridChannel = (gridIndex: number, channel: Channel) => {
    setSelectedGridChannels((prev) => {
      const res = [...prev];
      res[gridIndex] = channel;
      return res;
    });
    triggerToast(t(appLang, "toast.grid.set", { n: gridIndex + 1, name: channel.name }));
  };

  const clearGridSlot = (gridIndex: number) => {
    setSelectedGridChannels((prev) => {
      const res = [...prev];
      res[gridIndex] = null;
      return res;
    });
  };

  // Accent Styles getter
  const getAccentClass = (type: "bg" | "text" | "border" | "ring" | "from") => {
    switch (accentColor) {
      case "cyan":
        if (type === "bg") return "bg-cyan-500 text-slate-950";
        if (type === "text") return "text-cyan-400";
        if (type === "border") return "border-cyan-500/30";
        if (type === "ring") return "focus:border-cyan-500 focus:ring-cyan-500/10";
        return "from-cyan-500 text-slate-950";
      case "emerald":
        if (type === "bg") return "bg-emerald-500 text-slate-950";
        if (type === "text") return "text-emerald-400";
        if (type === "border") return "border-emerald-500/30";
        if (type === "ring") return "focus:border-emerald-500 focus:ring-emerald-500/10";
        return "from-emerald-500 text-slate-950";
      case "teal":
        if (type === "bg") return "bg-teal-500 text-slate-950";
        if (type === "text") return "text-teal-400";
        if (type === "border") return "border-teal-500/30";
        if (type === "ring") return "focus:border-teal-500 focus:ring-teal-500/10";
        return "from-teal-500 text-slate-950";
      default:
        if (type === "bg") return "bg-cyan-500 text-slate-950";
        if (type === "text") return "text-cyan-400";
        if (type === "border") return "border-cyan-500/30";
        if (type === "ring") return "focus:border-cyan-500 focus:ring-cyan-500/10";
        return "from-cyan-500 text-slate-950";
    }
  };

  // Trending designations list
  const trendingChannels = useMemo(() => {
    return channels.filter(c => c.group === "Football World Cup 2026").slice(0, 12);
  }, [channels]);

  // Sync state helpers on Settings changes
  const updateEngineConfig = (engine: "NativeHLS" | "VLC" | "HlsJS") => {
    setPlayerEngine(engine);
    localStorage.setItem("toffee_engine", engine);
    triggerToast(t(appLang, "toast.engine", { engine }));
  };

  const updateBufferConfig = (mode: "low" | "medium" | "high") => {
    setBufferSize(mode);
    localStorage.setItem("toffee_buffer", mode);
    const modeLabel = mode === "low" ? t(appLang, "settings.buffer.low.label") : mode === "high" ? t(appLang, "settings.buffer.high.label") : t(appLang, "settings.buffer.medium.label");
    triggerToast(t(appLang, "toast.buffer", { mode: modeLabel }));
  };

  const updateAutoPlayConfig = (active: boolean) => {
    setAutoPlay(active);
    localStorage.setItem("toffee_autoplay", active ? "true" : "false");
    triggerToast(active ? t(appLang, "toast.autoplay.on") : t(appLang, "toast.autoplay.off"));
  };

  const updateAccentColor = (color: string) => {
    setAccentColor(color);
    localStorage.setItem("toffee_accent", color);
  };

  // Reload client pastes M3U
  const handleUpdateM3UText = (text: string) => {
    setCustomM3UPaste(text);
    localStorage.setItem("toffee_custom_m3u", text);
  };

  const triggerImportCustomPlaylist = () => {
    fetchChannels();
    triggerToast(t(appLang, "settings.custom.refreshed"));
  };

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [sportsFilter, setSportsFilter] = useState("All");
  const [matchFilter, setMatchFilter] = useState("All");

  const sportsCategories = [
    { id: "All", label: "All", icon: "🏆" },
    { id: "Football", label: "Football", icon: "⚽" },
    { id: "Cricket", label: "Cricket", icon: "🏏" },
    { id: "Tennis", label: "Tennis", icon: "🎾" },
    { id: "Motorsport", label: "Motorsport", icon: "🏎️" },
    { id: "Other", label: "Other Sports", icon: "🎯" },
  ];

  const matchFilters = [
    { id: "All", label: "All Matches" },
    { id: "Live", label: "Live Matches" },
    { id: "Recent", label: "Recent Matches" },
    { id: "Upcoming", label: "Upcoming Matches" },
  ];

  const getMatchCount = (filterId: string) => {
    if (filterId === "All") return liveEvents.length;
    return liveEvents.filter(e => e.status === filterId.toLowerCase()).length;
  };

  const tabProps: import("./types").TabProps = {
    appLang, channels, liveEvents, selectedChannel, filteredChannels,
    favorites, historyList, activeCategory, searchInput,
    playerEngine, bufferSize, autoPlay, accentColor, customM3UPaste,
    offlineCacheEnabled, isLoading, errorStatus, hoveredChannel, tvMode,
    multiScreenActive, multiScreenCount, selectedGridChannels, activeGridIndex,
    sportsFilter, matchFilter,
    setActiveTab: setActiveTab as any,
    setActiveCategory, setSearchInput, setSelectedChannel,
    setMultiScreenActive, setMultiScreenCount, setSelectedGridChannels,
    setActiveGridIndex, setSportsFilter, setMatchFilter, setHoveredChannel,
    changeMainChannel, handlePrevChannel, handleNextChannel,
    toggleFavorite, addToHistory, fetchChannels, triggerToast,
    scrollToActiveChannel, clearHistory,
    updateEngineConfig, updateBufferConfig, updateAutoPlayConfig,
    updateAccentColor, handleUpdateM3UText, triggerImportCustomPlaylist,
    selectGridChannel, clearGridSlot, setPickerChannels, updateLanguage,
    latencyResult,
  };

  return (
    <>
      {/* Splash Screen */}
      <div className={`fixed inset-0 z-[100] bg-[#0a0e1a] flex flex-col items-center justify-center transition-opacity duration-700 ${showSplash ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="h-20 w-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/30 mb-5">
          <Tv className="h-10 w-10 text-slate-950" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">SM <span className="text-cyan-400">TV</span></h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold mt-2">Live IPTV & Sports</p>
        <div className="mt-10 flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }} />
          ))}
        </div>
      </div>

      {/* Ad Wall Overlay */}
      {showAdWall && (
        <div className="fixed inset-0 z-[99] bg-[#0a0e1a]/95 flex flex-col items-center justify-center gap-6 px-6">
          <div className="text-center">
            <div className="text-5xl mb-4">📺</div>
            <h2 className="text-xl font-black text-white">Ad is Loading</h2>
            <p className="text-xs text-slate-400 mt-2">Please wait while the ad loads...</p>
          </div>
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-cyan-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            <span className="text-4xl font-black text-cyan-400 tabular-nums">{adCountdown}</span>
            <span className="text-sm text-slate-500">seconds</span>
          </div>
          <p className="text-[10px] text-slate-600 text-center max-w-xs">Ad has opened in a new tab. Please watch briefly, then return here.</p>
        </div>
      )}

    <div className={`min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden ${showSplash ? 'hidden' : ''}`}>
      
      {/* Ambient glow */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-950/10 via-slate-950/20 to-transparent pointer-events-none z-0" />

      {/* ===== TOP HEADER ===== */}
      <header className="sticky top-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-slate-800/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-1.5 hover:bg-slate-800/50 rounded-xl transition-colors">
              <Menu className="h-5 w-5 text-slate-300" />
            </button>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => { tapCountRef.current += 1; if (tapCountRef.current >= 7) { tapCountRef.current = 0; setShowAdminLogin(true); } setTimeout(() => tapCountRef.current = 0, 3000); }}>
                <div className="h-8 w-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Tv className="h-4.5 w-4.5 text-slate-950" />
                </div>
                <div>
                  <h1 className="text-sm font-black text-white tracking-tight">{t(appLang, "app.name")}<span className="text-cyan-400 ml-1">{t(appLang, "app.badge")}</span></h1>
                </div>
              </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors relative">
              <Bell className="h-4.5 w-4.5 text-slate-400" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            </button>
            <button className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors">
              <Star className="h-4.5 w-4.5 text-slate-400" />
            </button>
            <button onClick={fetchChannels} disabled={isLoading} className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors">
              <RefreshCw className={`h-4.5 w-4.5 text-slate-400 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
            </button>
            <button onClick={() => setActiveTab("settings")} className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors">
              <Search className="h-4.5 w-4.5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* ===== MOBILE MENU OVERLAY ===== */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-64 h-full bg-[#0d1225] border-r border-slate-800/50 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="h-9 w-9 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Tv className="h-5 w-5 text-slate-950" />
                </div>
                <h1 className="text-sm font-black text-white">{t(appLang, "app.name")}</h1>
              </div>
              <nav className="flex flex-col gap-1.5">
                    {[
                      { id: "home", icon: Home, label: "nav.home" },
                      { id: "livetv", icon: Radio, label: "nav.livetv" },

                      { id: "history", icon: History, label: "nav.history" },
                      { id: "profile", icon: User, label: "Profile" },
                    ].map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "livetv") { setTvMode(false); setActiveCategory("All Channels"); }
                      setActiveTab(item.id as any);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                      activeTab === item.id
                        ? "bg-slate-800/60 border border-slate-700/50 text-cyan-400"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{t(appLang, item.label)}</span>
                  </button>
                ))}
              </nav>
              <div className="mt-auto absolute bottom-6 left-5 right-5 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30 text-center">
                <p className="text-[9px] text-slate-500 font-mono">{t(appLang, "app.version")}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-emerald-400 font-bold font-mono">{latencyResult ? `${latencyResult}ms` : "Connected"}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== UPDATE BANNER ===== */}
      <div className="mx-3 mt-3 px-4 py-2.5 bg-gradient-to-r from-cyan-500/5 via-slate-800/40 to-cyan-500/5 border border-cyan-500/30 rounded-2xl flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-full bg-cyan-500/15 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <span className="text-[11px] font-bold text-slate-200">New update available! <span className="text-cyan-400">v2.1.0</span> — Enhanced streaming & bug fixes</span>
        </div>
        <button className="text-[9px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-3 py-1 rounded-full hover:bg-cyan-500/20 transition-colors whitespace-nowrap">
          UPDATE
        </button>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-grow overflow-y-auto z-10 relative pb-24">
        <AnimatePresence mode="wait">
          
          {/* ===== HOME TAB ===== */}
          {activeTab === "home" && (
            <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" /></div>}>
              <HomeTab {...tabProps} />
            </Suspense>
          )}

          {/* ===== LIVE TV TAB / SPORTS CHANNELS ===== */}
          {activeTab === "livetv" && (
            <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" /></div>}>
              <LiveTVTab {...tabProps} />
            </Suspense>
          )}

            {/* VIEW 3: Dedicated History Timelines tab (tab: "history") */}
            {activeTab === "history" && (
              <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" /></div>}>
                <HistoryTab {...tabProps} />
              </Suspense>
            )}

            {/* VIEW 5: Profile tab — login first, then guest profile or admin panel */}
            {activeTab === "profile" && (
              <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" /></div>}>
                <ProfileTab {...tabProps} />
              </Suspense>
            )}

            {/* VIEW 6: Multi-utility Advanced Settings (tab: "settings") */}
            {activeTab === "settings" && (
              <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" /></div>}>
                <SettingsTab {...tabProps} />
              </Suspense>
            )}
          </AnimatePresence>
        </div>

        {/* 📋 Floating Mini Player Widget (PIP-like feature when navigating away) */}
        <AnimatePresence>
          {selectedChannel && activeTab !== "livetv" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 55 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 55 }}
              className="fixed bottom-20 md:bottom-6 right-6 w-64 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-2 z-40 overflow-hidden flex flex-col gap-1.5 backdrop-blur-xl transition-colors"
            >
              {/* Mini player header bar */}
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1.5 py-0.5">
                <span className="truncate flex items-center gap-1.5 text-slate-200 max-w-[150px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  {selectedChannel.name}
                </span>
                
                <div className="flex items-center gap-1 text-slate-500">
                  <button 
                    onClick={() => setActiveTab("livetv")}
                    className="p-1 hover:text-cyan-400 transition-colors"
                    title="Open Full Player"
                  >
                    <Maximize className="h-3 w-3" />
                  </button>
                  <button 
                    onClick={() => setSelectedChannel(null)}
                    className="p-1 hover:text-rose-400 transition-colors"
                    title="Dismiss video"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Seamless Mounted mini video container */}
              <div 
                onClick={() => setActiveTab("livetv")}
                className="aspect-video w-full rounded-2xl bg-black overflow-hidden relative cursor-pointer"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors z-30 opacity-0 hover:opacity-100">
                  <Play className="h-7 w-7 text-white drop-shadow-md pb-0.5" />
                </div>
                
                <div className="pointer-events-none scale-103 h-full w-full">
                  <Suspense fallback={<div className="w-full h-full bg-black/50 rounded-2xl" />}>
                    <VideoPlayer
                      channel={selectedChannel}
                      autoPlay={true}
                      bufferMode="low"
                      playerEngine={playerEngine}
                      language={appLang}
                    />
                  </Suspense>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Search Modal */}
        <AnimatePresence>
          {isVoiceSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6"
            >
              <div className="max-w-sm flex flex-col items-center text-center gap-4">
                <div className="relative h-24 w-24 rounded-full bg-cyan-500/15 flex items-center justify-center border border-cyan-500/25">
                  <Mic className="h-10 w-10 text-cyan-400 animate-pulse" />
                  <span className="absolute inset-[-4px] border border-cyan-500/20 rounded-full animate-ping pointer-events-none" />
                </div>
                <div className="flex justify-center items-end gap-1.5 h-12 my-2">
                  {speechWave.map((h, i) => (
                    <div key={`wave-${i}`} className="bg-cyan-500 w-1 rounded-full transition-all duration-100" style={{ height: `${h}px` }} />
                  ))}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-150">{t(appLang, "search.voice.title")}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{speechStatusText}</p>
                </div>
                <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl text-[10px] text-slate-450 w-full mt-3">
                  <p className="font-bold text-slate-350">{t(appLang, "search.voice.say")}</p>
                  <p className="mt-1 font-mono">"Sports channel", "Somoy TV", "Movies Channel"</p>
                </div>
                <button onClick={() => setIsVoiceSearching(false)}
                  className="mt-4 px-5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 cursor-pointer"
                >
                  {t(appLang, "search.voice.cancel")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notifications */}
        <AnimatePresence>
          {appToast && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-cyan-500/30 text-cyan-400 font-bold px-4 py-3 rounded-full text-[11px] shadow-2xl z-50 flex items-center gap-1.5 font-mono pointer-events-none backdrop-blur-xl"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 stroke-[3px]" />
              <span>{appToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Bottom Navigation */}
        <nav className="fixed bottom-4 left-3 right-3 mx-auto max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl py-2.5 px-3 flex items-center justify-around z-40 shadow-2xl shadow-cyan-950/10">
          {[
            { id: "home", icon: Home, label: "Live Events" },
            { id: "sports", icon: Radio, label: "Sports" },
            { id: "tv", icon: Tv, label: "TV" },

            { id: "history", icon: History, label: "History" },
            { id: "profile", icon: User, label: "Profile" },
          ].map((item: any) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "sports") {
                  setActiveTab("livetv");
                  setTvMode(false);
                  setActiveCategory("Sports Live");
                  setSelectedChannel(null);
                } else if (item.id === "tv") {
                  setActiveTab("livetv");
                  setTvMode(true);
                  setActiveCategory("All Channels");
                  setSelectedChannel(null);
                } else {
                  setActiveTab(item.id as any);
                }
              }}
              className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all px-3 py-1 rounded-xl ${
                (item.id === "sports" && activeTab === "livetv" && !tvMode) || (item.id === "tv" && activeTab === "livetv" && tvMode) || (item.id === activeTab && item.id !== "sports" && item.id !== "tv")
                  ? "text-cyan-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <item.icon className={`h-4.5 w-4.5 ${(item.id === "sports" && activeTab === "livetv" && !tvMode) || (item.id === "tv" && activeTab === "livetv" && tvMode) || (item.id === activeTab && item.id !== "sports" && item.id !== "tv") ? "drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]" : ""}`} />
              <span className="text-[8px] font-bold">{item.label}</span>
              {((item.id === "sports" && activeTab === "livetv" && !tvMode) || (item.id === "tv" && activeTab === "livetv" && tvMode) || (item.id === activeTab && item.id !== "sports" && item.id !== "tv")) && (
                <span className="absolute -bottom-0.5 h-0.5 w-6 rounded-full bg-cyan-400" />
              )}
            </button>
          ))}
        </nav>

      {/* Channel picker modal */}
      {pickerChannels && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70" onClick={() => setPickerChannels(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-4 pb-8 w-full max-w-sm mx-auto shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-wider">Select Channel</h4>
              <button onClick={() => setPickerChannels(null)} className="text-slate-500 hover:text-slate-300 text-lg leading-none">&times;</button>
            </div>
            <div className="flex flex-col gap-1">
              {pickerChannels.map(ch => (
                <button key={ch.id} onClick={() => { changeMainChannel(ch); setPickerChannels(null); setActiveTab("livetv"); }}
                  className="w-full text-left px-3.5 py-2.5 bg-slate-800/40 hover:bg-slate-800 rounded-xl border border-transparent hover:border-cyan-500/30 transition-all cursor-pointer text-sm font-bold text-slate-100"
                >
                  {ch.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
}
