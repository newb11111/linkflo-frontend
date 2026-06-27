# Linkflo AI Product Hub V7 - Navigation Optimization

This version reorganizes the Member/App UI based on the new AI Product Hub direction.

## Main UX Changes

1. Bottom navigation reduced to 4 high-frequency entries:
   - Home: smart overview and next step
   - Hub: discover / buy / activate AI products
   - My AI: use and manage owned AI products / workspaces
   - Credits: Wallet + Earn + Rewards combined

2. Earn and Wallet are merged into Credits Center:
   - Wallet tab: Paid / Bonus credit, topup, transactions
   - Earn tab: referral link, missions, marketing materials, proof submission
   - Rewards tab: referral counts and proof records

3. Menu moved out of bottom navigation:
   - Hamburger drawer now contains KYC, orders/billing, support, settings, logout and deep links.

4. Bell notification center added:
   - Reward / mission / product reminders show in a small notification panel.

5. Funnel is no longer a bottom-nav item:
   - It is now presented under My AI Products as one of the owned AI products.
   - This keeps the product hub future-ready for Academy, Partner AI products, tools, etc.

## Install

Backend:

```bash
cd backend
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

## Build test

Frontend production build was tested successfully before packaging.
