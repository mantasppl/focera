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
