# Linkflo AI Product Hub V6

本版把 Member 方向从普通 Product Store 调整成 AI Product Hub：

- `/member` 保留手机 App 风格，同时在 desktop 宽屏自动变成 sidebar dashboard。
- Product Store 改名为 AI Product Hub。
- Store 增加 AI category chips、Featured AI Products、Partner AI Products 的展示风格。
- 默认产品改成更聚焦的 AI 产品：AI Funnel、AI Caption Generator、AI Poster Maker、AI WhatsApp Script、AI Academy、Partner AI WhatsApp Bot、Partner AI CRM Assistant。
- backend seed / member summary 会用 upsert 更新默认 AI Product Hub 产品，不会因为旧数据库已经有产品就不更新。
- 购买逻辑沿用现有 Paid Credit + Bonus Credit 抵扣规则。
- AI Funnel 仍然是单一产品不同配套，当前配套不会重复扣款。

注意：这版是 UI / 默认产品方向改造，还没有做完整 Partner Portal 或 Partner 自助上架审核系统。Partner 后台建议下一阶段做。
