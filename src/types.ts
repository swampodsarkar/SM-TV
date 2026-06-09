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

