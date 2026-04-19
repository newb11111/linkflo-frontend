# LinkFlo Frontend

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

## Target architecture

- Frontend: Cloudflare Pages
- Backend: your local computer
- API: Cloudflare Tunnel
- Database: Neon
- Images: Cloudflare R2

## Cloudflare Pages env vars

Add these in Pages settings:

```env
NEXT_PUBLIC_API_URL=https://api.linkflo.club
NEXT_PUBLIC_SITE_URL=https://linkflo.club
```
