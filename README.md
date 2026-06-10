# Scquff Bach 🏆

Live scoreboard for a bachelor-weekend competition: 3 teams of 4 battling across
pool, table tennis, bowling, and golf (team match + closest-to-the-pin + long drive).

## Stack

- React + Vite + Tailwind static site (no server)
- Supabase (Postgres) for teams / games / results, accessed from the browser with the anon key
- Hosted on Render as a Static Site

## Develop

```bash
cp .env.example .env.local   # fill in the Supabase anon key
npm install
npm run dev
```

## Deploy

Push to `main` — Render auto-builds with `npm ci && npm run build` and publishes `dist/`.
