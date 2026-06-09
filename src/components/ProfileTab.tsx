import React, { memo } from "react";
import { motion } from "motion/react";
import { TabProps, Channel } from "../types";
import { t } from "../translations";
import { History, Play, Radio, Sun, Globe, Trash2, Tv } from "../icons";

function ProfileTabInner(props: TabProps) {
  const {
    appLang, channels, historyList, changeMainChannel, setActiveTab,
    playerEngine, accentColor, triggerToast, latencyResult,
  } = props;

  return (
    <motion.div
      key="profile-workspace"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex flex-col gap-5 px-3 pt-3 text-left max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800/50">
        <div className="h-16 w-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <svg className="h-8 w-8 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
                    {chan.logo ? <img src={chan.logo} alt="" loading="lazy" className="h-7 w-7 object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} /> : <Tv className="h-4 w-4 text-slate-600" />}
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
          <svg className="h-4 w-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="9" y1="21" x2="9" y2="8"/><line x1="14" y1="21" x2="14" y2="11"/><line x1="19" y1="21" x2="19" y2="4"/></svg>
          <span>Quick Settings</span>
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setActiveTab("settings")} className="p-3 bg-slate-950/40 rounded-2xl border border-slate-800/30 hover:border-cyan-500/30 transition-all text-left cursor-pointer">
            <Sun className="h-4 w-4 text-cyan-400 mb-1.5" />
            <p className="text-[10px] font-bold text-slate-300">Theme</p>
            <p className="text-[8px] text-slate-500 capitalize">{accentColor}</p>
          </button>
          <button onClick={() => setActiveTab("settings")} className="p-3 bg-slate-950/40 rounded-2xl border border-slate-800/30 hover:border-cyan-500/30 transition-all text-left cursor-pointer">
            <Radio className="h-4 w-4 text-cyan-400 mb-1.5" />
            <p className="text-[10px] font-bold text-slate-300">Player</p>
            <p className="text-[8px] text-slate-500">{playerEngine}</p>
          </button>
          <button onClick={() => setActiveTab("settings")} className="p-3 bg-slate-950/40 rounded-2xl border border-slate-800/30 hover:border-cyan-500/30 transition-all text-left cursor-pointer">
            <Globe className="h-4 w-4 text-cyan-400 mb-1.5" />
            <p className="text-[10px] font-bold text-slate-300">Language</p>
            <p className="text-[8px] text-slate-500">{appLang === "en" ? "English" : "বাংলা"}</p>
          </button>
          <button onClick={() => { if (confirm("Reset all?")) { localStorage.clear(); window.location.reload(); } }} className="p-3 bg-slate-950/40 rounded-2xl border border-rose-900/30 hover:border-rose-500/30 transition-all text-left cursor-pointer">
            <Trash2 className="h-4 w-4 text-rose-400 mb-1.5" />
            <p className="text-[10px] font-bold text-slate-300">Reset All</p>
            <p className="text-[8px] text-slate-500">Clear data</p>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const ProfileTab = memo(ProfileTabInner);
export default ProfileTab;
