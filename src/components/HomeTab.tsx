import React, { useMemo, memo } from "react";
import { motion } from "motion/react";
import { TabProps, Channel } from "../types";
import { t } from "../translations";
import { Play, Tv, TrendingUp, Eye } from "../icons";

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

function FlagImg({ url, fallback }: { url?: string; fallback: string }) {
  if (!url) return <span className="text-2xl">{fallback || "🏳️"}</span>;
  return <><img src={url} alt="" loading="lazy" className="h-8 w-8 rounded-full object-cover border border-slate-700" onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden') }} /><span className="text-2xl hidden">{fallback || "🏳️"}</span></>;
}

function CountdownDisplay({ startTime }: { startTime?: number }) {
  const [cd, setCd] = React.useState("");
  React.useEffect(() => {
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

function HomeTabInner({
  appLang, channels, liveEvents, changeMainChannel, setActiveTab,
  setPickerChannels,
  sportsFilter, setSportsFilter, matchFilter, setMatchFilter,
}: TabProps) {
  const trendingChannels = useMemo(() => {
    return channels.filter(c => c.group === "Football World Cup 2026").slice(0, 12);
  }, [channels]);

  const getMatchCount = (filterId: string) => {
    if (filterId === "All") return liveEvents.length;
    return liveEvents.filter(e => e.status === filterId.toLowerCase()).length;
  };

  return (
    <motion.div
      key="home-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4 px-3 pt-3"
    >
      <div id="container-746233a5c9d232e44637fa5f647e4c59"></div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
        {sportsCategories.map((cat) => (
          <button key={cat.id} onClick={() => setSportsFilter(cat.id)}
            className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl transition-all flex-shrink-0 border ${
              sportsFilter === cat.id ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400" : "bg-slate-800/30 border-slate-700/30 text-slate-400 hover:border-slate-600/50"
            }`}>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${sportsFilter === cat.id ? "bg-cyan-500/20" : "bg-slate-800/50"}`}>
              {cat.icon}
            </div>
            <span className="text-[9px] font-bold whitespace-nowrap">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {matchFilters.map((mf) => (
          <button key={mf.id} onClick={() => setMatchFilter(mf.id)}
            className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all border flex items-center gap-1.5 flex-shrink-0 ${
              matchFilter === mf.id ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400" : "bg-slate-800/30 border-slate-700/30 text-slate-400 hover:border-slate-600/50"
            }`}>
            {mf.label}
            <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${matchFilter === mf.id ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-700/50 text-slate-500"}`}>
              {getMatchCount(mf.id)}
            </span>
          </button>
        ))}
      </div>

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
                <div key={evt.id}
                  className={`p-4 rounded-3xl border transition-all relative overflow-hidden ${
                    isLive ? "bg-gradient-to-br from-slate-800/60 via-slate-800/30 to-cyan-950/20 border-cyan-500/40 shadow-lg shadow-cyan-950/10"
                    : isUpcoming ? "bg-slate-800/30 border-slate-700/50" : "bg-slate-800/20 border-slate-700/30"
                  }`}>
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
                      isLive ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : isUpcoming ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
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
                  {isUpcoming && evt.startTime && (
                    <div className="mt-3 pt-3 border-t border-slate-700/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">{evt.statusText || "Scheduled"}</span>
                        <CountdownDisplay startTime={evt.startTime} />
                      </div>
                    </div>
                  )}
                  {isLive && (
                    <div className="mt-3 pt-3 border-t border-slate-700/30">
                      <button onClick={() => {
                        const ids = evt.channelIds?.length ? evt.channelIds : (evt.channelId ? [evt.channelId] : []);
                        const matchChannels = ids.map(id => channels.find(c => c.id === id)).filter(Boolean) as Channel[];
                        if (matchChannels.length === 1) { changeMainChannel(matchChannels[0]); setActiveTab("livetv"); return; }
                        if (matchChannels.length > 1) setPickerChannels(matchChannels);
                      }}
                        className="w-full py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 text-[10px] font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
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

      {trendingChannels.length > 0 && (
        <div className="flex flex-col gap-3 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
            <h3 className="font-extrabold text-xs text-slate-400 tracking-wider uppercase">Trending Channels</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {trendingChannels.map((chan) => (
              <div key={`trend-${chan.id}`} onClick={() => { changeMainChannel(chan); setActiveTab("livetv"); }}
                className="bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 hover:border-cyan-500/30 p-3 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center group">
                <div className="h-10 w-10 bg-slate-900/50 rounded-xl border border-slate-700/30 flex items-center justify-center overflow-hidden mb-2">
                  {chan.logo ? (
                    <img src={chan.logo} alt={chan.name} referrerPolicy="no-referrer" loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} className="h-8 w-8 object-contain" />
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
  );
}

const HomeTab = memo(HomeTabInner);
export default HomeTab;
