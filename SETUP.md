# 3D Streets — Web PWA Setup Guide
React + Mapbox GL JS + Claude AI  
Works on iOS Safari, Android Chrome, and desktop browsers.

---

## What's Included (26 files)

```
3dstreets-web/
├── src/
│   ├── App.jsx / App.module.css       ← Root, settings sheet
│   ├── main.jsx                        ← React entry point
│   ├── store/appStore.js               ← Zustand global state
│   ├── hooks/useLocation.js            ← GPS tracking hook
│   ├── services/
│   │   ├── anthropicService.js         ← Claude AI client (calls /api/ai)
│   │   ├── mapboxService.js            ← Directions, routing, map-matching
│   │   └── googlePlacesService.js      ← Search, autocomplete, nearby POI
│   ├── styles/design-system.css        ← Full design token system
│   └── components/
│       ├── Map/MapView.jsx             ← 3D Mapbox map + layers
│       ├── AI/AICopilot.jsx            ← Conversational co-pilot
│       ├── Sketch/SketchOverlay.jsx    ← Draw-your-route canvas
│       ├── Navigation/
│       │   ├── NavigationHUD.jsx       ← Live turn-by-turn HUD
│       │   └── RoutePreviewPanel.jsx   ← Pre-nav route picker
│       ├── Search/SearchBar.jsx        ← AI-enhanced search
│       ├── POI/POIPanel.jsx            ← Proximity-sorted places
│       └── Controls/MapControls.jsx    ← Floating map buttons
├── index.html                          ← PWA meta + font imports
├── vite.config.js                      ← Vite + PWA plugin
├── package.json
└── .env.example                        ← API key template
```

---

## Step 1 — Prerequisites

- **Node.js 18+** — https://nodejs.org
- **npm** (comes with Node)
- A code editor (VS Code recommended)

---

## Step 2 — Install Dependencies

```bash
cd 3dstreets-web
npm install
```

This installs: React 18, Mapbox GL JS, Zustand, Framer Motion, Lucide React, Vite, and the PWA plugin.

---

## Step 3 — Add Your API Keys

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```
# Browser-safe public keys (bundled into the client)
VITE_MAPBOX_TOKEN=pk.your_mapbox_token
VITE_GOOGLE_MAPS_KEY=your_google_maps_key

# Server-only — set in Vercel, NOT here with a VITE_ prefix
ANTHROPIC_API_KEY=sk-ant-your_key
```

> ⚠️ The Anthropic key must **never** get a `VITE_` prefix — anything prefixed
> `VITE_` is bundled into the browser and publicly readable. Claude is called
> through the server-side `/api/ai` function, so `ANTHROPIC_API_KEY` belongs in
> the Vercel dashboard (Settings → Environment Variables), not the client bundle.

### Get your Mapbox token (free):
1. Go to https://account.mapbox.com
2. Create account → "Access Tokens" → copy the **default public token**
3. It starts with `pk.`

### Get your Google Maps key:
1. Go to https://console.cloud.google.com → APIs & Services
2. Enable **Places API (New)** and **Maps JavaScript API**
3. Credentials → Create credentials → API key
4. **Restrict the key** (see below) — it ships in the browser bundle

> 🔒 Because `VITE_GOOGLE_MAPS_KEY` is visible in the client, lock it down in
> Cloud Console: an **Application restriction** (HTTP referrers = your deployed
> domain) **and** an **API restriction** (only the Places/Maps APIs you use).
> An unrestricted key can be lifted from your site and billed against.

### Get your Anthropic key:
1. Go to https://console.anthropic.com
2. API Keys → Create key
3. Starts with `sk-ant-` — set it as `ANTHROPIC_API_KEY` in Vercel

---

## Step 4 — Run Locally

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

For mobile testing on your phone, your phone and computer must be on the **same WiFi**. Vite will print a network URL like `http://192.168.x.x:3000` — open that on your phone.

> ⚠️ GPS only works on HTTPS or localhost. For real device testing, use the deploy step below.

---

## Step 5 — Deploy (Free, takes 2 minutes)

### Vercel (recommended):
```bash
npm install -g vercel
vercel
```
- When asked for project name: `3dstreets`
- It will give you a live HTTPS URL
- Add your env vars in Vercel dashboard → Settings → Environment Variables

### Netlify:
```bash
npm run build
# Drag the dist/ folder to netlify.com/drop
```

---

## Step 6 — Install as App on Phone

Once deployed to HTTPS:

**iPhone (iOS Safari):**
1. Open your URL in Safari
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add" — it installs like a native app ✅

**Android (Chrome):**
1. Open your URL in Chrome
2. Tap the 3-dot menu
3. Tap "Add to Home screen" or "Install app"
4. Confirm — full screen, no browser chrome ✅

---

## Features Live in Phase 1

| Feature | Status |
|---|---|
| 3D map with buildings + terrain | ✅ |
| Dark / Streets / Satellite / Terrain / Nav styles | ✅ |
| GPS location tracking + heading puck | ✅ |
| AI Co-pilot (Claude) — chat, find places, change routes | ✅ |
| Sketch-a-route with AI road snapping | ✅ |
| Turn-by-turn navigation HUD | ✅ |
| Speed display + limit badge | ✅ |
| No-surprise reroute (confirm banner only) | ✅ |
| Route options (fastest, scenic, no highways, no tolls) | ✅ |
| POI search — proximity sorted, closest first | ✅ |
| Add stops / waypoints during navigation | ✅ |
| PWA — installs to home screen, full screen | ✅ |
| Offline map tile caching | ✅ |

---

## Common Issues

| Problem | Fix |
|---|---|
| Map won't load | Check `VITE_MAPBOX_TOKEN` in .env — must start with `pk.` |
| AI not responding | Check `ANTHROPIC_API_KEY` in Vercel (server-side, no `VITE_`) |
| Search / POI empty | Check `VITE_GOOGLE_MAPS_KEY` and that Places API (New) is enabled |
| GPS not working | Must be on HTTPS (localhost is fine) — allow location permission |
| `npm install` fails | Run `node --version` — need Node 18+ |
| Blank white screen | Open browser console (F12), check for errors |

---

## Phase 2 Roadmap

- [ ] Real voice guidance (Web Speech API)
- [ ] Offline map region downloads
- [ ] Trip history + replay
- [ ] CarPlay / Android Auto via web app
- [ ] Waypoint optimizer (AI-powered nearest neighbor)
- [ ] Custom map marker colors per destination type
- [ ] Share route as link
- [ ] Dark / light mode auto-switch

---

Built with ❤️  
3D Streets Web — React + Mapbox + Claude
