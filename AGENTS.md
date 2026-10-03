# CyberChess Neon — Base44 Dev Environment

## Overview
Pure frontend Vite + React 19 + TypeScript chess game ("CyberChess Neon"). The AI opponent is a local minimax chess engine (`src/utils/chessEngine.ts`); there is no server-side or external API runtime dependency despite `@google/genai` and `express` being listed in `package.json`.

## Stack
- **Package manager:** Bun (`bun.lock`)
- **Dev server:** Vite on port 3000, host 0.0.0.0
- **Styling:** Tailwind CSS 4 via `@tailwindcss/vite`
- **Key libs:** chess.js, motion, lucide-react, canvas-confetti

## Running
```
docker compose -f docker-compose.base44.yml up -d --build
```
The compose service installs deps with `bun install --frozen-lockfile` on startup, then runs `bun run dev` (Vite dev server with HMR). Source is bind-mounted at `/app`, so edits hot-reload without rebuilds.

## Secrets
None required. `GEMINI_API_KEY` and `APP_URL` appear in `.env.example` but are not referenced anywhere in `src/`. The app boots and runs fully without them.

## Notes
- The UI is in Hebrew (RTL, `dir="rtl"`).
- Vite allowed-hosts are handled via the `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` env var injected by the platform.
