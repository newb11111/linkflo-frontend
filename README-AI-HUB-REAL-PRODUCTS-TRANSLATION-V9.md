# Linkflo AI Product Hub V9

## Main changes

1. AI Product Hub now only shows real purchasable products.
   - Available Now: AI Funnel only.
   - Starter / Growth / Scale are shown as plans under one AI Funnel accordion.
   - Previous demo/fake products are deactivated by seed and by member summary seeding.

2. Coming Soon section added.
   - AI Academy, AI WhatsApp Sales Script, AI Caption Tool, and Partner AI Products are shown as Coming Soon only.
   - No price and no purchase button for Coming Soon items.

3. Category chips simplified.
   - All
   - AI Funnel
   - Coming Soon
   - The chip row supports horizontal scrolling on mobile.

4. Translation cleaned up for Member UI.
   - Chinese uses proper Chinese wording.
   - English uses clear product/platform wording.
   - Malay uses natural BM wording.
   - Improved translations for Hub, My AI, Credits, KYC, Wallet, Earn, notifications, product plan actions, and Coming Soon.

## After deploy / local run

Run backend seed once so old demo products become inactive:

```bash
cd backend
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Run frontend:

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

## Note

Existing active demo product rows from previous versions are not deleted from the database; they are set to `isActive=false`. This keeps old records safer while hiding them from the live Product Hub.
