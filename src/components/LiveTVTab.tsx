import React, { useMemo, useRef, memo } from "react";
import { motion } from "motion/react";
import VideoPlayer from "./VideoPlayer";
import VirtualList from "./VirtualList";
import { TabProps, Channel } from "../types";
import { t } from "../translations";
import { Grid, Search, AlertCircle, Activity, RefreshCw, Radio, Star, Tv, X, Layers, Plus } from "../icons";

const categoriesList = [
  "All Channels", "News & Info", "Sports Live", "Movies Channel",
  "Kids TV", "Music Beat", "Religious"
];

function LiveTVTabInner({
  selectedChannel, channels, filteredChannels, favorites, historyList,
  activeCategory, searchInput, playerEngine, bufferSize, autoPlay, appLang,
  isLoading, errorStatus, tvMode,
  multiScreenActive, multiScreenCount, selectedGridChannels, activeGridIndex,
  setActiveCategory, setSearchInput, setSelectedChannel,
  changeMainChannel, toggleFavorite, addToHistory,
  handlePrevChannel, handleNextChannel,
  fetchChannels, scrollToActiveChannel, triggerToast,
  setMultiScreenActive, setMultiScreenCount, setSelectedGridChannels,
  setActiveGridIndex, selectGridChannel, clearGridSlot,
  setHoveredChannel, hoveredChannel,
}: TabProps) {
  const channelListRef = useRef<HTMLDivElement | null>(null);

  const showSearch = searchInput.trim().length > 0;
  const hasChannels = !isLoading && !errorStatus && filteredChannels.length > 0;

  const handleChannelClick = (chan: Channel) => {
    if (multiScreenActive) {
      selectGridChannel(activeGridIndex, chan);
    } else {
      changeMainChannel(chan);
    }
  };

  const renderChannelRow = (chan: Channel, idx: number) => {
    const isSelected = selectedChannel?.id === chan.id;
    const isSelectedInMulti = multiScreenActive && selectedGridChannels[activeGridIndex]?.id === chan.id;

    return (
      <div
        id={`channel-row-${chan.id}`}
        onClick={() => handleChannelClick(chan)}
        className={`flex items-center justify-between p-2.5 rounded-2xl transition-all leading-snug border cursor-pointer relative group ${
          (isSelected && !multiScreenActive) || isSelectedInMulti
            ? "bg-slate-900 border-cyan-500 text-white shadow-md"
            : "bg-slate-950/50 hover:bg-slate-900/60 border-slate-900 text-slate-450 hover:text-slate-100 hover:border-slate-800"
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden flex-grow mr-2">
          <div className="flex-shrink-0 text-[10px] font-mono text-slate-500 w-5 text-right font-bold">
            {isSelected && !multiScreenActive ? (
              <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse ml-auto" />
            ) : (
              `#${idx + 1}`
            )}
          </div>
          <div className="h-9 w-9 bg-slate-950 border border-slate-850/80 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative group-hover:border-slate-700 transition-colors">
            {chan.logo ? (
              <>
                <img src={chan.logo} alt={chan.name} referrerPolicy="no-referrer" loading="lazy"
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
          <div className="overflow-hidden min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                chan.healthy === false ? "bg-red-500" :
                chan.latencyMs !== null && chan.latencyMs > 3000 ? "bg-yellow-500" : "bg-emerald-500"
              }`} />
              <p className={`font-bold text-xs truncate leading-normal ${isSelected && !multiScreenActive ? "text-cyan-400" : "text-slate-200"}`}>
                {chan.name}
              </p>
            </div>
            <span className="inline-block text-[9px] text-slate-500 font-bold px-1.5 py-0.2 bg-slate-950 border border-slate-900 rounded uppercase font-mono mt-0.5">
              {chan.group || "IPTV CONNECT"}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(chan.id); }}
          className={`p-2 rounded-xl hover:bg-slate-950 transition-colors cursor-pointer ${
            favorites.includes(chan.id) ? "text-amber-400" : "text-slate-650 hover:text-slate-450"
          }`}
        >
          <Star className="h-3.5 w-3.5" fill={favorites.includes(chan.id) ? "currentColor" : "none"} />
        </button>
      </div>
    );
  };

  return (
    <motion.div
      key="player-workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-4 px-3 pt-3"
    >
      <div className="flex flex-col lg:flex-row gap-4">
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
                      <div key={`grid-slot-${idx}`} onClick={() => setActiveGridIndex(idx)}
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
              </div>
            ) : (
              <VideoPlayer channel={selectedChannel} onPrevChannel={handlePrevChannel}
                onNextChannel={handleNextChannel} autoPlay={autoPlay}
                bufferMode={bufferSize} playerEngine={playerEngine} language={appLang}
                channels={channels} recentChannelIds={historyList.map(h => h.channelId)}
                onChannelSelect={setSelectedChannel} onToggleFavorite={toggleFavorite}
                isFavorite={selectedChannel ? favorites.includes(selectedChannel.id) : false}
                onAddToHistory={addToHistory} />
            )}
          </section>
        )}

        <section className={`flex flex-col gap-4 bg-slate-900/40 backdrop-blur-xl border border-slate-900 rounded-3xl p-4 shadow-xl min-h-[500px] ${selectedChannel ? "lg:w-2/5" : "w-full"}`}>
          <div id="container-746233a5c9d232e44637fa5f647e4c59"></div>

          <div className="flex flex-col gap-3 pb-3 border-b border-slate-850/65">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm tracking-wide text-left flex items-center gap-1.5 text-white">
                <Grid className="h-4 w-4 text-cyan-400" />
                {t(appLang, "live.directory", { count: filteredChannels.length })}
              </span>
              <button onClick={() => {
                const state = !multiScreenActive;
                setMultiScreenActive(state);
                if (state) setSelectedGridChannels([selectedChannel, null, null, null]);
              }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                  multiScreenActive ? "bg-cyan-500/10 border-cyan-400 text-cyan-400" : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                }`}>
                <Layers className="h-3.5 w-3.5 animate-pulse" />
                <span>Arena Multi-Screen</span>
              </button>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                <Search className="h-4 w-4" />
              </span>
              <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t(appLang, "search.placeholder.short")}
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-cyan-500 text-slate-200 text-xs px-3.5 py-2.5 pl-9 rounded-xl outline-none transition-all placeholder:text-slate-620"
              />
              {searchInput && (
                <button onClick={() => setSearchInput("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-500 hover:text-slate-200">
                  {t(appLang, "search.clear")}
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 min-h-[36px] no-scrollbar">
            {categoriesList.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-xl text-[10.5px] font-bold cursor-pointer transition-all border outline-none text-center flex-shrink-0 ${
                  activeCategory === cat
                    ? "bg-cyan-500 border-cyan-400 text-slate-950 font-extrabold shadow-sm"
                    : "bg-slate-950/60 border-slate-850 text-slate-450 hover:text-slate-200 hover:border-slate-800"
                }`}>{cat}</button>
            ))}
          </div>

          <div ref={channelListRef}
            className="flex-grow flex flex-col h-[380px] lg:h-[460px] pr-1 gap-2 no-scrollbar text-left"
            style={{ overflowY: "auto" }}
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
                <button onClick={fetchChannels}
                  className="mt-4 px-4 py-1.5 bg-slate-850 hover:bg-slate-750 text-slate-200 text-xs rounded-lg font-bold border border-slate-750 cursor-pointer">
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

            {hasChannels && (
              <VirtualList
                items={filteredChannels}
                itemHeight={62}
                overscan={3}
                renderItem={renderChannelRow}
                className="no-scrollbar"
                style={{ overflowY: "auto", flex: 1 }}
              />
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

const LiveTVTab = memo(LiveTVTabInner);
export default LiveTVTab;
