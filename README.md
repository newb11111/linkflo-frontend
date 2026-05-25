# LinkFlo Light Funnel + Credit Version

LinkFlo is a lightweight AI funnel system for merchants and promoter teams.

Core logic:
- Merchant creates SKU funnel pages.
- AI Generate fills tri-language funnel copy: 中文 / English / BM.
- Funnel pages support hero, video, gallery, section copy, FAQ, CTA, and WhatsApp.
- Promoters receive affiliate links.
- Customer clicks the promoter link, enters the funnel, and WhatsApp goes to that promoter.
- Merchant tops up credit through Billplz.
- Minimum topup is RM100.
- AI Generate deducts 0.1 credit each time.
- Creating and publishing funnels is free.
- Monthly plan fee is deducted from merchant credit.
- Admin can manage merchants, credit, SKU quota, visibility, and deletion.

## Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
```

## Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

## Important

Do not commit `.env` files. Use `.env.example` as reference only.
