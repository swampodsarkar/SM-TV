import React, { memo } from "react";
import { motion } from "motion/react";
import { Channel } from "../types";
import { Language, t } from "../translations";
import { History, Trash2, X, Tv } from "../icons";

interface HistoryTabProps {
  appLang: Language;
  historyList: { channelId: string; watchedAt: number; progress: number }[];
  channels: Channel[];
  changeMainChannel: (channel: Channel) => void;
  setActiveTab: (tab: "home" | "livetv" | "history" | "profile") => void;
  triggerToast: (msg: string) => void;
  clearHistory: () => void;
}

function HistoryTabInner({
  appLang, historyList, channels, changeMainChannel, setActiveTab, triggerToast, clearHistory
}: HistoryTabProps) {
  return (
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
                clearHistory();
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
                        <img src={targetC.logo} alt={targetC.name} loading="lazy"
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

const HistoryTab = memo(HistoryTabInner);
export default HistoryTab;
