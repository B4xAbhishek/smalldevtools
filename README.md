# TinyKit

Free browser toolbox — convert, cut, capture, create. No signup.

## Tools

Background remover · QR generator · Extract audio · Opus→MP3 · Video cutter · Page screenshot · Coin flip · Dice roller · 7 Up 7 Down

## Features

- Favorites & recently used
- Shareable URLs with prefilled options (`?text=`, `?url=`, `?start=&end=`)
- Batch mode on supported tools
- Embed: `/tools/qr-code?embed=1&text=hello`
- PWA + offline shell
- SEO sitemap + per-tool metadata
- PostHog (set `NEXT_PUBLIC_POSTHOG_KEY`)

## Run

```bash
npm install
cp .env.example .env.local   # optional PostHog
npm run dev
```

## Deploy

https://smalldevtools.vercel.app
