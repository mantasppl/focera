# Focera

**Focera – Free Online Tools & AI Utilities**

Production site: [https://focera.co](https://focera.co)

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (default `https://focera.co`) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 measurement ID (optional) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console HTML tag verification (optional) |
| `POLLINATIONS_API_KEY` | Optional Pollinations key for AI Image / Story Generator limits |
| `GROQ_API_KEY` | Required for Video Autocaption transcription (Groq Whisper) |
| `RESEND_API_KEY` | Resend API key for the contact form (required for `/contact` submissions) |
| `RESEND_FROM_EMAIL` | Optional From address (default `Focera Contact <onboarding@resend.dev>`) |
| `ADMIN_PASSWORD` | Password for `/admin/analytics` (required for admin login) |
| `ADMIN_SESSION_SECRET` | HMAC secret for admin cookies (required in production, ≥32 chars, must differ from password) |
| `DATABASE_URL` | Analytics DB (`file:./data/analytics.db` locally, or Turso `libsql://…`) |
| `DATABASE_AUTH_TOKEN` | Turso auth token (remote DB only) |
| `ANALYTICS_IP_SALT` | Optional salt for hashing visitor IPs |

## Internal analytics

1. Set `ADMIN_PASSWORD` in `.env.local`.
2. Run `npm run dev` (the `tool_usage` table is created automatically).
3. Open [http://localhost:3000/admin/analytics](http://localhost:3000/admin/analytics) and sign in.

Optional DB helpers:

- `npm run db:generate` — generate Drizzle migrations
- `npm run db:push` — push schema to the configured database
- `npm run db:studio` — open Drizzle Studio

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint

## SEO

- Per-page metadata, canonical URLs, Open Graph, and Twitter cards via `lib/seo.ts`
- `app/sitemap.ts` → `/sitemap.xml`
- `app/robots.ts` → `/robots.txt`
- JSON-LD for Organization, WebSite, WebApplication, FAQ, and BreadcrumbList
