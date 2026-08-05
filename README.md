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
| `ADMIN_PATH` | Obscure admin base path (e.g. `/admin-9xk2q7v8m`) |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD_HASH` | bcrypt hash; in `.env.local` escape `$` as `\$` |
| `ADMIN_SESSION_SECRET` | HMAC secret for admin cookies (≥32 chars in production) |
| `ADMIN_ALLOWED_IPS` | Optional comma-separated IP allowlist |
| `DATABASE_URL` | Analytics DB (`file:./data/analytics.db` locally, or Turso `libsql://…`) |
| `DATABASE_AUTH_TOKEN` | Turso auth token (remote DB only) |
| `ANALYTICS_IP_SALT` | Optional salt for hashing visitor IPs |

## Secure admin analytics

1. Generate credentials:

```bash
node scripts/hash-admin-password.mjs --generate
```

2. Paste the printed `ADMIN_*` values into `.env.local`.
3. Run `npm run dev` and open `http://localhost:3000{ADMIN_PATH}/login`.

Notes:

- In `.env.local`, escape bcrypt `$` as `\$` (the hash script does this). Unescaped `$2b$…` is expanded by Next.js and becomes empty, which breaks login. In the Vercel UI, paste the raw hash without backslashes.
- Public `/admin` is disabled (404).
- Admin APIs are only reachable under `{ADMIN_PATH}/api/...`.
- Sessions last 24 hours (`HttpOnly`, `Secure` in production, `SameSite=Strict`).
- Login is limited to 5 attempts/minute/IP, then blocked for 10 minutes.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint
- `node scripts/hash-admin-password.mjs --generate` — generate admin path + password hash

## SEO

- Per-page metadata, canonical URLs, Open Graph, and Twitter cards via `lib/seo.ts`
- `app/sitemap.ts` → `/sitemap.xml`
- `app/robots.ts` → `/robots.txt`
- JSON-LD for Organization, WebSite, WebApplication, FAQ, and BreadcrumbList
