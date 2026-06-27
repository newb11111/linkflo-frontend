# Linkflo AI Product Hub Accordion V8

这版主要优化 AI Product Hub 的产品呈现逻辑：

## 主要改动

1. **AI Funnel 改成单一产品卡**
   - AI Funnel Starter / Growth / Scale 不再作为 3 个独立产品大卡重复显示。
   - Hub 里现在只显示一张 AI Funnel 主卡。

2. **Starter / Growth / Scale 改成伸缩抽屉**
   - 点击「管理配套 / 展开配套」后才显示 plan options。
   - 当前配套显示 Current Plan，不能重复扣款。
   - 其他配套显示 Switch Plan。

3. **Hub 不再重复显示同一批产品**
   - 删除 Hub 内部的重复 Featured compact list。
   - Hub 现在只负责发现 / 开通 / 切换产品。

4. **My AI 继续负责操作已开通产品**
   - 已开通 AI Funnel 后，用户去 My AI / AI Funnel Workspace 操作。
   - Hub 负责买 / 换，My AI 负责用。

## 安装

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

## 测试

Frontend 已跑过：
```bash
npm run build
```
Build 成功。
