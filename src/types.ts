import { Language } from "./translations";

export interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  tvgId: string;
  healthy: boolean;
  latencyMs: number | null;
}

export interface LiveEvent {
  id: string;
  type: "cricket" | "football" | "other";
  team1: string;
  team1Flag?: string;
  team1FlagUrl?: string;
  team2: string;
  team2Flag?: string;
  team2FlagUrl?: string;
  score1: string;
  score2: string;
  status: "live" | "upcoming" | "finished";
  statusText: string;
  tournament: string;
  channelId?: string;
  channelIds?: string[];
  startTime?: number;
}

export interface HistoryItem {
  channelId: string;
  watchedAt: number;
  progress: number;
}

export interface TabProps {
  appLang: Language;
  channels: Channel[];
  liveEvents: LiveEvent[];
  selectedChannel: Channel | null;
  filteredChannels: Channel[];
  favorites: string[];
  historyList: HistoryItem[];
  activeCategory: string;
  searchInput: string;
  playerEngine: "NativeHLS" | "VLC" | "HlsJS";
  bufferSize: "low" | "medium" | "high";
  autoPlay: boolean;
  accentColor: string;
  customM3UPaste: string;
  offlineCacheEnabled: boolean;
  isLoading: boolean;
  errorStatus: string | null;
  hoveredChannel: string | null;
  tvMode: boolean;
  multiScreenActive: boolean;
  multiScreenCount: 2 | 4;
  selectedGridChannels: (Channel | null)[];
  activeGridIndex: number;
  sportsFilter: string;
  matchFilter: string;
  setActiveTab: (tab: "home" | "livetv" | "history" | "profile" | "settings") => void;
  setActiveCategory: (cat: string) => void;
  setSearchInput: (val: string) => void;
  setSelectedChannel: (ch: Channel | null) => void;
  setMultiScreenActive: (v: boolean) => void;
  setMultiScreenCount: (v: 2 | 4) => void;
  setSelectedGridChannels: (v: (Channel | null)[]) => void;
  setActiveGridIndex: (v: number) => void;
  setSportsFilter: (v: string) => void;
  setMatchFilter: (v: string) => void;
  setHoveredChannel: (v: string | null) => void;
  changeMainChannel: (ch: Channel) => void;
  handlePrevChannel: () => void;
  handleNextChannel: () => void;
  toggleFavorite: (id: string) => void;
  addToHistory: (id: string) => void;
  fetchChannels: () => Promise<void>;
  triggerToast: (msg: string) => void;
  scrollToActiveChannel: (id: string) => void;
  clearHistory: () => void;
  updateEngineConfig: (engine: "NativeHLS" | "VLC" | "HlsJS") => void;
  updateBufferConfig: (mode: "low" | "medium" | "high") => void;
  updateAutoPlayConfig: (v: boolean) => void;
  updateAccentColor: (v: string) => void;
  handleUpdateM3UText: (v: string) => void;
  triggerImportCustomPlaylist: () => void;
  selectGridChannel: (idx: number, ch: Channel) => void;
  clearGridSlot: (idx: number) => void;
  setPickerChannels: (v: Channel[] | null) => void;
  updateLanguage: (lang: Language) => void;
}



