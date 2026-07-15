# TinyKit

Free browser toolbox — coin flip / toss, WhatsApp audio to MP3, QR codes, 7 Up 7 Down, and more. No signup.

## Tools (SEO focus)

- **Coin Flip / Toss** — `/tools/coin-flip`
- **WhatsApp Audio to MP3** (Opus) — `/tools/opus-to-mp3`
- **QR Code Generator** — `/tools/qr-code`
- **7 Up 7 Down** — `/tools/seven-up-down`

Also: extract audio · video cutter · background remover · page screenshot · dice · RPS · number guess · tic-tac-toe · IP · location

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

https://tinykit.vercel.app
