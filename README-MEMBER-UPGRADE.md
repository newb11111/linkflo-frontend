# Linkflo Member / Ambassador Upgrade

这个版本把原本 AI Funnel 系统升级成 Linkflo Member 生态：

- `/login`：统一登录 / 免费注册 Member。
- `/member`：会员中心，包含 Wallet、Product Store、Referral Link、Marketing Material、KYC、Social Proof、Ledger。
- `/merchant`：保留原本 Funnel 操作区；只有开通 AI Funnel 后才可以创建 Funnel / Promoter / AI Generate。
- `/admin`：Super Admin 控制中心，可管理 Member、Paid/Bonus Credit、等级规则、产品服务、素材、KYC、Proof、Ledger。

## 重要规则

- Member 免费注册。
- 新 Member 默认获得 20 Bonus Credit。
- Referral 注册奖励：推荐人获得 20 Bonus Credit。
- Referral 购买奖励：推荐人获得订单 10% Bonus Credit。
- Credit 分两种：
  - Paid Credit：充值 / Admin 加，可以 100% 付款。
  - Bonus Credit：推荐 / 发 story / campaign 拿到，只能按等级抵扣。
- Bonus 抵扣上限：
  - Unverified Member：5%
  - Verified Member：30%
  - Gold Ambassador：40%
  - Diamond Ambassador：50%
- KYC 不强制注册，但 Verified / Gold / Diamond 需要 KYC。

## 上线前要做

进入 backend 后执行：

```bash
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

进入 frontend 后执行：

```bash
npm install --legacy-peer-deps
npm run dev
```

如果是 Vercel / Neon：

```bash
cd backend
npx prisma db push
npm run seed
```

确保 `.env` 的 `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` 正确。
