import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, remove, get, child } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCfwz5irJzMy1UGzVhqb4rmqL4z-jeeJzA",
  authDomain: "minerx-market.firebaseapp.com",
  databaseURL: "https://minerx-market-default-rtdb.firebaseio.com",
  projectId: "minerx-market",
  storageBucket: "minerx-market.firebasestorage.app",
  messagingSenderId: "1080849676320",
  appId: "1:1080849676320:web:1faa3502ad7899c6192445",
  measurementId: "G-E0SGPXWBQ4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Auto sign-in anonymously for security
signInAnonymously(auth).catch(() => {});

export interface FirebaseEvent {
  id: string;
  type: "cricket" | "football" | "other";
  team1: string;
  team1Flag: string;
  team1FlagUrl?: string;
  team2: string;
  team2Flag: string;
  team2FlagUrl?: string;
  score1: string;
  score2: string;
  status: "live" | "upcoming" | "finished";
  statusText: string;
  tournament: string;
  channelId?: string;
  channelIds?: string[];
  startTime?: number;
  createdAt?: number;
}

export interface GuestProfile {
  uid: string;
  name: string;
  history: { channelId: string; channelName: string; watchedAt: number }[];
  theme: string;
  playerEngine: string;
  bufferMode: string;
  autoPlay: boolean;
  accentColor: string;
}

function getGuestId(): string {
  let id = localStorage.getItem("guest_id");
  if (!id) {
    id = "guest_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem("guest_id", id);
  }
  return id;
}

// Events
export function listenEvents(callback: (events: FirebaseEvent[]) => void) {
  const eventsRef = ref(db, "events");
  const unsub = onValue(eventsRef, (snap) => {
    const val = snap.val();
    if (!val) { callback([]); return; }
    const list = Object.entries(val).map(([key, e]: [string, any]) => ({ id: key, ...e }));
    callback(list);
  });
  return unsub;
}

export async function addEvent(event: Omit<FirebaseEvent, "id" | "createdAt">) {
  const eventsRef = ref(db, "events");
  const newRef = push(eventsRef);
  await set(newRef, { ...event, createdAt: Date.now() });
  return newRef.key;
}

export async function removeEvent(eventId: string) {
  await remove(ref(db, `events/${eventId}`));
}

export async function updateEvent(eventId: string, event: Partial<Omit<FirebaseEvent, "id" | "createdAt">>) {
  await set(ref(db, `events/${eventId}`), { ...event, updatedAt: Date.now() });
}

// Guest Profile
export async function saveGuestPreferences(prefs: Partial<GuestProfile>) {
  const uid = getGuestId();
  await set(ref(db, `guests/${uid}`), { ...prefs, uid, updatedAt: Date.now() });
}

export async function getGuestProfile(): Promise<GuestProfile | null> {
  const uid = getGuestId();
  const snap = await get(child(ref(db), `guests/${uid}`));
  return snap.val();
}

export function listenGuestProfile(callback: (profile: GuestProfile | null) => void) {
  const uid = getGuestId();
  const unsub = onValue(ref(db, `guests/${uid}`), (snap) => callback(snap.val()));
  return unsub;
}

export async function addHistoryEntry(entry: { channelId: string; channelName: string }) {
  const uid = getGuestId();
  const historyRef = ref(db, `guests/${uid}/history`);
  const newRef = push(historyRef);
  await set(newRef, { ...entry, watchedAt: Date.now() });
}

export { db, auth };
