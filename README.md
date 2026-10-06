<div align="center">

# 🎬 CineFind

**Browse films, watch official trailers, and build your own watchlist.**
A cinematic, streaming-style front end built with React, Vite and the TMDB API.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-animations-0055FF?logo=framer&logoColor=white&style=flat-square)](https://www.framer.com/motion/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[**🔴 Live Demo**]()

</div>

---

## ✨ Features

- **Cinematic home screen** with a hero carousel, a coverflow showcase and horizontally scrolling category rows
- **Browse by genre** from the navbar dropdown, with a dedicated genre hero and grid view
- **Instant search** across titles, genres and synopses
- **Detail modal** with synopsis, runtime, cast, similar titles and an embedded YouTube trailer (privacy-friendly `youtube-nocookie`)
- **My List** that persists between visits via `localStorage`
- **Sign in / Sign up modal** with live validation, a password strength meter and show/hide password
- **Skeleton loading states**, so the UI never flashes blank
- **Zero-config demo mode**: runs out of the box on a bundled catalogue, and switches to live TMDB data when you add an API key
- **Accessibility built in**: focus trapping in modals, body scroll lock, ARIA labels and roles, and `prefers-reduced-motion` support

## 🧰 Tech Stack

| Area | Tools |
| --- | --- |
| Framework | React 19 |
| Build tool | Vite |
| Language | JavaScript + TypeScript (strict mode) |
| Styling | Tailwind CSS 3, hand-written CSS, CSS variables for theming |
| Animation | Framer Motion |
| Icons | Lucide React + custom SVG icons |
| Utilities | `clsx`, `tailwind-merge`, `tailwindcss-animate` |
| Data | [TMDB API](https://www.themoviedb.org/documentation/api) |
| Linting | ESLint (React Hooks + React Refresh rules) |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20.19+ (or 22.12+)
- npm (included with Node)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/BeshoyAziz7/cinefind.git
cd cinefind

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`). That's it: the app runs on the built-in demo catalogue with no setup.

### Using live TMDB data (optional)

1. Create a free account at [themoviedb.org](https://www.themoviedb.org) and request an API key under **Settings → API**.
2. Copy the example env file and add your key:

```bash
cp .env.example .env.local
```

```env
VITE_TMDB_API_KEY=your_key_here
```

3. Restart the dev server. The footer will now read **"Live data from TMDB."**

> **Note:** Vite embeds `VITE_` variables in the client bundle, so a deployed site exposes its key to anyone who inspects it. That's fine for a free TMDB key, but don't reuse a key you care about.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## 📁 Project Structure

```
cinefind/
├── src/
│   ├── components/
│   │   ├── ui/                 # Footer, hero carousel, coverflow, animated text
│   │   ├── AuthModal.jsx       # Sign in / sign up with validation
│   │   ├── DetailModal.jsx     # Title details + trailer player
│   │   ├── Navbar.jsx          # Search, genre dropdown, account entry
│   │   ├── Row.jsx             # Horizontal category rows
│   │   ├── GenreView.jsx       # Browse-by-genre page
│   │   └── ...
│   ├── hooks/                  # Shared hooks (focus trap, body lock, My List)
│   ├── lib/
│   │   ├── tmdb.js             # Data layer: live TMDB with demo fallback
│   │   ├── mockData.js         # Offline demo catalogue
│   │   └── utils.ts            # cn() class helper
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── tailwind.config.js
└── vite.config.js
```

## 🧠 Design Decisions

- **Graceful fallback.** `tmdb.js` normalises every response into a single shape that all components consume. If there's no key, or the API fails, the app falls back to the demo catalogue instead of showing an error screen.
- **Resilient fetching.** Home rows load with `Promise.allSettled`, so one failed request never takes down the whole page.
- **Safe persistence.** Reads and writes to `localStorage` are wrapped in try/catch, so blocked storage (private mode, quota errors) can't crash the UI.
- **Motion with restraint.** Animations stick to `transform` and `opacity`, and respect the user's reduced-motion setting.
- **Original demo content.** The 28 placeholder titles and summaries in the demo catalogue are original text, not TMDB or studio content.

## ⚠️ Demo Disclaimer

CineFind is a **portfolio project**, not a real streaming service.

- Sign in / sign up is a **simulated UI flow** with no backend, and no account data is stored or sent anywhere.
- There is no video streaming. The player embeds public YouTube trailers only.
- "Continue watching" progress values and "match %" scores are illustrative.

## 🗺️ Roadmap

- [ ] Real authentication and per-user lists
- [ ] Routing with shareable URLs for titles and genres
- [ ] TV series support
- [ ] Unit tests for the data layer and hooks
- [ ] Infinite scroll on genre pages


## 🙏 Acknowledgements

- Movie data and images provided by [TMDB](https://www.themoviedb.org). *This product uses the TMDB API but is not endorsed or certified by TMDB.*
- Fonts: [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) and [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3) via Google Fonts
- Icons by [Lucide](https://lucide.dev)

---

<div align="center">

Built by **[Beshoy Aziz](https://github.com/BeshoyAziz7)** · [LinkedIn](https://www.linkedin.com/in/beshoy-aziz-183450279/)

</div>