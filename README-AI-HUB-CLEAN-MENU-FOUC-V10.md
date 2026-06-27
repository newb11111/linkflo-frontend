# Linkflo AI Product Hub V10

This version cleans up the Member drawer and fixes the refresh flash issue.

## Changed
- Removed duplicate drawer entries for Home / Hub / My AI / Wallet / Earn / Rewards. These already exist in the bottom nav or Credits tab.
- Removed unfinished / placeholder drawer actions: Orders & Billing, Support / Help, Account Settings.
- Kept only real drawer functions: account/KYC verification and Logout.
- KYC drawer opens directly so the Verify Now CTA is useful.
- Added Member UI CSS into `frontend/app/globals.css` as critical global styling to prevent the raw unstyled HTML flash during refresh.
- Drawer title translations cleaned up: Account Center / 账户中心 / Akaun.

## Current real product logic
- AI Funnel is the only active product.
- Hub is for buying / switching AI Funnel plans.
- My AI is for operating active products.
- Credits combines Wallet, Earn and Rewards.
