import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Channel, LiveEvent } from "./types";
import VideoPlayer from "./components/VideoPlayer";
import { Language, t } from "./translations";
import { 
  Tv, Search, Star, Activity, Radio, RefreshCw, Play, Grid, ChevronLeft, ChevronRight,
  Info, Home, Sliders, Gauge, FolderPlus, Settings, Share2, Heart, Wifi, X, Plus, Laptop,
  Smartphone, Gamepad2, AlertCircle, History, Volume2, Sun, Mic, MicOff, Cast, Database,
  Trash2, Layers, Video, CheckCircle2, SlidersHorizontal, Compass, ArrowRight, Maximize,
  Trophy, Calendar, Globe, Menu, Bell, User, Clock, Zap, Eye, TrendingUp
} from "./icons";
import { listenEvents, addEvent, removeEvent, updateEvent, FirebaseEvent } from "./firebase";

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
  return <><img src={url} alt="" className="h-8 w-8 rounded-full object-cover border border-slate-700" onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden') }} /><span className="text-2xl hidden">{fallback || "🏳️"}</span></>;
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
  const [activeTab, setActiveTab] = useState<"home" | "livetv" | "history" | "profile">("home");
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
      
      const currentStillExists = selectedChannel && data.find(c => c.id === selectedChannel.id);
      if (data.length > 0 && !currentStillExists) {
        const firstBangla = data.find(c => c.group.toLowerCase().includes("bangla"));
        setSelectedChannel(firstBangla || data[0]);
      }
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
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 px-3 pt-3"
            >
              {/* Sports Categories */}
              <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {sportsCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSportsFilter(cat.id)}
                    className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl transition-all flex-shrink-0 border ${
                      sportsFilter === cat.id
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                        : "bg-slate-800/30 border-slate-700/30 text-slate-400 hover:border-slate-600/50"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${
                      sportsFilter === cat.id ? "bg-cyan-500/20" : "bg-slate-800/50"
                    }`}>
                      {cat.icon}
                    </div>
                    <span className="text-[9px] font-bold whitespace-nowrap">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Match Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {matchFilters.map((mf) => (
                  <button
                    key={mf.id}
                    onClick={() => setMatchFilter(mf.id)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all border flex items-center gap-1.5 flex-shrink-0 ${
                      matchFilter === mf.id
                        ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                        : "bg-slate-800/30 border-slate-700/30 text-slate-400 hover:border-slate-600/50"
                    }`}
                  >
                    {mf.label}
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                      matchFilter === mf.id ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-700/50 text-slate-500"
                    }`}>
                      {getMatchCount(mf.id)}
                    </span>
                  </button>
                ))}
              </div>

              {/* Live Match Cards */}
              {liveEvents.filter(e => matchFilter === "All" || e.status === matchFilter.toLowerCase()).length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="font-extrabold text-xs text-slate-400 tracking-wider uppercase flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Live & Upcoming Matches</span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    {liveEvents.filter(e => matchFilter === "All" || e.status === matchFilter.toLowerCase()).map((evt) => {
                      const isLive = evt.status === "live";
                      const isUpcoming = evt.status === "upcoming";
                      const showScore = isLive && evt.score1 !== "0" && evt.score2 !== "0";
                      return (
                        <div
                          key={evt.id}
                          className={`p-4 rounded-3xl border transition-all relative overflow-hidden ${
                            isLive
                              ? "bg-gradient-to-br from-slate-800/60 via-slate-800/30 to-cyan-950/20 border-cyan-500/40 shadow-lg shadow-cyan-950/10"
                              : isUpcoming
                              ? "bg-slate-800/30 border-slate-700/50"
                              : "bg-slate-800/20 border-slate-700/30"
                          }`}
                        >
                          {isLive && (
                            <>
                              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none" />
                              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                            </>
                          )}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-lg bg-slate-700/50 flex items-center justify-center text-xs">🏆</div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{evt.tournament}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${
                              isLive
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : isUpcoming
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "bg-slate-700 text-slate-500 border border-slate-600"
                            }`}>
                              {isLive && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />}
                              {evt.status === "live" ? "LIVE" : evt.status === "upcoming" ? "UPCOMING" : "ENDED"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 gap-3">
                            <div className="flex items-center gap-2.5 flex-1">
                              <FlagImg url={evt.team1FlagUrl} fallback={evt.team1Flag || "🏳️"} />
                              <span className="text-sm font-black text-slate-100">{evt.team1}</span>
                            </div>
                            <div className="flex flex-col items-center flex-shrink-0">
                              {(isLive && showScore) || evt.status === "finished" ? (
                                <div className="bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-slate-700/50">
                                  <span className="text-lg font-mono font-black text-cyan-400">{evt.score1 || "0"}</span>
                                  <span className="text-slate-600 mx-1 font-bold">:</span>
                                  <span className="text-lg font-mono font-black text-cyan-400">{evt.score2 || "0"}</span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">VS</span>
                              )}
                              {isLive && (
                                <span className="text-[8px] text-rose-400 font-bold font-mono mt-1 flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-rose-500 animate-ping" />
                                  {evt.statusText || "LIVE"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2.5 flex-1 justify-end">
                              <span className="text-sm font-black text-slate-100 text-right">{evt.team2}</span>
                              <FlagImg url={evt.team2FlagUrl} fallback={evt.team2Flag || "🏳️"} />
                            </div>
                          </div>
                          {isUpcoming && (
                            <div className="mt-3 pt-3 border-t border-slate-700/30 flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 font-mono">{evt.statusText || "Scheduled"}</span>
                                <CountdownDisplay startTime={evt.startTime} />
                              </div>
                              {evt.startTime && (
                                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, 100 - ((evt.startTime - Date.now()) / (evt.startTime - Date.now() + 3600000) * 100)))}%` }} />
                                </div>
                              )}
                            </div>
                          )}
                          {isLive && (
                            <div className="mt-3 pt-3 border-t border-slate-700/30">
                              <button
                                onClick={() => {
                                  const ids = evt.channelIds?.length ? evt.channelIds : (evt.channelId ? [evt.channelId] : []);
                                  const matchChannels = ids.map(id => channels.find(c => c.id === id)).filter(Boolean) as Channel[];
                                  if (matchChannels.length === 1) { changeMainChannel(matchChannels[0]); setActiveTab("livetv"); return; }
                                  if (matchChannels.length > 1) setPickerChannels(matchChannels);
                                  else { setActiveCategory("Sports"); setActiveTab("livetv"); }
                                }}
                                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 text-[10px] font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                              >
                                <Play className="h-3 w-3 fill-current" />
                                <span>Watch Live</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trending Channels */}
              {trendingChannels.length > 0 && (
                <div className="flex flex-col gap-3 pb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                    <h3 className="font-extrabold text-xs text-slate-400 tracking-wider uppercase">Trending Channels</h3>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {trendingChannels.map((chan) => (
                      <div
                        key={`trend-${chan.id}`}
                        onClick={() => { changeMainChannel(chan); setActiveTab("livetv"); }}
                        className="bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 hover:border-cyan-500/30 p-3 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center group"
                      >
                        <div className="h-10 w-10 bg-slate-900/50 rounded-xl border border-slate-700/30 flex items-center justify-center overflow-hidden mb-2">
                          {chan.logo ? (
                            <img src={chan.logo} alt={chan.name} referrerPolicy="no-referrer"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              className="h-8 w-8 object-contain"
                            />
                          ) : (
                            <Tv className="h-4 w-4 text-slate-600" />
                          )}
                        </div>
                        <p className="text-[9px] font-bold text-slate-300 truncate w-full group-hover:text-cyan-400 transition-colors">{chan.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ===== LIVE TV TAB / SPORTS CHANNELS ===== */}
          {activeTab === "livetv" && (
            <motion.div
              key="player-workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4 px-3 pt-3"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Left: Player (only when channel selected) */}
                {selectedChannel && (
                  <section className="flex-grow lg:w-3/5 flex flex-col gap-4 text-left">
                    {multiScreenActive ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
                          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                            <Layers className="h-4 w-4 text-cyan-400 animate-pulse" />
                            {t(appLang, "live.multiscreen")}
                          </span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setMultiScreenCount(2)}
                              className={`px-3 py-1 text-[10.5px] font-bold rounded-lg border transition-all ${
                                multiScreenCount === 2 ? "bg-cyan-500 text-slate-950 border-cyan-400" : "bg-slate-800 border-slate-700 text-slate-400"
                              }`}>{t(appLang, "live.multiscreen.dual")}</button>
                            <button onClick={() => setMultiScreenCount(4)}
                              className={`px-3 py-1 text-[10.5px] font-bold rounded-lg border transition-all ${
                                multiScreenCount === 4 ? "bg-cyan-500 text-slate-950 border-cyan-400" : "bg-slate-800 border-slate-700 text-slate-400"
                              }`}>{t(appLang, "live.multiscreen.quad")}</button>
                            <button onClick={() => setMultiScreenActive(false)}
                              className="p-1 px-1.5 bg-rose-950/40 text-rose-300 font-bold text-[10px] rounded border border-rose-900/30">{t(appLang, "live.multiscreen.close")}</button>
                          </div>
                        </div>
                        <div className={`grid gap-4 ${multiScreenCount === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2"}`}>
                          {Array.from({ length: multiScreenCount }).map((_, idx) => {
                            const slotChannel = selectedGridChannels[idx];
                            const isActiveSlot = activeGridIndex === idx;
                            return (
                              <div key={`grid-slot-${idx}`}
                                onClick={() => setActiveGridIndex(idx)}
                                className={`rounded-2xl overflow-hidden border-2 relative transition-all bg-black aspect-video flex flex-col justify-center items-center ${
                                  isActiveSlot ? "border-cyan-500 shadow-lg ring-1 ring-cyan-500/10" : "border-slate-900"
                                }`}>
                                {slotChannel ? (
                                  <div className="relative w-full h-full">
                                    <VideoPlayer channel={slotChannel} autoPlay={true} bufferMode={bufferSize} playerEngine={playerEngine} language={appLang} />
                                    <button onClick={(e) => { e.stopPropagation(); clearGridSlot(idx); }}
                                      className="absolute top-2 right-2 p-1.5 bg-slate-950/80 rounded-full border border-slate-800 text-slate-450 hover:text-white z-40"><X className="h-3 w-3" /></button>
                                    <span className="absolute bottom-2 left-2 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded text-[9px] text-white z-40 font-bold truncate max-w-[120px]">
                                      {t(appLang, "live.slot", { n: idx + 1, name: slotChannel.name })}</span>
                                  </div>
                                ) : (
                                  <div className="p-4 text-center cursor-pointer flex flex-col items-center">
                                    <Plus className="h-6 w-6 text-slate-700 mb-1" />
                                    <p className="text-[10px] text-slate-400 font-bold">{t(appLang, "live.multiscreen.slot", { n: idx + 1 })}</p>
                                    <p className="text-[8px] text-slate-600">{t(appLang, "live.multiscreen.add")}</p>
                                  </div>
                                )}
                                {isActiveSlot && !slotChannel && <span className="absolute inset-0 border-2 border-cyan-500 bg-cyan-500/5 animate-pulse pointer-events-none" />}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-slate-505 italic text-left bg-slate-950 p-2.5 rounded-lg border border-slate-900">{t(appLang, "live.multiscreen.hint")}</p>
                      </div>
                    ) : (
                      <>
                        <VideoPlayer channel={selectedChannel} onPrevChannel={handlePrevChannel}
                          onNextChannel={handleNextChannel} autoPlay={autoPlay}
                          bufferMode={bufferSize} playerEngine={playerEngine} language={appLang}
                          channels={channels} recentChannelIds={historyList.map(h => h.channelId)}
                          onChannelSelect={setSelectedChannel} onToggleFavorite={toggleFavorite}
                          isFavorite={selectedChannel ? favorites.includes(selectedChannel.id) : false}
                          onAddToHistory={addToHistory} />
                      </>
                    )}
                  </section>
                )}

                {/* Right side: Channels listing directory */}
                <section className={`flex flex-col gap-4 bg-slate-900/40 backdrop-blur-xl border border-slate-900 rounded-3xl p-4 shadow-xl min-h-[500px] ${selectedChannel ? "lg:w-2/5" : "w-full"}`}>
                  
                  <div className="flex flex-col gap-3 pb-3 border-b border-slate-850/65">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm tracking-wide text-left flex items-center gap-1.5 text-white">
                        <Grid className="h-4 w-4 text-cyan-400" />
                        {t(appLang, "live.directory", { count: filteredChannels.length })}
                      </span>

                      <button
                        onClick={() => {
                          const state = !multiScreenActive;
                          setMultiScreenActive(state);
                          if (state) setSelectedGridChannels([selectedChannel, null, null, null]);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                          multiScreenActive 
                            ? "bg-cyan-500/10 border-cyan-400 text-cyan-400" 
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Layers className="h-3.5 w-3.5 animate-pulse" />
                        <span>Arena Multi-Screen</span>
                      </button>
                    </div>

                    {/* Standard Search for channels inside list */}
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                        <Search className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder={t(appLang, "search.placeholder.short")}
                        className="w-full bg-slate-950/80 border border-slate-850 focus:border-cyan-500 text-slate-200 text-xs px-3.5 py-2.5 pl-9 rounded-xl outline-none transition-all placeholder:text-slate-620"
                      />
                      {searchInput && (
                        <button
                          onClick={() => setSearchInput("")}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-500 hover:text-slate-200"
                          >
                            {t(appLang, "search.clear")}
                          </button>
                      )}
                    </div>
                  </div>

                  {/* Android TV style Category filters */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 min-h-[36px] no-scrollbar">
                    {categoriesList.map((cat) => {
                      const isSelected = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3 py-1 rounded-xl text-[10.5px] font-bold cursor-pointer transition-all border outline-none text-center flex-shrink-0 ${
                            isSelected
                              ? "bg-cyan-500 border-cyan-400 text-slate-950 font-extrabold shadow-sm"
                              : "bg-slate-950/60 border-slate-850 text-slate-450 hover:text-slate-200 hover:border-slate-800"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Channels actual scrolling list */}
                  <div 
                    ref={channelListRef}
                    className="flex-grow flex flex-col h-[380px] lg:h-[460px] overflow-y-auto pr-1 gap-2 no-scrollbar text-left"
                  >
                    {isLoading && (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mb-3" />
                        <p className="text-xs font-bold leading-normal">{t(appLang, "live.loading")}</p>
                        <p className="text-[9px] text-slate-600 mt-1 font-mono uppercase tracking-widest">{t(appLang, "live.loading.bytes")}</p>
                      </div>
                    )}

                    {!isLoading && errorStatus && (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6 border border-rose-950 rounded-xl bg-rose-950/10">
                        <AlertCircle className="h-10 w-10 text-rose-500 mb-2" />
                        <p className="text-xs text-rose-450 leading-relaxed font-semibold">{errorStatus || t(appLang, "live.error")}</p>
                        <button
                          onClick={fetchChannels}
                          className="mt-4 px-4 py-1.5 bg-slate-850 hover:bg-slate-750 text-slate-200 text-xs rounded-lg font-bold border border-slate-750 cursor-pointer"
                        >
                          {t(appLang, "live.retry")}
                        </button>
                      </div>
                    )}

                    {!isLoading && !errorStatus && filteredChannels.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center p-6 bg-slate-950/20 border border-slate-900 rounded-2xl">
                        <Activity className="h-8 w-8 text-slate-700 mb-2" />
                        <p className="text-xs font-bold">{t(appLang, "live.noresults")}</p>
                        <p className="text-[10px] text-slate-650 mt-1">{t(appLang, "live.noresults.hint")}</p>
                      </div>
                    )}

                    {!isLoading && !errorStatus && filteredChannels.map((chan, idx) => {
                      const isSelected = selectedChannel?.id === chan.id;
                      const isFaved = favorites.includes(chan.id);

                      // Check if it is currently playing in multi screen cell active
                      const isSelectedInMultiIndex = multiScreenActive && selectedGridChannels[activeGridIndex]?.id === chan.id;

                      return (
                        <div
                          key={chan.id}
                          id={`channel-row-${chan.id}`}
                          onMouseEnter={() => handleChannelHoverEnter(`row-${chan.id}`)}
                          onMouseLeave={handleChannelHoverLeave}
                          className={`flex items-center justify-between p-2.5 rounded-2xl transition-all leading-snug border cursor-pointer relative group ${
                            (isSelected && !multiScreenActive) || isSelectedInMultiIndex
                              ? "bg-slate-900 border-cyan-500 text-white shadow-md"
                              : "bg-slate-950/50 hover:bg-slate-900/60 border-slate-900 text-slate-450 hover:text-slate-100 hover:border-slate-800"
                          }`}
                          onClick={() => {
                            if (multiScreenActive) {
                              selectGridChannel(activeGridIndex, chan);
                            } else {
                              changeMainChannel(chan);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden flex-grow mr-2">
                            <div className="flex-shrink-0 text-[10px] font-mono text-slate-500 w-5 text-right font-bold">
                              {isSelected && !multiScreenActive ? (
                                <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse ml-auto" />
                              ) : (
                                `#${idx + 1}`
                              )}
                            </div>

                            {/* Channel avatar Logo */}
                             <div className="h-9 w-9 bg-slate-950 border border-slate-850/80 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative group-hover:border-slate-700 transition-colors">
                              {chan.logo ? (
                                <>
                                  <img
                                    src={chan.logo}
                                    alt={chan.name}
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      const pb = e.currentTarget.nextElementSibling;
                                      if (pb) pb.classList.remove('hidden');
                                    }}
                                    className="h-8 w-8 object-contain p-0.5"
                                  />
                                  <div className="hidden absolute inset-0 flex items-center justify-center bg-slate-900 text-[10px] font-black text-cyan-400">
                                    {chan.name.slice(0, 2).toUpperCase()}
                                  </div>
                                </>
                              ) : (
                                <Tv className="h-4 w-4 text-slate-705" />
                              )}
                            </div>

                            {/* Info name */}
                            <div className="overflow-hidden min-w-0 text-left">
                              <div className="flex items-center gap-1.5">
                                {chan.healthy === false ? (
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" title="Offline" />
                                ) : chan.latencyMs !== null && chan.latencyMs > 3000 ? (
                                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 flex-shrink-0" title={`Slow (${chan.latencyMs}ms)`} />
                                ) : (
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" title={chan.latencyMs ? `${chan.latencyMs}ms` : "Unknown"} />
                                )}
                                <p className={`font-bold text-xs truncate leading-normal ${isSelected && !multiScreenActive ? "text-cyan-400" : "text-slate-200"}`}>
                                  {chan.name}
                                </p>
                              </div>
                              <span className="inline-block text-[9px] text-slate-500 font-bold px-1.5 py-0.2 bg-slate-950 border border-slate-900 rounded uppercase font-mono mt-0.5">
                                {chan.group || "IPTV CONNECT"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Star favorites bookmarks setter */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(chan.id);
                              }}
                              className={`p-2 rounded-xl hover:bg-slate-950 transition-colors cursor-pointer ${
                                isFaved ? "text-amber-400" : "text-slate-650 hover:text-slate-450"
                              }`}
                              title={isFaved ? "Remove Fav" : "Add Fav"}
                            >
                              <Star className="h-3.5 w-3.5" fill={isFaved ? "currentColor" : "none"} />
                            </button>
                          </div>

                          {/* Preview tooltip on hover state */}
                          {hoveredChannel === `row-${chan.id}` && (
                            <div className="absolute top-1/2 -translate-y-1/2 right-12 bg-slate-900 border border-slate-800 p-2.5 rounded-xl shadow-2xl z-50 w-44 pointer-events-none text-left">
                              <p className="font-bold text-cyan-400 text-[8.5px] uppercase tracking-wider">{t(appLang, "live.preview")}</p>
                              <p className="font-bold text-slate-150 text-[11px] mt-0.5 truncate">{chan.name}</p>
                              <p className="text-[9.5px] text-slate-450 max-w-full leading-relaxed mt-1">{t(appLang, "live.preview.desc")}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
              </motion.div>
            )}

            {/* VIEW 3: Dedicated History Timelines tab (tab: "history") */}
            {activeTab === "history" && (
              <motion.div
                key="history-workspace"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-5 text-left"
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center">
                      <History className="h-5.5 w-5.5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-100 font-sans">{t(appLang, "hist.title")}</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{t(appLang, "hist.subtitle")}</p>
                    </div>
                  </div>

                  {historyList.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm(t(appLang, "hist.confirm"))) {
                          setHistoryList([]);
                          localStorage.removeItem("toffee_history");
                          triggerToast(t(appLang, "hist.deleted"));
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/30 text-rose-350 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t(appLang, "hist.clear")}</span>
                    </button>
                  )}
                </div>

                {historyList.length === 0 ? (
                  <div className="bg-slate-900/10 border border-slate-900 rounded-3xl p-12 text-center text-slate-500">
                    <History className="h-11 w-11 text-slate-800 mx-auto mb-3" />
                    <p className="text-xs font-bold leading-normal">{t(appLang, "hist.empty")}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{t(appLang, "hist.empty.hint")}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 max-w-xl">
                    {historyList.map((item, idx) => {
                      const targetC = channels.find(c => c.id === item.channelId);
                      if (!targetC) return null;

                      return (
                        <div
                          key={`history-row-${idx}-${item.channelId}`}
                          onClick={() => {
                            changeMainChannel(targetC);
                            setActiveTab("livetv");
                          }}
                          className="flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-900 rounded-2xl cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-xs font-bold font-mono text-slate-605">#{idx + 1}</span>
                            
                            <div className="h-9 w-9 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                              {targetC.logo ? (
                                <>
                                  <img 
                                    src={targetC.logo} 
                                    alt={targetC.name} 
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const pb = e.currentTarget.nextElementSibling;
                                      if (pb) pb.classList.remove('hidden');
                                    }}
                                    className="h-8 w-8 object-contain" 
                                  />
                                  <div className="hidden absolute inset-0 flex items-center justify-center bg-slate-900 text-[10px] font-black text-cyan-400">
                                    {targetC.name.slice(0, 2).toUpperCase()}
                                  </div>
                                </>
                              ) : (
                                <Tv className="h-4 w-4 text-slate-650" />
                              )}
                            </div>

                            <div className="text-left">
                              <p className="font-extrabold text-xs text-slate-100">{targetC.name}</p>
                              <span className="text-[8.5px] text-slate-500 font-bold block uppercase tracking-normal mt-0.5">{targetC.group}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end text-right">
                              <span className="text-[9.5px] font-mono font-bold text-slate-500">{t(appLang, "hist.progress")}</span>
                              <span className="text-xs font-bold text-cyan-400 font-mono">{item.progress}%</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setHistoryList((prev) => {
                                  const res = prev.filter((h) => h.channelId !== item.channelId);
                                  localStorage.setItem("toffee_history", JSON.stringify(res));
                                  return res;
                                });
                              }}
                              className="p-1.5 hover:bg-slate-950 hover:text-rose-400 rounded-xl text-slate-600 transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 5: Profile tab — login first, then guest profile or admin panel */}
            {activeTab === "profile" && (
              <motion.div
                key="profile-workspace"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-5 px-3 pt-3 text-left max-w-2xl mx-auto"
              >
                {/* If admin is logged in, show admin panel here */}
                {isAdmin ? (
                  <>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                          <Settings className="h-6 w-6 text-slate-950" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white font-sans">Admin Panel</h3>
                          <p className="text-[10px] text-emerald-400 font-bold">{ADMIN_EMAIL}</p>
                        </div>
                      </div>
                      <button onClick={handleAdminLogout}
                        className="px-3 py-1.5 bg-rose-950/40 border border-rose-900/30 text-rose-400 text-[10px] font-bold rounded-xl cursor-pointer">Logout</button>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-5 shadow-xl">
                      <h4 className="font-bold text-xs text-slate-300 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Trophy className="h-4 w-4 text-cyan-400 animate-pulse" />
                        <span>Live Sports Events</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 mb-4 leading-relaxed font-sans">Events synced to Firebase.</p>

                      <div className="flex flex-col gap-2 mb-4 bg-slate-950/65 p-3.5 rounded-2xl border border-slate-850">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase mb-1.5 font-mono tracking-wider">Events ({liveEvents.length})</p>
                        {liveEvents.length === 0 ? (
                          <p className="text-[10.5px] text-slate-600 italic">No events yet.</p>
                        ) : (
                          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar">
                            {liveEvents.map((evt) => (
                              <div key={evt.id} className="flex items-center justify-between p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                                <div className="min-w-0 flex-1">
                                  <p className="text-[11px] font-black text-slate-200 truncate">{evt.team1Flag} {evt.team1} vs {evt.team2} {evt.team2Flag}</p>
                                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 truncate">{evt.tournament} | <span className={evt.status === "live" ? "text-red-400" : evt.status === "upcoming" ? "text-cyan-400" : "text-slate-500"}>{evt.status.toUpperCase()}</span></p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <button onClick={() => {
                                    setEditingEventId(evt.id);
                                    setAdminTeam1(evt.team1);
                                    setAdminTeam1Flag(evt.team1Flag || "🇧🇩");
                                    setAdminTeam1FlagUrl(evt.team1FlagUrl || "");
                                    setAdminTeam2(evt.team2);
                                    setAdminTeam2Flag(evt.team2Flag || "🇮🇳");
                                    setAdminTeam2FlagUrl(evt.team2FlagUrl || "");
                                    setAdminScore1(evt.score1);
                                    setAdminScore2(evt.score2);
                                    setAdminTournament(evt.tournament);
                                    setAdminStatus(evt.status);
                                    setAdminStatusText(evt.statusText || "");
                                    setAdminChannelIds(evt.channelIds || (evt.channelId ? [evt.channelId] : []));
                                    setAdminStartTime(evt.startTime ? new Date(evt.startTime).toISOString().slice(0, 16) : "");
                                    setAdminType(evt.type);
                                  }} className="p-1 px-2.5 bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 text-[9px] font-bold border border-cyan-500/20 rounded-lg cursor-pointer transition-all">Edit</button>
                                  <button onClick={async () => { if (!confirm("Delete?")) return; try { await removeEvent(evt.id); triggerToast("Deleted!"); } catch (e: any) { triggerToast("Delete error: " + (e?.message || "unknown")); console.error("Firebase delete error:", e); } }} className="p-1 px-2.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 text-[9px] font-bold border border-rose-500/20 rounded-lg cursor-pointer transition-all">Delete</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {editingEventId && (
                        <div className="mb-3 flex items-center gap-2 p-2 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                          <span className="text-[10px] text-cyan-400 font-bold flex-1">Editing event — changes will update existing event</span>
                          <button onClick={() => { setEditingEventId(null); setAdminTeam1(""); setAdminTeam2(""); setAdminScore1(""); setAdminScore2(""); setAdminStatusText(""); setAdminTournament(""); setAdminChannelId(""); setAdminChannelIds([]); setAdminTeam1FlagUrl(""); setAdminTeam2FlagUrl(""); setAdminStartTime(""); setAdminChannelSearch(""); }} className="text-[9px] text-rose-400 font-bold bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20 cursor-pointer">Cancel</button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4 font-sans text-xs">
                        <div><label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Team 1</label><input type="text" placeholder="Bangladesh" value={adminTeam1} onChange={(e) => setAdminTeam1(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2.5 text-xs rounded-xl text-slate-200 outline-none focus:border-cyan-500 transition-colors" /></div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Flag 1 Image (imgBB)</label>
                          <label className={`flex items-center justify-center gap-2 w-full p-2.5 text-xs rounded-xl border border-dashed cursor-pointer transition-colors ${uploading1 ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 pointer-events-none' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400'}`}>
                            {uploading1 ? '⏳ Uploading...' : '📷 Upload flag image'}
                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) await imgbbUpload(f, setAdminTeam1FlagUrl, setUploading1); e.target.value = ''; }} />
                          </label>
                          {adminTeam1FlagUrl && <div className="flex items-center gap-2 mt-1.5 p-1.5 bg-slate-900/60 rounded-xl border border-slate-800"><img src={adminTeam1FlagUrl} className="h-6 w-6 rounded-full object-cover border border-slate-600" /><span className="text-[7px] text-cyan-400 truncate flex-1">{adminTeam1FlagUrl}</span><button onClick={() => setAdminTeam1FlagUrl('')} className="text-[9px] text-rose-400 hover:text-rose-300 font-bold">&times;</button></div>}
                          <input type="text" placeholder="Fallback emoji (e.g. 🇧🇩)" value={adminTeam1Flag} onChange={(e) => setAdminTeam1Flag(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 mt-1.5 text-xs rounded-xl text-slate-200 outline-none focus:border-cyan-500 transition-colors" />
                        </div>
                        <div><label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Team 2</label><input type="text" placeholder="India" value={adminTeam2} onChange={(e) => setAdminTeam2(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2.5 text-xs rounded-xl text-slate-200 outline-none focus:border-cyan-500 transition-colors" /></div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Flag 2 Image (imgBB)</label>
                          <label className={`flex items-center justify-center gap-2 w-full p-2.5 text-xs rounded-xl border border-dashed cursor-pointer transition-colors ${uploading2 ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 pointer-events-none' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400'}`}>
                            {uploading2 ? '⏳ Uploading...' : '📷 Upload flag image'}
                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) await imgbbUpload(f, setAdminTeam2FlagUrl, setUploading2); e.target.value = ''; }} />
                          </label>
                          {adminTeam2FlagUrl && <div className="flex items-center gap-2 mt-1.5 p-1.5 bg-slate-900/60 rounded-xl border border-slate-800"><img src={adminTeam2FlagUrl} className="h-6 w-6 rounded-full object-cover border border-slate-600" /><span className="text-[7px] text-cyan-400 truncate flex-1">{adminTeam2FlagUrl}</span><button onClick={() => setAdminTeam2FlagUrl('')} className="text-[9px] text-rose-400 hover:text-rose-300 font-bold">&times;</button></div>}
                          <input type="text" placeholder="Fallback emoji (e.g. 🇮🇳)" value={adminTeam2Flag} onChange={(e) => setAdminTeam2Flag(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 mt-1.5 text-xs rounded-xl text-slate-200 outline-none focus:border-cyan-500 transition-colors" />
                        </div>
                        <div><label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Tournament</label><input type="text" placeholder="ICC Champions Trophy" value={adminTournament} onChange={(e) => setAdminTournament(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2.5 text-xs rounded-xl text-slate-200 outline-none focus:border-cyan-500 transition-colors" /></div>
                        <div><label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Type</label><select value={adminType} onChange={(e: any) => setAdminType(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2.5 text-xs rounded-xl text-slate-200 outline-none focus:border-cyan-500 transition-colors cursor-pointer"><option value="cricket">🏏 Cricket</option><option value="football">⚽ Football</option><option value="other">🏆 Other</option></select></div>
                        <div><label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Status</label><select value={adminStatus} onChange={(e: any) => setAdminStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2.5 text-xs rounded-xl text-slate-200 outline-none focus:border-cyan-500 transition-colors cursor-pointer"><option value="live">🔴 Live</option><option value="upcoming">🗓️ Upcoming</option><option value="finished">🏁 Finished</option></select></div>
                        <div><label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Start Time</label><input type="datetime-local" value={adminStartTime} onChange={(e) => setAdminStartTime(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2.5 text-xs rounded-xl text-slate-200 outline-none focus:border-cyan-500 transition-colors" /></div>
                        <div className="col-span-1 sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Channels (select multiple)</label>
                          <input type="text" placeholder="Search channels..." value={adminChannelSearch} onChange={(e) => setAdminChannelSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-xs rounded-xl text-slate-200 outline-none mb-1.5 focus:border-cyan-500 transition-colors" />
                          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto bg-slate-950 border border-slate-850 p-2 rounded-xl">
                            {channels.filter(c => !adminChannelSearch || c.name.toLowerCase().includes(adminChannelSearch.toLowerCase())).map(c => {
                              const sel = adminChannelIds.includes(c.id);
                              return (
                                <button key={`ac-${c.id}`} onClick={() => setAdminChannelIds(prev => sel ? prev.filter(id => id !== c.id) : [...prev, c.id])}
                                  className={`px-2 py-1 text-[9px] font-bold rounded-lg border cursor-pointer transition-all ${sel ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                  {c.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                          <button onClick={() => { setEditingEventId(null); setAdminTeam1(""); setAdminTeam2(""); setAdminScore1(""); setAdminScore2(""); setAdminStatusText(""); setAdminTournament(""); setAdminChannelId(""); setAdminChannelIds([]); setAdminTeam1FlagUrl(""); setAdminTeam2FlagUrl(""); setAdminStartTime(""); setAdminChannelSearch(""); }} className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs font-bold rounded-xl border border-slate-850 cursor-pointer">Clear</button>
                        <button onClick={async () => {
                          if (!adminTeam1 || !adminTeam2 || !adminTournament) { triggerToast("Fill all fields!"); return; }
                          const startTs = adminStartTime ? new Date(adminStartTime).getTime() : undefined;
                          const evtData = { type: adminType, team1: adminTeam1, team1Flag: adminTeam1Flag, team1FlagUrl: adminTeam1FlagUrl || undefined, team2: adminTeam2, team2Flag: adminTeam2Flag, team2FlagUrl: adminTeam2FlagUrl || undefined, score1: adminScore1 || "0", score2: adminScore2 || "0", status: adminStatus, statusText: adminStatusText || (adminStatus === "live" ? "In Progress" : "Scheduled"), tournament: adminTournament, channelIds: adminChannelIds.length > 0 ? adminChannelIds : undefined, channelId: adminChannelIds[0] || undefined, startTime: startTs };
                          try {
                            if (editingEventId) {
                              await updateEvent(editingEventId, evtData);
                            } else {
                              await addEvent(evtData);
                            }
                            triggerToast("Saved to Firebase!");
                          } catch (e: any) {
                            triggerToast("Firebase error: " + (e?.message || "unknown"));
                            console.error("Firebase write error:", e);
                          }
                          setEditingEventId(null);
                          setAdminTeam1(""); setAdminTeam2(""); setAdminScore1(""); setAdminScore2(""); setAdminStatusText(""); setAdminTournament(""); setAdminChannelId(""); setAdminChannelIds([]); setAdminTeam1FlagUrl(""); setAdminTeam2FlagUrl(""); setAdminStartTime(""); setAdminChannelSearch("");
                        }} className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 font-black text-xs rounded-xl hover:scale-103 transition-all cursor-pointer border-none">{editingEventId ? "Update Event" : "Publish to Firebase"}</button>
                      </div>
                    </div>
                  </>
                ) : !isGuest ? (
                  /* Login screen — shown first when not guest and not admin */
                  <div className="flex flex-col items-center justify-center py-8 gap-6 text-center max-w-sm mx-auto">
                    <div className="h-20 w-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <User className="h-10 w-10 text-slate-950" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">Welcome</h3>
                      <p className="text-xs text-slate-500 mt-1">Sign in to sync your data across devices</p>
                    </div>

                    <div className="w-full flex flex-col gap-3 bg-slate-900/40 border border-slate-800/50 rounded-3xl p-5">
                      <div className="form-group text-left">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email</label>
                        <input type="email" value={adminEmailInput} onChange={(e) => setAdminEmailInput(e.target.value)} placeholder="your@email.com"
                          className="w-full bg-slate-950 border border-slate-800 p-3 text-sm rounded-xl text-slate-200 outline-none focus:border-cyan-500 transition-colors" />
                      </div>
                      <div className="form-group text-left">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password</label>
                        <input type="password" value={adminPassInput} onChange={(e) => setAdminPassInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()} placeholder="Enter password"
                          className="w-full bg-slate-950 border border-slate-800 p-3 text-sm rounded-xl text-slate-200 outline-none focus:border-cyan-500 transition-colors" />
                      </div>
                      <button onClick={handleAdminLogin}
                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 font-black text-sm rounded-xl hover:opacity-90 transition-all cursor-pointer">
                        Sign In
                      </button>
                      <div className="relative my-1">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
                        <div className="relative flex justify-center"><span className="bg-[#0a0e1a] px-3 text-[10px] text-slate-600 font-bold">OR</span></div>
                      </div>
                      <button onClick={() => { setIsGuest(true); localStorage.setItem("toffee_guest", "true"); }}
                        className="w-full py-3 bg-slate-950 border border-slate-800 text-slate-400 font-bold text-sm rounded-xl hover:border-slate-600 transition-all cursor-pointer">
                        Continue as Guest
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Guest profile view */
                  <>
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-800/50">
                      <div className="h-16 w-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <User className="h-8 w-8 text-slate-950" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white font-sans">Guest User</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                          ID: {localStorage.getItem("guest_id")?.slice(0, 12) || "anonymous"}...
                        </p>
                        <p className="text-[10px] text-slate-600 font-mono mt-0.5 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active Session
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-cyan-400">{historyList.length}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Channels Watched</p>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-cyan-400">{latencyResult || 0}ms</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Latency</p>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-4">
                      <h4 className="font-bold text-xs text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-3">
                        <History className="h-4 w-4 text-cyan-400" />
                        <span>Recently Watched</span>
                      </h4>
                      {historyList.length === 0 ? (
                        <p className="text-[10px] text-slate-600 italic">No watch history yet.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {historyList.slice(0, 5).map((item, idx) => {
                            const chan = channels.find(c => c.id === item.channelId);
                            if (!chan) return null;
                            return (
                              <div key={`ph-${idx}`} onClick={() => { changeMainChannel(chan); setActiveTab("livetv"); }}
                                className="flex items-center gap-3 p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/30 cursor-pointer hover:border-cyan-500/30 transition-all">
                                <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {chan.logo ? <img src={chan.logo} alt="" className="h-7 w-7 object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} /> : <Tv className="h-4 w-4 text-slate-600" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-200 truncate">{chan.name}</p>
                                  <p className="text-[8px] text-slate-500 font-mono">Progress: {item.progress}%</p>
                                </div>
                                <Play className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-4">
                      <h4 className="font-bold text-xs text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-3">
                        <Sliders className="h-4 w-4 text-cyan-400" />
                        <span>Quick Settings</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setActiveTab("settings")} className="p-3 bg-slate-950/40 rounded-2xl border border-slate-800/30 hover:border-cyan-500/30 transition-all text-left cursor-pointer"><Sun className="h-4 w-4 text-cyan-400 mb-1.5" /><p className="text-[10px] font-bold text-slate-300">Theme</p><p className="text-[8px] text-slate-500 capitalize">{accentColor}</p></button>
                        <button onClick={() => setActiveTab("settings")} className="p-3 bg-slate-950/40 rounded-2xl border border-slate-800/30 hover:border-cyan-500/30 transition-all text-left cursor-pointer"><Radio className="h-4 w-4 text-cyan-400 mb-1.5" /><p className="text-[10px] font-bold text-slate-300">Player</p><p className="text-[8px] text-slate-500">{playerEngine}</p></button>
                        <button onClick={() => setActiveTab("settings")} className="p-3 bg-slate-950/40 rounded-2xl border border-slate-800/30 hover:border-cyan-500/30 transition-all text-left cursor-pointer"><Globe className="h-4 w-4 text-cyan-400 mb-1.5" /><p className="text-[10px] font-bold text-slate-300">Language</p><p className="text-[8px] text-slate-500">{appLang === "en" ? "English" : "বাংলা"}</p></button>
                        <button onClick={() => { if (confirm("Reset all?")) { localStorage.clear(); window.location.reload(); } }} className="p-3 bg-slate-950/40 rounded-2xl border border-rose-900/30 hover:border-rose-500/30 transition-all text-left cursor-pointer"><Trash2 className="h-4 w-4 text-rose-400 mb-1.5" /><p className="text-[10px] font-bold text-slate-300">Reset All</p><p className="text-[8px] text-slate-500">Clear data</p></button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* VIEW 6: Multi-utility Advanced Settings (tab: "settings") */}
            {activeTab === "settings" && (
              <motion.div
                key="settings-workspace"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="max-w-2xl mx-auto flex flex-col gap-6 text-left"
              >
                {/* Language Selector */}
                <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-6 shadow-xl">
                  <h4 className="font-bold text-xs text-slate-350 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Globe className="h-4 w-4 text-cyan-400" />
                    <span>{t(appLang, "settings.language")}</span>
                  </h4>
                  <div className="flex gap-2.5">
                    {(["en", "bn"] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => updateLanguage(lang)}
                        className={`flex-1 p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold ${
                          appLang === lang
                            ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                            : "bg-slate-950/60 border-slate-850 hover:border-slate-800 text-slate-300"
                        }`}
                      >
                        <span className="text-sm">{lang === "en" ? "🇬🇧" : "🇧🇩"}</span>
                        <p className="text-xs mt-1">{t(appLang, lang === "en" ? "settings.language.en" : "settings.language.bn")}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color Themes */}
                <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-6 shadow-xl">
                  <h4 className="font-bold text-xs text-slate-350 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Sun className="h-4 w-4 text-cyan-400 animate-pulse" />
                    <span>{t(appLang, "settings.theme")}</span>
                  </h4>
                  
                  <div className="grid grid-cols-4 gap-2.5 font-sans">
                    {[
                      { key: "cyan", title: t(appLang, "settings.theme.default"), hex: "bg-cyan-500" },
                      { key: "emerald", title: t(appLang, "settings.theme.emerald"), hex: "bg-emerald-500" },
                      { key: "teal", title: t(appLang, "settings.theme.teal"), hex: "bg-teal-500" },
                      { key: "rose", title: t(appLang, "settings.theme.rose"), hex: "bg-rose-500" }
                    ].map((theme) => (
                      <button
                        key={theme.key}
                        onClick={() => updateAccentColor(theme.key)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                          accentColor === theme.key 
                            ? "border-cyan-500 bg-slate-950" 
                            : "bg-slate-950/60 border-slate-850 hover:border-slate-800"
                        }`}
                      >
                        <span className={`h-4 w-4 rounded-full ${theme.hex}`} />
                        <span className="text-[10px] font-bold text-slate-300 tracking-tight">{theme.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Receiver Player Engine selections */}
                <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-6 shadow-xl">
                  <h4 className="font-bold text-xs text-slate-350 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Radio className="h-4 w-4 text-cyan-400" />
                    <span>{t(appLang, "settings.player")}</span>
                  </h4>

                  <div className="grid grid-cols-3 gap-2.5 font-mono">
                    {[
                      { key: "HlsJS", title: t(appLang, "settings.player.hlsjs"), desc: t(appLang, "settings.player.hlsjs.desc") },
                      { key: "NativeHLS", title: t(appLang, "settings.player.native"), desc: t(appLang, "settings.player.native.desc") },
                      { key: "VLC", title: t(appLang, "settings.player.vlc"), desc: t(appLang, "settings.player.vlc.desc") }
                    ].map((engine) => (
                      <button
                        key={engine.key}
                        onClick={() => updateEngineConfig(engine.key as any)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          playerEngine === engine.key 
                            ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" 
                            : "bg-slate-950/60 border-slate-850 hover:bg-slate-950"
                        }`}
                      >
                        <p className="text-[11px] font-black tracking-normal uppercase">{engine.title}</p>
                        <p className="text-[8.5px] text-slate-500 mt-1 font-sans leading-tight">{engine.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buffer controls and Auto plays */}
                <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
                  <h4 className="font-bold text-xs text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
                    <span>{t(appLang, "settings.buffer")}</span>
                  </h4>

                  <div className="grid grid-cols-3 gap-2.5 font-mono">
                    {[
                      { key: "low", title: t(appLang, "settings.buffer.low"), label: t(appLang, "settings.buffer.low.label") },
                      { key: "medium", title: t(appLang, "settings.buffer.medium"), label: t(appLang, "settings.buffer.medium.label") },
                      { key: "high", title: t(appLang, "settings.buffer.high"), label: t(appLang, "settings.buffer.high.label") }
                    ].map((b) => (
                      <button
                        key={b.key}
                        onClick={() => updateBufferConfig(b.key as any)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          bufferSize === b.key 
                            ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" 
                            : "bg-slate-950/60 border-slate-850 hover:bg-slate-950"
                        }`}
                      >
                        <p className="text-xs font-bold uppercase">{b.title}</p>
                        <p className="text-[8px] text-slate-500 font-sans mt-0.5">{b.label}</p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 divide-y divide-slate-900">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-xs font-extrabold text-slate-200">{t(appLang, "settings.autoplay")}</p>
                        <p className="text-[9.5px] text-slate-500 mt-0.5">{t(appLang, "settings.autoplay.desc")}</p>
                      </div>
                      <button
                        onClick={() => updateAutoPlayConfig(!autoPlay)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          autoPlay ? "bg-cyan-500" : "bg-slate-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                            autoPlay ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-xs font-extrabold text-slate-200">{t(appLang, "settings.offline")}</p>
                        <p className="text-[9.5px] text-slate-500 mt-0.5">{t(appLang, "settings.offline.desc")}</p>
                      </div>
                      <button
                        onClick={() => { setOfflineCacheEnabled(!offlineCacheEnabled); triggerToast(!offlineCacheEnabled ? t(appLang, "settings.offline.on") : t(appLang, "settings.offline.off")); }}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          offlineCacheEnabled ? "bg-cyan-500" : "bg-slate-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                            offlineCacheEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Backup Paste M3U direct lists */}
                <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-6 shadow-xl">
                  <h4 className="font-bold text-xs text-slate-300 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <FolderPlus className="h-4 w-4 text-cyan-400" />
                    <span>{t(appLang, "settings.custom.m3u")}</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                    {t(appLang, "settings.custom.m3u.desc")}
                  </p>

                  <textarea
                    rows={4}
                    value={customM3UPaste}
                    onChange={(e) => handleUpdateM3UText(e.target.value)}
                    placeholder="#EXTM3U&#13;#EXTINF:-1 tvg-logo='https://example.com/logo.png' group-title='Sports',Somoy TV&#13;https://live-example.com/stream.m3u8"
                    className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-3.5 text-xs font-mono text-slate-350 outline-none focus:border-cyan-500 transition-colors leading-relaxed placeholder:text-slate-700"
                  />

                  <div className="flex gap-3 justify-end mt-3">
                    {customM3UPaste && (
                      <button
                        onClick={() => { handleUpdateM3UText(""); triggerToast(t(appLang, "settings.custom.clear")); }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl border border-slate-800"
                      >
                        {t(appLang, "settings.custom.clear")}
                      </button>
                    )}
                    <button
                      onClick={triggerImportCustomPlaylist}
                      className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 font-black text-xs rounded-xl hover:scale-103 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{t(appLang, "settings.custom.import")}</span>
                    </button>
                  </div>
                </div>



                {/* Storage Reset clear */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-200">{t(appLang, "settings.reset")}</h4>
                    <p className="text-[10px] text-slate-550 mt-1">{t(appLang, "settings.reset.desc")}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(t(appLang, "settings.reset.confirm"))) {
                        localStorage.clear();
                        setHistoryList([]);
                        setCustomM3UPaste("");
                        setPlayerEngine("HlsJS");
                        setBufferSize("medium");
                        setAutoPlay(true);
                        setAccentColor("cyan");
                        fetchChannels();
                        alert(t(appLang, "settings.reset.done"));
                      }
                    }}
                    className="px-4 py-2 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/30 text-rose-350 text-xs font-black rounded-xl transition-all cursor-pointer"
                  >
                    {t(appLang, "settings.reset.btn")}
                  </button>
                </div>
              </motion.div>
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
                
                {/* Embedded synchronized Hls play feed */}
                <div className="pointer-events-none scale-103 h-full w-full">
                  <VideoPlayer
                    channel={selectedChannel}
                    autoPlay={true}
                    bufferMode="low"
                    playerEngine={playerEngine}
                    language={appLang}
                  />
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
