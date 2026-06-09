import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Hls from "hls.js";
import { Channel } from "../types";
import { Language, t } from "../translations";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, AlertTriangle, Loader2,
  ArrowRight, Expand, Check, Sun, Monitor, Cast, Sliders, HelpCircle,
  Wifi, Tv, ChevronRight, Star, Lock, Unlock, RefreshCw, List, Clock,
  Share2, RotateCw, Timer, X
} from "../icons";

interface VideoPlayerProps {
  channel: Channel | null;
  channels?: Channel[];
  recentChannelIds?: string[];
  onPrevChannel?: () => void;
  onNextChannel?: () => void;
  onChannelSelect?: (channel: Channel) => void;
  onToggleFavorite?: (channelId: string) => void;
  onAddToHistory?: (channelId: string) => void;
  autoPlay?: boolean;
  bufferMode?: "low" | "medium" | "high";
  playerEngine?: "NativeHLS" | "VLC" | "HlsJS";
  language?: Language;
  isFavorite?: boolean;
}

const SLEEP_OPTIONS = [
  { label: "Off", minutes: 0 },
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "60 min", minutes: 60 },
];

const _isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export default function VideoPlayer({
  channel, channels = [], recentChannelIds = [],
  onPrevChannel, onNextChannel, onChannelSelect,
  onToggleFavorite, onAddToHistory,
  autoPlay = true, bufferMode = "medium",
  playerEngine = "HlsJS", language = "en", isFavorite = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const watchdogRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const bufferPollRef = useRef<number | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useRef(_isMobile);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [skipNotification, setSkipNotification] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"contain" | "cover" | "fill">("contain");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(1.0);
  const [quality, setQuality] = useState<"Auto" | "1080p" | "720p" | "480p" | "360p" | "240p">("360p");
  const [isOptimizingQuality, setIsOptimizingQuality] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showCastModal, setShowCastModal] = useState(false);
  const [castDevice, setCastDevice] = useState<string | null>(null);
  const [isConnectingCast, setIsConnectingCast] = useState(false);
  const [castRadarActive, setCastRadarActive] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [bufferLevel, setBufferLevel] = useState(0);

  // New features state
  const [isLocked, setIsLocked] = useState(false);
  const [showChannelDrawer, setShowChannelDrawer] = useState(false);
  const [showSleepTimerMenu, setShowSleepTimerMenu] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(0);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [isRotated, setIsRotated] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  // Recent channels resolved from ids
  const recentChannels = useMemo(() => {
    return recentChannelIds
      .map(id => channels.find(c => c.id === id))
      .filter((c): c is Channel => c !== undefined)
      .slice(0, 10);
  }, [recentChannelIds, channels]);

  // Trigger history callback on channel start
  useEffect(() => {
    if (channel && onAddToHistory) {
      onAddToHistory(channel.id);
    }
  }, [channel?.id]);

  // Background audio: keep playing when page hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && videoRef.current && isPlaying) {
        videoRef.current.continue?.();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isPlaying]);

  // Buffer level polling — requestAnimationFrame for mobile efficiency
  useEffect(() => {
    if (!isPlaying || !videoRef.current) {
      setBufferLevel(0);
      return;
    }
    let rafId: number;
    let lastUpdate = 0;
    const poll = (time: number) => {
      if (time - lastUpdate >= 1000) {
        lastUpdate = time;
        const v = videoRef.current;
        if (v && v.buffered.length > 0) {
          const end = v.buffered.end(v.buffered.length - 1);
          const dur = v.duration || 1;
          setBufferLevel(Math.min(end / dur, 1));
        }
      }
      rafId = requestAnimationFrame(poll);
    };
    rafId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, channel]);

  // Sleep timer countdown — use rAF throttled for mobile efficiency
  useEffect(() => {
    if (sleepTimerMinutes <= 0) {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      setSleepTimerRemaining(null);
      return;
    }
    const endMs = Date.now() + sleepTimerMinutes * 60 * 1000;
    setSleepTimerRemaining(sleepTimerMinutes * 60);
    let rafId: number;
    let lastTick = 0;
    const tick = (time: number) => {
      if (time - lastTick >= 1000) {
        lastTick = time;
        const left = Math.max(0, Math.round((endMs - Date.now()) / 1000));
        setSleepTimerRemaining(left);
        if (left <= 0) {
          if (videoRef.current) { videoRef.current.pause(); setIsPlaying(false); }
          setToastMessage("Sleep timer ended");
          setTimeout(() => setToastMessage(null), 2500);
          return;
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [sleepTimerMinutes]);

  // Rotation
  const toggleRotation = async () => {
    try {
      if (isRotated) {
        await (screen as any).orientation?.unlock?.();
        setIsRotated(false);
      } else {
        await (screen as any).orientation?.lock?.("landscape");
        setIsRotated(true);
      }
    } catch { setIsRotated(!isRotated); }
  };

  // Share
  const handleShare = async () => {
    if (!channel) return;
    const shareData = { title: channel.name, text: `Watch ${channel.name} live!`, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      setShowShareSheet(true);
    }
    setShowShareSheet(false);
  };

  const refreshStream = () => {
    setRetryCount(0);
    setHasError(null);
    setIsLoading(true);
    startWatchdog();
    const video = videoRef.current;
    if (!video || !channel) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    video.src = "";
    video.load();
    setTimeout(() => {
      if (channel) setupPlayer(channel);
    }, 200);
  };

  const setupPlayer = (ch: Channel) => {
    const video = videoRef.current;
    if (!video) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    const streamUrl = ch.url;
    setIsLoading(true);
    startWatchdog();
    const mobile = isMobile.current;
    const bufferSizeMB = bufferMode === "low" ? (mobile ? 3 : 5) : bufferMode === "high" ? (mobile ? 20 : 40) : (mobile ? 10 : 20);
    const maxRetryCount = bufferMode === "low" ? 0 : bufferMode === "high" ? 3 : 1;
    if (Hls.isSupported() && playerEngine !== "VLC") {
      const hls = new Hls({
        enableWorker: !mobile,
        maxBufferSize: bufferSizeMB * 1024 * 1024,
        lowLatencyMode: false,
        manifestLoadingTimeOut: mobile ? 20000 : 10000,
        manifestLoadingMaxRetry: mobile ? 3 : maxRetryCount,
        manifestLoadingRetryDelay: 1000,
        startLevel: 0,
        maxBufferLength: mobile ? 10 : 30,
        maxMaxBufferLength: mobile ? 30 : 60,
        backbufferLength: mobile ? 30 : 90,
        liveDurationInfinity: false,
        liveSyncDurationCount: mobile ? 3 : 5,
        liveMaxLatencyDurationCount: mobile ? 6 : 10,
        abrEwmaDefaultEstimate: mobile ? 200000 : 500000,
        abrBandWidthUpFactor: 0.5,
        abrBandWidthDownFactor: 0.4,
        abrEwmaFastVoD: mobile ? 2 : 3,
        abrEwmaSlowVoD: mobile ? 5 : 7,
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => setIsLoading(true));
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false); setIsPlaying(true); setIsReconnecting(false);
        if (watchdogRef.current) clearTimeout(watchdogRef.current);
        if (autoPlay) { video.play().catch(() => { video.muted = true; setIsMuted(true); video.play().catch(() => setIsPlaying(false)); }); }
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          if (watchdogRef.current) clearTimeout(watchdogRef.current);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && retryCount < maxRetryCount) { setRetryCount(p => p + 1); hls.startLoad(); }
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else handleAutoReconnect();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => { setIsLoading(false); setIsPlaying(true); setIsReconnecting(false); if (watchdogRef.current) clearTimeout(watchdogRef.current); if (autoPlay) { video.play().catch(() => { video.muted = true; setIsMuted(true); video.play().catch(() => {}); }); } });
      video.addEventListener("error", () => { if (watchdogRef.current) clearTimeout(watchdogRef.current); handleAutoReconnect(); });
    } else setHasError(t(language, "player.error.desc")); setIsLoading(false);
  };

  // Reset on channel change
  useEffect(() => {
    setIsPlaying(false); setIsLoading(true); setHasError(null); setRetryCount(0);
    setSkipNotification(null); setIsReconnecting(false);
    if (setShowSleepTimerMenu) setShowSleepTimerMenu(false);
    if (showChannelDrawer) setShowChannelDrawer(false);
    if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
    if (reconnectRef.current) { clearTimeout(reconnectRef.current); reconnectRef.current = null; }
  }, [channel]);

  useEffect(() => {
    if (!channel) return;
    setupPlayer(channel);
    return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; } };
  }, [channel, retryCount, bufferMode, playerEngine]);

  const triggerAutoSkip = (reason: string) => {
    if (!onNextChannel) return;
    setSkipNotification(t(language, "player.skip", { reason })); setIsLoading(false);
    setTimeout(() => { setSkipNotification(null); if (onNextChannel) onNextChannel(); }, 1200);
  };

  const startWatchdog = () => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = setTimeout(() => { if (isLoading && !isPlaying) handleAutoReconnect(); }, 5000);
  };

  const handleAutoReconnect = () => {
    setIsReconnecting(true); setIsLoading(true);
    let reconnectAttempts = 0;
    const attemptReconnect = () => {
      reconnectAttempts++;
      if (reconnectAttempts > 2) { setIsReconnecting(false); triggerAutoSkip(t(language, "player.skip.auto")); return; }
      setToastMessage(t(language, "player.reconnect.msg", { n: reconnectAttempts }));
      setTimeout(() => setToastMessage(null), 2000);
      const streamUrl = channel?.url;
      if (videoRef.current && streamUrl) {
        if (Hls.isSupported() && hlsRef.current) { hlsRef.current.loadSource(streamUrl); hlsRef.current.startLoad(); }
        else { videoRef.current.src = streamUrl; videoRef.current.load(); }
      }
    };
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
    reconnectRef.current = setTimeout(attemptReconnect, 2000);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) { video.pause(); setIsPlaying(false); }
    else { video.play().then(() => setIsPlaying(true)).catch(() => setHasError("Playback blocked.")); }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v); setIsMuted(v === 0);
    if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = v === 0; }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted); video.muted = nextMuted; video.volume = nextMuted ? 0 : volume;
  };

  const toggleFullscreen = () => {
    const pc = videoRef.current?.parentElement;
    if (!pc) return;
    if (!isFullscreen) {
      (pc.requestFullscreen?.() || (pc as any).webkitRequestFullscreen?.());
      setIsFullscreen(true);
    } else {
      (document.exitFullscreen?.() || (document as any).webkitExitFullscreen?.());
      setIsFullscreen(false);
    }
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) { await document.exitPictureInPicture(); setToastMessage(t(language, "player.pip.off")); }
      else if (video.requestPictureInPicture) { await video.requestPictureInPicture(); setToastMessage(t(language, "player.pip.on")); }
      else setToastMessage(t(language, "player.pip.error"));
    } catch { setToastMessage("PiP Error"); }
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleQualityChange = (selected: typeof quality) => {
    setQuality(selected); setShowQualityMenu(false); setIsOptimizingQuality(true);
    // Apply level to HLS.js
    if (hlsRef.current) {
      const levelMap: Record<string, number> = { "240p": 0, "360p": 1, "480p": 2, "720p": 3, "1080p": 4 };
      const idx = levelMap[selected];
      if (selected === "Auto") hlsRef.current.currentLevel = -1;
      else if (idx !== undefined) hlsRef.current.currentLevel = Math.min(idx, hlsRef.current.levels.length - 1);
    }
    setTimeout(() => { setIsOptimizingQuality(false); setToastMessage(selected === "Auto" ? t(language, "player.quality.auto") : t(language, "player.quality.changed", { quality: selected })); }, 800);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const triggerCastCheck = () => { setCastRadarActive(true); setIsConnectingCast(true); setShowCastModal(true); setTimeout(() => setCastRadarActive(false), 2000); };
  const selectCastDevice = (device: string) => { setCastDevice(device); setIsConnectingCast(false); setShowCastModal(false); setToastMessage(t(language, "toast.cast.active", { device })); setTimeout(() => setToastMessage(null), 3000); };
  const stopCasting = () => { setCastDevice(null); setShowCastModal(false); setToastMessage(t(language, "player.cast.stopped")); setTimeout(() => setToastMessage(null), 2500); };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Group channels for drawer
  const groupedDrawerChannels = useMemo(() => {
    const map = new Map<string, Channel[]>();
    for (const c of channels) {
      const g = c.group || "Other";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(c);
    }
    return Array.from(map.entries());
  }, [channels]);

  const handleDrawerChannelClick = (ch: Channel) => {
    setShowChannelDrawer(false);
    onChannelSelect?.(ch);
  };

  if (!channel) {
    return (
      <div id="empty-player" className="flex flex-col items-center justify-center aspect-video w-full bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 p-8 text-center shadow-inner">
        <Tv className="h-14 w-14 text-cyan-500/20 mb-4 animate-pulse" />
        <h3 className="font-semibold text-lg text-slate-200">{t(language, "live.empty.player")}</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-sm">{t(language, "live.empty.player.hint")}</p>
      </div>
    );
  }

  return (
    <div id="video-wrapper" className="flex flex-col w-full relative">
      <div id="player-container" className="relative group bg-black aspect-video w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-slate-900">
        <div className="absolute inset-0 bg-black pointer-events-none z-10 transition-opacity duration-200" style={{ opacity: Math.max(0, 1 - brightness) }} />
        <video ref={videoRef} className={`w-full h-full transition-all duration-300 ${aspectRatio === "contain" ? "object-contain" : aspectRatio === "cover" ? "object-cover" : "object-fill"}`} style={{ filter: `brightness(${brightness})` }} onClick={isLocked ? undefined : togglePlay} playsInline preload="none" muted={isMuted} />

        {/* Lock overlay when locked */}
        {isLocked && (
          <div className="absolute inset-0 z-30 flex items-center justify-center">
            <button onClick={() => setIsLocked(false)} className="p-3 rounded-full bg-slate-900/80 border border-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer">
              <Unlock className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Toast */}
        {toastMessage && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 text-cyan-400 px-4 py-2.5 rounded-full shadow-2xl text-xs font-bold font-mono tracking-wide z-50 flex items-center gap-2 animate-fade-in">
            <Check className="h-3.5 w-3.5 stroke-[3px]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Cast indicator */}
        {castDevice && (
          <div className="absolute top-4 left-4 bg-cyan-600 border border-cyan-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-1 rounded-full shadow-lg z-30 flex items-center gap-1.5 animate-pulse">
            <Cast className="h-3 w-3" />
            <span>Casting to {castDevice}</span>
          </div>
        )}

        {/* Sleep timer indicator */}
        {sleepTimerRemaining !== null && sleepTimerRemaining > 0 && (
          <div className="absolute top-4 right-4 bg-slate-900/80 border border-slate-700/50 text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded-full z-30 flex items-center gap-1.5">
            <Timer className="h-3 w-3" />
            <span>{Math.floor(sleepTimerRemaining / 60)}:{(sleepTimerRemaining % 60).toString().padStart(2, "0")}</span>
          </div>
        )}

        {/* Skip notification */}
        {skipNotification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-rose-950/90 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-3 border border-rose-500/30 shadow-lg text-rose-100 text-xs font-bold z-50 animate-bounce">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>{t(language, "player.skip.msg", { reason: skipNotification || "" })}</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        )}

        {/* Quality optimizing overlay */}
        {isOptimizingQuality && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs z-30">
            <Sliders className="h-8 w-8 text-cyan-400 animate-bounce mb-2" />
            <p className="text-xs text-cyan-350 font-mono font-bold">Optimizing Bitrate ({quality})...</p>
          </div>
        )}

        {/* Loading overlay */}
        {(isLoading || isReconnecting) && !skipNotification && !isOptimizingQuality && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs z-20">
            <Loader2 className="h-10 w-10 text-cyan-500 animate-spin mb-3" />
            <p className="text-sm text-slate-200 font-bold">{isReconnecting ? t(language, "player.reconnecting") : t(language, "player.loading")}</p>
            <p className="text-[10px] bg-slate-900 border border-slate-800 text-slate-500 uppercase px-2 py-0.5 mt-2 rounded font-mono">Engine: {playerEngine} ({bufferMode})</p>
            <p className="text-xs text-slate-600 mt-1 uppercase tracking-wider">{channel.group}</p>
          </div>
        )}

        {/* Error overlay */}
        {hasError && !isLoading && !isReconnecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-center p-6 z-20">
            <AlertTriangle className="h-12 w-12 text-rose-500 mb-3" />
            <h4 className="text-slate-200 font-bold mb-1">{t(language, "player.error")}</h4>
            <p className="text-xs text-rose-400 max-w-sm mb-4 leading-relaxed">{hasError}</p>
            <div className="flex gap-3">
              <button onClick={() => { setRetryCount(0); setHasError(null); setIsLoading(true); startWatchdog(); }} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 cursor-pointer">{t(language, "player.error.retry")}</button>
              {onNextChannel && <button onClick={() => triggerAutoSkip(t(language, "player.skip.manual"))} className="px-4 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 text-xs font-semibold rounded-lg border border-rose-500/30 cursor-pointer">{t(language, "player.error.next")}</button>}
            </div>
          </div>
        )}

        {/* Top bar (visible on hover, hidden when locked) */}
        {!isLocked && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/85 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-3">
              {channel.logo && <img src={channel.logo} alt={channel.name} referrerPolicy="no-referrer" loading="lazy" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} className="h-8 w-8 object-contain rounded bg-white/10 p-1" />}
              <div>
                <h4 className="text-white text-sm font-semibold drop-shadow-md">{channel.name}</h4>
                <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] rounded border border-cyan-500/30">{channel.group}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onToggleFavorite?.(channel.id)} className="p-1.5 hover:text-yellow-400 transition-colors cursor-pointer" title="Favorite">
                <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
              </button>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-red-400 text-[11px] font-bold tracking-widest uppercase font-mono">LIVE</span>
            </div>
          </div>
        )}

        {/* Left brightness slider (hidden when locked) */}
        {!isLocked && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1.5 bg-slate-950/80 border border-slate-850 px-2.5 py-4 rounded-full z-20">
            <Sun className="h-4 w-4 text-cyan-400" />
            <input type="range" min="0.2" max="1.5" step="0.1" value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))} className="h-16 w-1 accent-cyan-500 cursor-pointer appearance-none bg-slate-700 rounded-full" title="Brightness" style={{ writingMode: "bt-lr", WebkitAppearance: "slider-vertical" } as any} />
            <span className="text-[8px] font-mono text-cyan-400 font-bold">{Math.round(brightness * 100)}%</span>
          </div>
        )}

        {/* Bottom controls (hidden when locked) */}
        {!isLocked && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
            {/* Buffer indicator bar */}
            <div className="w-full h-0.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500/60 rounded-full transition-all duration-300" style={{ width: `${bufferLevel * 100}%` }} />
            </div>
            <div className="flex items-center justify-between w-full text-white">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="p-1.5 hover:text-cyan-400 transition-colors focus:outline-none cursor-pointer" title={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white" />}
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="hover:text-cyan-400 transition-colors focus:outline-none cursor-pointer" title={isMuted ? "Unmute" : "Mute"}>
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-16 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 opacity-70 hover:opacity-100" />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4 bg-slate-950/45 px-3 py-1.5 rounded-full border border-slate-850/60">
                {onPrevChannel && <button className="text-[10.5px] font-bold text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer px-1" onClick={onPrevChannel}>{t(language, "player.prev")}</button>}
                <span className="text-[9px] text-slate-600">|</span>
                {onNextChannel && <button className="text-[10.5px] font-bold text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer px-1" onClick={onNextChannel}>{t(language, "player.next")}</button>}
              </div>
              <div className="flex items-center gap-2.5">
                {/* Channel list drawer */}
                <button onClick={() => setShowChannelDrawer(true)} className="p-1.5 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer" title="Channel List">
                  <List className="h-4 w-4" />
                </button>
                {/* Refresh */}
                <button onClick={refreshStream} className="p-1.5 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer" title="Refresh Stream">
                  <RefreshCw className="h-4 w-4" />
                </button>
                {/* Cast */}
                <button onClick={triggerCastCheck} className={`p-1.5 hover:text-cyan-400 transition-colors cursor-pointer ${castDevice ? "text-cyan-400" : "text-slate-300"}`} title="Cast to TV"><Cast className="h-4 w-4" /></button>
                {/* PiP */}
                <button onClick={togglePictureInPicture} className="p-1.5 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer" title="Picture-in-Picture"><Monitor className="h-4 w-4" /></button>
                {/* Quality */}
                <div className="relative">
                  <button onClick={() => setShowQualityMenu(!showQualityMenu)} className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold hover:text-cyan-400 hover:border-cyan-500 font-mono flex items-center gap-1 cursor-pointer"><span>{quality}</span></button>
                  {showQualityMenu && (
                    <div className="absolute bottom-8 right-0 bg-slate-950 border border-slate-850 rounded-xl p-1 shadow-2xl z-50 flex flex-col gap-0.5 min-w-24">
                      {["Auto", "1080p", "720p", "480p", "360p", "240p"].map((q) => (
                        <button key={q} onClick={() => handleQualityChange(q as any)} className={`text-left px-2.5 py-1.5 text-[10.5px] font-mono rounded hover:bg-cyan-500 hover:text-slate-950 ${quality === q ? "text-cyan-400 font-bold" : "text-slate-400"}`}>{q}</button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Aspect ratio */}
                <button onClick={() => { const map = { contain: "cover", cover: "fill", fill: "contain" } as const; const next = map[aspectRatio]; setAspectRatio(next); setToastMessage(t(language, next === "contain" ? "player.scale.fit" : next === "cover" ? "player.scale.zoom" : "player.scale.stretch")); setTimeout(() => setToastMessage(null), 2500); }} className="p-1.5 hover:text-cyan-400 transition-colors focus:outline-none cursor-pointer flex items-center gap-0.5 text-[11px]" title="Aspect Ratio"><Expand className="h-4 w-4" /><span className="uppercase text-[9px] font-extrabold hidden sm:inline">{aspectRatio}</span></button>
                {/* Fullscreen */}
                <button onClick={toggleFullscreen} className="p-1.5 hover:text-cyan-400 transition-colors focus:outline-none cursor-pointer">{isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}</button>
                {/* Lock */}
                <button onClick={() => setIsLocked(true)} className="p-1.5 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer" title="Lock Screen"><Lock className="h-4 w-4" /></button>
              </div>
            </div>
            {/* Second row: extra controls */}
            <div className="flex items-center justify-between w-full px-1 opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                {/* Share */}
                <button onClick={handleShare} className="text-[10px] text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"><Share2 className="h-3 w-3" /> Share</button>
                {/* Sleep timer */}
                <div className="relative">
                  <button onClick={() => setShowSleepTimerMenu(!showSleepTimerMenu)} className={`text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${sleepTimerMinutes > 0 ? "text-cyan-400" : "text-slate-400 hover:text-cyan-400"}`}><Timer className="h-3 w-3" /> {sleepTimerMinutes > 0 ? `${sleepTimerMinutes}m` : "Sleep"}</button>
                  {showSleepTimerMenu && (
                    <div className="absolute bottom-6 left-0 bg-slate-950 border border-slate-850 rounded-xl p-1 shadow-2xl z-50 flex flex-col gap-0.5 min-w-20">
                      {SLEEP_OPTIONS.map((opt) => (
                        <button key={opt.minutes} onClick={() => { setSleepTimerMinutes(opt.minutes); setShowSleepTimerMenu(false); }} className={`text-left px-2.5 py-1.5 text-[10px] font-mono rounded hover:bg-cyan-500 hover:text-slate-950 ${sleepTimerMinutes === opt.minutes ? "text-cyan-400 font-bold" : "text-slate-400"}`}>{opt.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Rotation */}
                <button onClick={toggleRotation} className="text-[10px] text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"><RotateCw className="h-3 w-3" /> {isRotated ? "Portrait" : "Landscape"}</button>
                {/* Favorite */}
                <button onClick={() => onToggleFavorite?.(channel.id)} className={`text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${isFavorite ? "text-yellow-400" : "text-slate-400 hover:text-yellow-400"}`}><Star className={`h-3 w-3 ${isFavorite ? "fill-yellow-400" : ""}`} /> {isFavorite ? "Favorited" : "Favorite"}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Channel Drawer */}
      {showChannelDrawer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowChannelDrawer(false)}>
          <div className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 rounded-t-3xl max-h-[70vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md z-10 flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2"><List className="h-4 w-4 text-cyan-400" /> Channel List</h3>
              <button onClick={() => setShowChannelDrawer(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            {/* Recent channels */}
            {recentChannels.length > 0 && (
              <div className="px-4 pt-3 pb-2">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-2"><Clock className="h-3 w-3" /> Recent</span>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {recentChannels.map((ch) => (
                    <button key={ch.id} onClick={() => handleDrawerChannelClick(ch)} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-cyan-500/20 rounded-xl border border-slate-700/50 text-xs text-slate-300 hover:text-cyan-400 transition-all cursor-pointer">
                      {ch.logo && <img src={ch.logo} alt="" loading="lazy" className="h-5 w-5 object-contain rounded" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />}
                      <span className="font-medium whitespace-nowrap">{ch.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* All channels by group */}
            <div className="px-4 pb-4">
              {groupedDrawerChannels.map(([group, chs]) => (
                <div key={group} className="mb-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 block">{group} ({chs.length})</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {chs.map((ch) => (
                      <button key={ch.id} onClick={() => handleDrawerChannelClick(ch)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${ch.id === channel?.id ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400" : "bg-slate-800/40 hover:bg-slate-800 border border-slate-800/50 text-slate-400 hover:text-white"}`}>
                        {ch.logo && <img src={ch.logo} alt="" className="h-5 w-5 object-contain rounded flex-shrink-0" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />}
                        <span className="truncate font-medium">{ch.name}</span>
                        {ch.id === channel?.id && <span className="ml-auto text-[8px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-mono">ON AIR</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share sheet */}
      {showShareSheet && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-3xl" onClick={() => setShowShareSheet(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xs w-full mx-4 text-center" onClick={(e) => e.stopPropagation()}>
            <Share2 className="h-10 w-10 text-cyan-400 mx-auto mb-3" />
            <h4 className="text-white font-bold text-sm mb-2">Share Channel</h4>
            <p className="text-[10px] text-slate-500 mb-4">Copy the link below to share with friends</p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400 font-mono truncate mb-4">{window.location.href}</div>
            <button onClick={() => { navigator.clipboard?.writeText(window.location.href); setToastMessage("Link copied!"); setTimeout(() => setToastMessage(null), 2000); setShowShareSheet(false); }} className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition-colors">Copy Link</button>
          </div>
        </div>
      )}

      {/* Cast modal */}
      {showCastModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 p-4 flex flex-col items-center justify-center animate-fade-in text-slate-100 rounded-3xl">
          <div className="max-w-xs text-center flex flex-col items-center">
            <Cast className={`h-12 w-12 text-cyan-400 mb-3 ${castRadarActive ? "animate-pulse" : ""}`} />
            <h4 className="font-bold text-sm text-slate-200">{t(language, "player.cast.searching")}</h4>
            <p className="text-[10px] text-slate-500 mt-1">{t(language, "player.cast.searching")}</p>
            {castRadarActive ? (
              <div className="flex flex-col items-center gap-3 my-6">
                <div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                <span className="text-[9px] text-cyan-400 uppercase tracking-widest font-mono">{t(language, "player.cast.searching")}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 w-full my-4 text-left">
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1">{t(language, "player.cast.devices")}</span>
                {[
                  { id: "living-tv", name: t(language, "player.cast.living") },
                  { id: "bedroom-tv", name: t(language, "player.cast.bedroom") },
                  { id: "anycast-tv", name: t(language, "player.cast.anycast") },
                ].map((device) => (
                  <button key={device.id} onClick={() => selectCastDevice(device.name)} className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all text-left flex items-center justify-between ${castDevice === device.name ? "bg-cyan-500 border-cyan-400 text-slate-950 font-bold" : "bg-slate-900 border-slate-850 text-slate-350 hover:bg-slate-850 hover:border-slate-800"}`}>
                    <span>{device.name}</span>
                    {castDevice === device.name ? <Check className="h-4 w-4" /> : <ChevronRight className="h-3 w-3 text-slate-600" />}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-2">
              <button onClick={() => setShowCastModal(false)} className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-800 cursor-pointer">{t(language, "player.cast.close")}</button>
              {castDevice && <button onClick={stopCasting} className="px-4 py-1.5 bg-rose-950/40 hover:bg-rose-900/30 text-rose-350 text-xs font-semibold rounded-lg border border-rose-900/30 cursor-pointer">{t(language, "player.cast.stop")}</button>}
            </div>
          </div>
        </div>
      )}

      {/* Under player details */}
      <div id="player-details" className="mt-3 p-4 bg-slate-900/80 backdrop-blur-md border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 flex-shrink-0 bg-slate-950/65 rounded-lg border border-slate-805 flex items-center justify-center overflow-hidden">
            {channel.logo ? <img src={channel.logo} alt={channel.name} referrerPolicy="no-referrer" loading="lazy" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} className="h-10 w-10 object-contain p-1" /> : <Tv className="h-5 w-5 text-cyan-400/40" />}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-100 text-base">{channel.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-[10px] bg-slate-950 text-cyan-400 font-mono px-2 py-0.5 rounded border border-cyan-500/20 font-bold tracking-wider">{t(language, "player.bitrate", { quality: quality === "Auto" ? "Auto Bitrate" : quality })}</span>
              <span className="text-xs text-cyan-400 font-medium bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">{channel.group}</span>
              <span className="text-[10px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/20 uppercase font-mono tracking-wider">Secure Connect</span>
            </div>
          </div>
        </div>
        <div id="channel-action-row" className="flex flex-wrap items-center gap-3 bg-slate-950/85 px-4 py-2.5 rounded-xl border border-slate-850">
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-widest leading-none">{t(language, "player.signal")}</span>
            <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5 mt-1 leading-none"><Wifi className="h-3 w-3 text-emerald-400 animate-pulse" /> {t(language, "player.signal.ok")}</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-850" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-widest leading-none">{t(language, "player.audio")}</span>
            <span className="text-xs font-bold text-slate-350 font-mono mt-1 leading-none">{t(language, "player.audio.desc")}</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-850" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-widest leading-none">{t(language, "player.engine")}</span>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono mt-1 leading-none">{playerEngine}</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-850" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-widest leading-none">Buffer</span>
            <span className="text-[10px] font-bold text-slate-300 font-mono mt-1 leading-none">{Math.round(bufferLevel * 100)}%</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-850" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-widest leading-none">Sleep</span>
            <span className="text-[10px] font-bold text-slate-300 font-mono mt-1 leading-none">{sleepTimerMinutes > 0 ? `${sleepTimerMinutes}m` : "Off"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
