# SM TV — সম্পূর্ণ ডকুমেন্টেশন (বাংলা)

## প্রকল্প ওভারভিউ

SM TV একটি **লাইভ IPTV ও স্পোর্টস স্ট্রিমিং** ওয়েব অ্যাপ্লিকেশন। এটি React 19, Vite 6, TypeScript 5.8 এবং Tailwind CSS v4 দিয়ে তৈরি। ব্যাকএন্ড হিসেবে একটি Express.js সার্ভার ব্যবহার করা হয়েছে যা M3U প্লেলিস্ট থেকে চ্যানেল লোড করে এবং হেলথ চেক করে।

**লাইভ সাইট:** https://sm-tv.vercel.app  
**গিটহাব:** https://github.com/swampodsarkar/SM-TV.git  
**পোর্ট:** 3000

---

## ১. সব ফিচার (সম্পূর্ণ তালিকা)

### ১.১ কোর স্ট্রিমিং ফিচার
| ফিচার | বর্ণনা |
|---|---|
| **লাইভ IPTV চ্যানেল** | M3U প্লেলিস্ট থেকে HLS (m3u8) স্ট্রিম চালানো |
| **ভিডিও প্লেয়ার** | HLS.js দিয়ে তৈরি ফুল ফিচার্ড প্লেয়ার (পজ, প্লে, ভলিউম, ফুলস্ক্রিন, PiP) |
| **চ্যানেল ডিরেক্টরি** | সব চ্যানেলের তালিকা, ক্যাটাগরি অনুযায়ী ফিল্টার |
| **চ্যানেল সার্চ** | নাম বা গ্রুপ অনুযায়ী সার্চ |
| **চ্যানেল নেভিগেশন** | Pre/Next বাটন, চ্যানেল ড্রয়ার, গ্রুপ ব্রাউজিং |
| **মাল্টি-স্ক্রিন** | একসাথে ২ বা ৪ টি চ্যানেল দেখার সুবিধা (সাইড-বাই-সাইড) |
| **মিনি প্লেয়ার** | অন্য ট্যাবে গেলেও ছোট প্লেয়ারে ভিডিও চালতে থাকে |
| **অটো-প্লে** | চ্যানেল সিলেক্ট করলেই সাথে সাথে চালু হয় |
| **ব্রাইটনেস স্লাইডার** | ভিডিও ওভারলেয়ের উজ্জ্বলতা কন্ট্রোল |
| **অ্যাসপেক্ট রেশিও** | Fit, Zoom, Stretch — তিনটি মোড |
| **কোয়ালিটি সিলেক্টর** | Auto, 1080p, 720p, 480p, 360p, 240p |
| **রিফ্রেশ স্ট্রিম** | স্ট্রিম রিইনিশিয়ালাইজ করুন |
| **শেয়ার** | নেটিভ Web Share API (ফলব্যাক: ক্লিপবোর্ডে কপি) |
| **স্ক্রিন লক** | প্লেয়ার কন্ট্রোল লক করুন (ট্যাপ করে আনলক) |
| **স্লিপ টাইমার** | ১৫/৩০/৪৫/৬০ মিনিট পর অটো-পজ |
| **স্ক্রিন রোটেশন** | মোবাইলে ল্যান্ডস্কেপ লক/আনলক |
| **কাস্ট সিমুলেশন** | নকল Chromecast/Anycast ডিভাইস পিকার |
| **বাফার কনফিগারেশন** | Low (5MB), Medium (20MB), High (40MB) |
| **প্লেয়ার ইঞ্জিন** | Hls.js, Native HLS, VLC (সিমুলেটেড) |
| **অটো-রিকানেক্ট** | স্ট্রিম ব্যর্থ হলে ২ বার রিট্রাই, তারপর পরবর্তী চ্যানেল |
| **ওয়াচডগ টাইমার** | ৫ সেকেন্ড লোড টাইমআউট → রিকানেক্ট |
| **ব্যাকগ্রাউন্ড অডিও** | ট্যাব হিড থাকলেও অডিও চালতে থাকে |

### ১.২ সার্চ ও ডিসকভারি
| ফিচার | বর্ণনা |
|---|---|
| **টেক্সট সার্চ** | চ্যানেলের নাম বা গ্রুপ অনুযায়ী সার্চ |
| **ভয়েস সার্চ** | Web Speech API (বাংলা bn-BD) — অ্যানিমেটেড ওয়েভফর্ম UI |
| **ক্যাটাগরি ফিল্টার** | All Channels, News & Info, Sports Live, Movies, Kids, Music, Religious |
| **স্পোর্টস ফিল্টার** | All, Football, Cricket, Tennis, Motorsport, Other |
| **ম্যাচ স্ট্যাটাস ফিল্টার** | All, Live, Recent, Upcoming |

### ১.৩ হোম ট্যাব (স্পোর্টস ড্যাশবোর্ড)
| ফিচার | বর্ণনা |
|---|---|
| **লাইভ ইভেন্টস** | Firebase থেকে লাইভ/আপকামিং ম্যাচ দেখায় |
| **ইভেন্ট কার্ড** | টিম নাম, ফ্ল্যাগ, স্কোর, স্ট্যাটাস ব্যাজ, কাউন্টডাউন |
| **Watch Live বাটন** | লাইভ ইভেন্ট থেকে সরাসরি চ্যানেলে যাওয়া |
| **ট্রেন্ডিং চ্যানেল** | জনপ্রিয় চ্যানেলের গ্রিড |
| **FIFA World Cup ইভেন্টস** | ১২ টি ডিফল্ট হার্ডকোডেড ইভেন্ট |

### ১.৪ ফেবারিট
- চ্যানেলের পাশে ⭐ বাটন
- localStorage-এ সেভ হয় (`toffee_favorites`)
- অ্যাড/রিমুভে টোস্ট নোটিফিকেশন

### ১.৫ ওয়াচ হিস্ট্রি
- প্রতি চ্যানেল সিলেক্টে অটো-রেকর্ড
- প্রগ্রেস ট্র্যাকিং (সিমুলেটেড ২০-৮০%)
- সর্বোচ্চ ২০ টি এন্ট্রি
- Clear All বাটন (কনফার্মেশন সহ)
- localStorage-এ সেভ (`toffee_history`)

### ১.৬ প্রোফাইল ট্যাব
- গেস্ট ইউজার ডিসপ্লে (ট্রাঙ্কেটেড UID)
- পরিসংখ্যান: দেখা চ্যানেল সংখ্যা, লেটেন্সি (ms)
- সম্প্রতি দেখা চ্যানেল (সর্বশেষ ৫ টি)
- কুইক সেটিংস: থিম, প্লেয়ার, ল্যাঙ্গুয়েজ, রিসেট

### ১.৭ সেটিংস ট্যাব
- **ভাষা:** ইংরেজি / বাংলা
- **অ্যাকসেন্ট থিম:** Cyan, Emerald, Teal, Rose
- **প্লেয়ার ইঞ্জিন:** Hls.js, Native HLS, VLC
- **বাফার:** Low / Medium / High
- **অটো-প্লে:** টগল
- **কাস্টম M3U প্লেলিস্ট:** পেস্ট করে ইম্পোর্ট
- **রিসেট ইউজার ডাটা:** localStorage ক্লিয়ার + রিলোড

### ১.৮ অ্যাডমিন প্যানেল
- **লুকানো অ্যাডমিন লগইন:** লোগোতে ৭ বার ট্যাপ করুন
- **ক্রিডেনশিয়াল:** `mdswampodsarkar@gmail.com` / `123456`
- **লাইভ ইভেন্ট CRUD:** Firebase-এ ইভেন্ট অ্যাড/এডিট/ডিলিট
- **imgBB ফ্লাগ আপলোড:** ইমেজ আপলোড করে Firebase-এ URL সেভ
- **চ্যানেল পিকার:** কোন চ্যানেলে ইভেন্ট লিংক হবে
- **স্ট্যান্ডঅ্যালোন admin.html:** আলাদা পেজ (৫০৮ লাইন)

### ১.৯ নিরাপত্তা (Security)
| ফিচার | বর্ণনা |
|---|---|
| **DevTools ডিটেকশন** | `console.log()` ট্র্যাপ — ডিভ টুলস খুললেই পেজ ওভাররাইট |
| **কিবোর্ড ব্লকিং** | F12, Ctrl+Shift+I/J/C, Ctrl+U ব্লক |
| **কন্টেক্সট মেনু ডিসেবল** | `oncontextmenu="return false"` |
| **কপি/পেস্ট/কাট/সিলেক্ট ডিসেবল** | JavaScript দিয়ে ব্লক |
| **security.ts** | RegExp.toString ওভাররাইড, periodic console.clear, isCompromised() |
| **Obfuscation** | vite-plugin-javascript-obfuscator + Terser মিনিফিকেশন |
| **selfDefending** | অবফাস্কেটেড কোড মডিফাই করলেই ক্র্যাশ |

### ১.১০ PWA / মোবাইল
- Web App Manifest
- Capacitor Android কনফিগারেশন
- ভিউপোর্ট: `maximum-scale=1.0, user-scalable=no`
- Apple meta ট্যাগ: `apple-mobile-web-app-capable`, `black-translucent`
- GPU অ্যাক্সিলারেশন
- `img[loading="lazy"]` + `content-visibility: auto`

---

## ২. API / এন্ডপয়েন্ট

### লোকাল সার্ভার (Express — পোর্ট 3000)

| এন্ডপয়েন্ট | মেথড | বর্ণনা |
|---|---|---|
| `/api/channels` | GET | M3U থেকে পার্স করা চ্যানেল লিস্ট JSON আকারে রিটার্ন করে |
| `/api/health` | GET | সার্ভার হেলথ স্ট্যাটাস (count, healthyCount) |
| `GET *` | GET | SPA (index.html) সার্ভ করে |

### Vercel Serverless

| এন্ডপয়েন্ট | মেথড | বর্ণনা |
|---|---|---|
| `/api/health` | GET | `{ ok: true, time: Date.now() }` |

### Firebase Realtime Database

| অপারেশন | ফাংশন | বর্ণনা |
|---|---|---|
| ইভেন্ট লিসেন | `listenEvents(cb)` | `/events` নোডে real-time লিসেনার |
| ইভেন্ট অ্যাড | `addEvent(event)` | `/events`-এ push + set |
| ইভেন্ট রিমুভ | `removeEvent(id)` | `/events/{id}` রিমুভ |
| ইভেন্ট আপডেট | `updateEvent(id, data)` | `/events/{id}` আপডেট |
| গেস্ট প্রেফারেন্স সেভ | `saveGuestPreferences(prefs)` | `/guests/{uid}`-এ সেভ |
| গেস্ট প্রোফাইল দেখা | `getGuestProfile()` | `/guests/{uid}` থেকে পড়া |
| গেস্ট লিসেন | `listenGuestProfile(cb)` | `/guests/{uid}`-এ real-time |

### বাহ্যিক API

| সার্ভিস | এন্ডপয়েন্ট | ব্যবহার |
|---|---|---|
| **imgBB** | `https://api.imgbb.com/1/upload` | টিম ফ্লাগ ইমেজ আপলোড |
| **M3U প্লেলিস্ট** | `https://da.gd/VaAUn` | প্রাথমিক চ্যানেল সোর্স |
| **Ad Smart Link** | `https://www.effectivecpmnetwork.com/ftd3iz5bc3?key=2cad8e3a8...` | অ্যাড ওয়ালে খোলে |
| **Ad Script 1** | `https://pl29689400.effectivecpmnetwork.com/.../invoke.js` | বিজ্ঞাপন স্ক্রিপ্ট |
| **Ad Script 2** | `https://pl29689401.effectivecpmnetwork.com/.../d0f3f249...js` | বিজ্ঞাপন স্ক্রিপ্ট |

---

## ৩. ফায়ারবেস কনফিগারেশন

### প্রজেক্ট: `minerx-market`

```javascript
apiKey: "AIzaSyCfwz5irJzMy1UGzVhqb4rmqL4z-jeeJzA"
authDomain: "minerx-market.firebaseapp.com"
databaseURL: "https://minerx-market-default-rtdb.firebaseio.com"
projectId: "minerx-market"
storageBucket: "minerx-market.firebasestorage.app"
messagingSenderId: "1080849676320"
appId: "1:1080849676320:web:1faa3502ad7899c6192445"
measurementId: "G-E0SGPXWBQ4"
```

### ডাটাবেজ স্ট্রাকচার (Realtime Database)
```
/
  events/                        # স্পোর্টস ইভেন্ট
    {eventId}:
      type: "cricket"|"football"|"other"
      team1: string
      team1Flag: string (ইমোজি)
      team1FlagUrl?: string (imgBB URL)
      team2: string
      team2Flag: string (ইমোজি)
      team2FlagUrl?: string (imgBB URL)
      score1: string
      score2: string
      status: "live"|"upcoming"|"finished"
      statusText: string
      tournament: string
      channelId?: string
      channelIds?: string[]
      startTime?: number (epoch ms)
      createdAt?: number
      updatedAt?: number

  guests/                        # গেস্ট ইউজার প্রোফাইল
    {guestUid}:
      uid: string
      name: string
      history: [ { channelId, channelName, watchedAt } ]
      theme: string
      playerEngine: string
      bufferMode: string
      autoPlay: boolean
      accentColor: string
```

### ফায়ারবেস সিকিউরিটি রুলস
- রুট `.read` এবং `.write`: `true` (সম্পূর্ণ ওপেন)
- `/events` নোড ইনডেক্স করা: `status`, `type`, `startTime`

### ডিপেন্ডেন্সি
- `firebase: ^12.14.0` (package.json)
- admin.html-এ: CDN `firebase@11.6.0` (standalone)

---

## ৪. কিভাবে সবকিছু কাজ করে (আর্কিটেকচার)

### ৪.১ টেকনোলজি স্ট্যাক
```
Frontend: React 19 + TypeScript 5.8 + Tailwind CSS v4 + Framer Motion
Build:    Vite 6 + Terser + vite-plugin-javascript-obfuscator
Backend:  Express.js 4 (Node.js)
Database: Firebase Realtime Database
Stream:   HLS.js v1.6.16 (m3u8)
Mobile:   Capacitor 8 (Android)
Deploy:   Vercel
```

### ৪.২ ফাইল স্ট্রাকচার
```
src/
  main.tsx              → এন্ট্রি পয়েন্ট (App + ErrorBoundary + initSecurity)
  App.tsx               → মূল কম্পোনেন্ট (সব state, সব লজিক, ~1100 লাইন)
  firebase.ts           → Firebase init + সব CRUD অপারেশন
  translations.ts       → ইংরেজি/বাংলা অনুবাদ (৩৯২ টি কী)
  types.ts              → TypeScript ইন্টারফেস (Channel, LiveEvent, TabProps)
  security.ts           → DevTools ডিটেকশন, console.clear
  icons.tsx             → ৫৬ টি SVG আইকন কম্পোনেন্ট
  index.css             → Tailwind + কাস্টম স্টাইল
  ErrorBoundary.tsx     → এরর বাউন্ডারি (ক্র্যাশ হ্যান্ডলিং)

  components/
    HomeTab.tsx         → স্পোর্টস ড্যাশবোর্ড
    LiveTVTab.tsx       → ভিডিও প্লেয়ার + চ্যানেল ডিরেক্টরি
    VideoPlayer.tsx     → HLS ভিডিও প্লেয়ার (৭২৪ লাইন)
    SettingsTab.tsx     → সব সেটিংস
    ProfileTab.tsx      → গেস্ট প্রোফাইল
    HistoryTab.tsx      → ওয়াচ হিস্ট্রি
    VirtualList.tsx     → ভার্চুয়াল স্ক্রলিং কম্পোনেন্ট

রুট ফাইল:
  server.ts             → Express সার্ভার (M3U ফেচ, পার্স, হেলথ চেক)
  index.html            → HTML শেল + অ্যাড স্ক্রিপ্ট + সিকিউরিটি
  vite.config.ts        → Vite কনফিগারেশন + Obfuscation
  admin.html            → স্ট্যান্ডঅ্যালোন অ্যাডমিন প্যানেল
  capacitor.config.ts   → Android কনফিগারেশন
  firebase.rules.json   → Firebase রুলস
  vercel.json           → Vercel ডিপ্লয় কনফিগ
  api/health.js         → Vercel সার্ভারলেস হেলথ এন্ডপয়েন্ট
```

### ৪.৩ স্টেট ম্যানেজমেন্ট
- **কোনো বাহ্যিক লাইব্রেরি নেই** — সব state App.tsx-এ `useState`, `useEffect` দিয়ে ম্যানেজ করা হয়েছে
- **Props Drilling:** `TabProps` ইন্টারফেস (৯৬ টি ফিল্ড) সব চাইল্ড কম্পোনেন্টে পাস করা হয়
- **localStorage:** ফেবারিট, হিস্ট্রি, ইঞ্জিন, বাফার, অ্যাকসেন্ট, অটোপ্লে, কাস্টম M3U, ল্যাঙ্গুয়েজ, গেস্ট UID, অ্যাড টাইমস্ট্যাম্প — সব localStorage-এ সেভ হয়
- **Firebase:** লাইভ ইভেন্ট এবং গেস্ট প্রোফাইল Firebase Realtime Database-এ

### ৪.৪ ডাটা ফ্লো (ডেটা কিভাবে প্রবাহিত হয়)
```
১. অ্যাপ স্টার্ট → fetch("/api/channels") → Express সার্ভার M3U ফেচ করে → পার্স করে → JSON রিটার্ন
                                                 ↓ ব্যর্থ হলে
                                          Backup URL থেকে M3U ফেচ → ক্লায়েন্ট-সাইড পার্স
                                                 ↓ আরও
                                          কাস্টম M3U পেস্ট (সেটিংস) → ক্লায়েন্ট-সাইড পার্স
                                                 ↓
                                          সব সোর্স মার্জ → channels state

২. Firebase ইভেন্ট লিসেনার চালু → real-time আপডেট → liveEvents state

৩. ইউজার চ্যানেল সিলেক্ট করে → অ্যাড ওয়াল চেক → doChangeChannel()
                                          → selectedChannel সেট
                                          → ওয়াচ হিস্ট্রি অ্যাড
                                          → হেলথ চেক API কল (লেটেন্সি মাপা)

৪. VideoPlayer কম্পোনেন্ট channel prop পায় → HLS.js ইনিশিয়ালাইজ
                                          → স্ট্রিম চালু
                                          → বাফার মনিটর (requestAnimationFrame)

৫. ইউজার সেটিংস পরিবর্তন করলে → localStorage-এ সেভ
                                          → UI সাথে সাথে আপডেট

৬. ল্যাঙ্গুয়েজ পরিবর্তন করলে → সব UI t(appLang, key) কল করে আপডেট
```

### ৪.৫ কম্পোনেন্ট ট্রি
```
<StrictMode>
  <ErrorBoundary>
    <App>                              ← সব state এখানে
      ├── Splash Screen
      ├── Ad Wall (১৫ সেকেন্ড কাউন্টডাউন)
      ├── হেডার (লোগো, সার্চ, ভয়েস, নেভ)
      ├── Update Banner
      ├── AnimatePresence (ট্যাব স্যুইচ)
      │   ├── Suspense → HomeTab       ← লেজি লোডেড
      │   ├── Suspense → LiveTVTab     ← লেজি লোডেড (VideoPlayer + VirtualList)
      │   ├── Suspense → HistoryTab    ← লেজি লোডেড
      │   ├── Suspense → ProfileTab    ← লেজি লোডেড
      │   └── Suspense → SettingsTab   ← লেজি লোডেড
      ├── মিনি প্লেয়ার (Suspense → VideoPlayer)
      ├── ভয়েস সার্চ মডেল
      ├── টোস্ট নোটিফিকেশন
      ├── সাইডবার (হ্যামবার্গার মেনু)
      ├── বটম নেভ (৫ টি আইটেম)
      └── পিকার মডেল (M3U চ্যানেল সিলেক্ট)
  </ErrorBoundary>
</StrictMode>
```

### ৪.৬ রাউটিং
- **React Router নেই** — `activeTab` state (`"home" | "livetv" | "history" | "profile" | "settings"`) দিয়ে ট্যাব নেভিগেশন
- **AnimatePresence** দিয়ে ট্রানজিশন
- **React.lazy + Suspense** দিয়ে কোড স্প্লিটিং
- বটম নেভ: Live Events (home), Sports (livetv sports), TV (livetv all), History, Profile

### ৪.৭ HLS স্ট্রিমিং সেটআপ
- লাইব্রেরি: `hls.js` v1.6.16
- ইঞ্জিন সিলেক্ট: Hls.js (ডিফল্ট) / Native HLS (Safari) / VLC (সিমুলেটেড)
- মোবাইলের জন্য আলাদা কনফিগ: ছোট বাফার, লম্বা টাইমআউট, ABR প্যারামিটার পরিবর্তন
- কোয়ালিটি সিলেক্টর: Auto/1080p/720p/480p/360p/240p
- অটো-রিকানেক্ট: নেটওয়ার্ক এররে ২ বার রিট্রাই, মিডিয়া এররে রিকভারি
- বাফার মনিটরিং: `requestAnimationFrame` দিয়ে `video.buffered` চেক

---

## ৫. বাহ্যিক সার্ভিস

| সার্ভিস | কী/ইউআরএল | ব্যবহার |
|---|---|---|
| **imgBB** | API Key: `213fd215f712156cc6a6ab529469da2f` | টিম ফ্লাগ ইমেজ আপলোড |
| **Firebase** | প্রোজেক্ট: `minerx-market` | ডাটাবেজ, ইভেন্ট, গেস্ট প্রোফাইল |
| **Gemini AI** | `@google/genai` v2.4.0 | AI ইন্টিগ্রেশন (ঘোষিত) |
| **Effective CPM** | স্মার্ট লিংক + ২ টি অ্যাড স্ক্রিপ্ট | বিজ্ঞাপন মনিটাইজেশন |
| **da.gd** | `https://da.gd/VaAUn` | M3U প্লেলিস্ট হোস্টিং |
| **Web Speech API** | ব্রাউজারের SpeechRecognition | ভয়েস সার্চ (বাংলা bn-BD) |
| **Web Share API** | `navigator.share()` | চ্যানেল শেয়ার |
| **Capacitor** | v8.4.0 | Android নেটিভ র‍্যাপার |

---

## ৬. ট্রান্সলেশন সিস্টেম (অনুবাদ)

**ফাইল:** `src/translations.ts`

- ২ টি ভাষা: ইংরেজি (`en`) এবং বাংলা (`bn`)
- ৩৯২ টি অনুবাদ কী (প্রতি ভাষায় ১৯৬ টি)
- ডট-নোটেশন গ্রুপিং: `app.*`, `nav.*`, `search.*`, `home.*`, `live.*`, `settings.*`, `player.*`, `toast.*`
- `t(appLang, key, params?)` ফাংশন: কী-র ভ্যালু রিটার্ন করে, না পেলে ইংরেজি ফলব্যাক
- `{param}` ইন্টারপোলেশন সাপোর্ট
- localStorage-এ সেভ হয় (`toffee_lang`)

---

## ৭. সার্ভার সেটআপ (server.ts)

### M3U ফেচিং
- উৎস: `https://da.gd/VaAUn`
- Browser-like User-Agent দিয়ে ফেচ
- ১৫ মিনিট ক্যাশ (`cachedChannels`, `lastFetched`)

### হেলথ চেক সিস্টেম
- **ইন-মেমরি ক্যাশ:** `Map<string, HealthResult>`
- **TTL:** ৫ মিনিট
- **ব্যাচ প্রসেসিং:** প্রতি ব্যাচে ৫ টি চ্যানেল, ৫০০ms বিরতি দিয়ে
- **চেক পদ্ধতি:** `Range: bytes=0-200` হেডার দিয়ে HTTP GET, m3u8 মার্কার চেক
- **রাউন্ড-রবিন:** `healthCheckIndex` ক্রমাগত ঘুরতে থাকে

### M3U পার্সিং
- লাইন স্প্লিট → EXTINF হেডার পার্স (tvg-logo, group-title, tvg-id)
- চ্যানেল নাম এক্সট্র্যাক্ট (শেষ কমার পর)
- URL লাইন → চ্যানেল অবজেক্ট
- হেলথ ডাটা মার্জ

---

## ৮. বিল্ড ও ডিপ্লয়

### লোকাল ডেভেলপমেন্ট
```bash
npm install      # ডিপেন্ডেন্সি ইনস্টল
npm run dev      # ডেভ সার্ভার (Vite middleware + Express)
```

### প্রোডাকশন বিল্ড
```bash
npm run build    # Vite build + esbuild server.ts
npm start        # node dist/server.cjs (পোর্ট 3000)
```

### Vercel ডিপ্লয়
```bash
vercel --prod    # Vercel-এ ডিপ্লয় (serverless)
```

### বিল্ড আউটপুট
```
dist/
  index.html
  assets/
    index-{hash}.js      # মেইন bundle (~877 KB, gzip: ~320 KB)
    index-{hash}.css     # স্টাইল (~63 KB)
  server.cjs             # Express সার্ভার
  server.cjs.map         # সোর্স ম্যাপ
```

---

## ৯. অ্যাডমিন প্যানেল ব্যবহার

১. অ্যাপের লোগোতে **৭ বার ট্যাপ** করুন
২. ইউজারনেম: `mdswampodsarkar@gmail.com`, পাসওয়ার্ড: `123456`
৩. ফিচার:
   - নতুন ইভেন্ট অ্যাড করুন (টাইপ, টিম, স্কোর, স্ট্যাটাস, টুর্নামেন্ট)
   - imgBB-তে ফ্লাগ ইমেজ আপলোড করুন
   - ইভেন্টের সাথে চ্যানেল লিংক করুন
   - ইভেন্ট এডিট/ডিলিট করুন
৪. স্ট্যান্ডঅ্যালোন অ্যাডমিন প্যানেল: `admin.html` ফাইলটি সরাসরি ব্রাউজারে খুলুন

---

## ১০. Flutter অ্যাপ

`/sports-tv-app-flutter/` ফোল্ডারে Flutter দিয়ে রি-ইমপ্লিমেন্ট করা আছে।
- State management: Provider (`AppState` extends `ChangeNotifier`)
- প্যাকেজ: `video_player`, `firebase_core`, `firebase_database`, `firebase_auth`, `google_mobile_ads`, `cached_network_image`, `wakelock_plus`, `connectivity_plus`
- একই ফিচার সেট: Home, Live TV, History, Profile, Settings, Admin, Ad Wall
