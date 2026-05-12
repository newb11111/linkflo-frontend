# LinkFlo Frontend (Vercel Version)

## Local development

```bash
npm install
npm run dev
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.linkflo.club
NEXT_PUBLIC_SITE_URL=https://linkflo.club
```

## Recommended architecture

- Frontend: Vercel
- Backend: your local computer
- API: Cloudflare Tunnel
- Database: Neon
- Images: Cloudflare R2

## Vercel settings

Framework preset:
- Next.js

Build command:
- `npm run build`

Install command:
- `npm install`

## Vercel environment variables

Add these in Vercel Project Settings -> Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://api.linkflo.club
NEXT_PUBLIC_SITE_URL=https://linkflo.club
```

## Notes

- This version keeps your current dynamic slug logic.
- `/` and `/[slug]` are rendered dynamically and fetch data from your backend.
- Your backend and cloudflared tunnel must stay running on your computer.
