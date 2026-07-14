# TinyKit

Free browser toolbox — convert, cut, capture, create. No signup.

## Tools

Background remover · QR generator · Extract audio · Opus→MP3 · Video cutter ·

Page screenshot · Coin flip · Dice roller · 7 Up 7 Down · Rock Paper Scissors ·

Number Guessing · Tic Tac Toe

## Features

- Favorites & recently used
- Shareable URLs with prefilled options (`?text=`, `?url=`, `?start=&end=`)
- Batch mode on supported tools
- Embed: `/tools/qr-code?embed=1&text=hello`
- PWA + offline shell
- SEO sitemap + per-tool metadata
- PostHog (set `NEXT_PUBLIC_POSTHOG_KEY`)
- MongoDB-backed feedback (`/feedback`) and visitor counter (footer)
- Default dark mode (toggle in header)

## Run

```bash
npm install
cp .env.example .env.local
# Set MONGODB_URI in .env.local (Atlas connection string)
# Optional: NEXT_PUBLIC_POSTHOG_KEY
npm run dev
```

## Environment

| Variable | Notes |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas URI — **never commit**. Put only in `.env.local` / Vercel env. |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional analytics |

### Security note

If a MongoDB password was ever shared in chat, email, or a ticket, **rotate it in Atlas immediately** (Database Access → Edit user → Edit password) and update `MONGODB_URI` in `.env.local` and Vercel.

On Vercel: Project → Settings → Environment Variables → add `MONGODB_URI` for Production (and Preview if needed), or:

```bash
vercel env add MONGODB_URI production --scope b4xabhisheks-projects
```

## Deploy

https://smalldevtools.vercel.app
