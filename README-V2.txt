LinkFlo Platform V2

Included V2 features:
- Merchant login/register, product upload, order list, wallet, withdrawal request
- Influencer login/register, product list, affiliate link, dashboard, wallet, withdrawal request
- Product page with ?ref affiliate tracking
- Billplz create bill + webhook flow, mock mode when Billplz env is empty
- Order HOLD flow: PAID -> HOLD -> COMPLETED after HOLD_DAYS
- Wallet ledger: merchant pending/available, influencer pending/available
- Admin payout center: release holds, approve/mark paid/reject withdrawals
- Admin risk page: risk flags, resolve/mark invalid, ban influencer
- Admin order detail: refund marking and wallet reversal
- Admin tracking: fill courier + tracking number

Important env:
ADMIN_PASSWORD=123456
FRONTEND_URL=http://localhost:3000
PUBLIC_BASE_URL=http://localhost:5000
BILLPLZ_API_KEY=
BILLPLZ_COLLECTION_ID=
HOLD_DAYS=7
PLATFORM_FEE_PERCENT=10
MIN_WITHDRAWAL=50

Run backend:
npm install
npm run dev

Run frontend:
npm install
npm run dev
