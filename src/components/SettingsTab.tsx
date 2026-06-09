import React, { memo } from "react";
import { motion } from "motion/react";
import { TabProps } from "../types";
import { t } from "../translations";
import { Globe, Sun, Radio, SlidersHorizontal, FolderPlus, Plus, Trash2 } from "../icons";

function SettingsTabInner({
  appLang, accentColor, playerEngine, bufferSize, autoPlay, offlineCacheEnabled,
  customM3UPaste, fetchChannels,
  updateAccentColor, updateEngineConfig, updateBufferConfig, updateAutoPlayConfig,
  handleUpdateM3UText, triggerImportCustomPlaylist, triggerToast, updateLanguage,
}: TabProps) {
  return (
    <motion.div
      key="settings-workspace"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="max-w-2xl mx-auto flex flex-col gap-6 text-left"
    >
      <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-6 shadow-xl">
        <h4 className="font-bold text-xs text-slate-350 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-cyan-400" />
          <span>{t(appLang, "settings.language")}</span>
        </h4>
        <div className="flex gap-2.5">
          {(["en", "bn"] as const).map((lang) => (
            <button key={lang} onClick={() => updateLanguage(lang)}
              className={`flex-1 p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold ${
                appLang === lang ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-950/60 border-slate-850 hover:border-slate-800 text-slate-300"
              }`}>
              <span className="text-sm">{lang === "en" ? "🇬🇧" : "🇧🇩"}</span>
              <p className="text-xs mt-1">{t(appLang, lang === "en" ? "settings.language.en" : "settings.language.bn")}</p>
            </button>
          ))}
        </div>
      </div>

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
            <button key={theme.key} onClick={() => updateAccentColor(theme.key)}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                accentColor === theme.key ? "border-cyan-500 bg-slate-950" : "bg-slate-950/60 border-slate-850 hover:border-slate-800"
              }`}>
              <span className={`h-4 w-4 rounded-full ${theme.hex}`} />
              <span className="text-[10px] font-bold text-slate-300 tracking-tight">{theme.title}</span>
            </button>
          ))}
        </div>
      </div>

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
            <button key={engine.key} onClick={() => updateEngineConfig(engine.key as any)}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                playerEngine === engine.key ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-950/60 border-slate-850 hover:bg-slate-950"
              }`}>
              <p className="text-[11px] font-black tracking-normal uppercase">{engine.title}</p>
              <p className="text-[8.5px] text-slate-500 mt-1 font-sans leading-tight">{engine.desc}</p>
            </button>
          ))}
        </div>
      </div>

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
            <button key={b.key} onClick={() => updateBufferConfig(b.key as any)}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                bufferSize === b.key ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-950/60 border-slate-850 hover:bg-slate-950"
              }`}>
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
            <button onClick={() => updateAutoPlayConfig(!autoPlay)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                autoPlay ? "bg-cyan-500" : "bg-slate-800"
              }`}>
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow transition duration-200 ${
                autoPlay ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs font-extrabold text-slate-200">{t(appLang, "settings.offline")}</p>
              <p className="text-[9.5px] text-slate-500 mt-0.5">{t(appLang, "settings.offline.desc")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-6 shadow-xl">
        <h4 className="font-bold text-xs text-slate-300 uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <FolderPlus className="h-4 w-4 text-cyan-400" />
          <span>{t(appLang, "settings.custom.m3u")}</span>
        </h4>
        <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">{t(appLang, "settings.custom.m3u.desc")}</p>
        <textarea rows={4} value={customM3UPaste} onChange={(e) => handleUpdateM3UText(e.target.value)}
          placeholder="#EXTM3U&#13;#EXTINF:-1 tvg-logo='...' group-title='Sports',Channel&#13;https://..."
          className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-3.5 text-xs font-mono text-slate-350 outline-none focus:border-cyan-500 transition-colors leading-relaxed placeholder:text-slate-700"
        />
        <div className="flex gap-3 justify-end mt-3">
          {customM3UPaste && (
            <button onClick={() => { handleUpdateM3UText(""); triggerToast(t(appLang, "settings.custom.clear")); }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl border border-slate-800">
              {t(appLang, "settings.custom.clear")}
            </button>
          )}
          <button onClick={triggerImportCustomPlaylist}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 font-black text-xs rounded-xl hover:scale-103 transition-all flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>{t(appLang, "settings.custom.import")}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const SettingsTab = memo(SettingsTabInner);
export default SettingsTab;
