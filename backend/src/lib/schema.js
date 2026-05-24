const { q } = require('./db')

async function initSchema() {
  await q(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`)

  await q(`CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    monthly_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    promoter_limit INT NOT NULL DEFAULT 0,
    included_funnel_slots INT NOT NULL DEFAULT 1
  );`)

  await q(`INSERT INTO plans (id,name,monthly_price,promoter_limit,included_funnel_slots) VALUES
    ('starter','Starter',29,10,1),
    ('growth','Growth',139,50,3),
    ('scale','Scale',259,100,10)
  ON CONFLICT (id) DO UPDATE SET
    name=EXCLUDED.name, monthly_price=EXCLUDED.monthly_price,
    promoter_limit=EXCLUDED.promoter_limit, included_funnel_slots=EXCLUDED.included_funnel_slots;`)

  await q(`CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name TEXT NOT NULL,
    owner_name TEXT,
    whatsapp TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    plan_id TEXT NOT NULL DEFAULT 'starter' REFERENCES plans(id),
    credit_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    extra_funnel_slots INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    next_billing_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`)

  await q(`CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    whatsapp TEXT,
    language TEXT DEFAULT 'zh',
    funnel JSONB NOT NULL DEFAULT '{}'::jsonb,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`)

  await q(`CREATE TABLE IF NOT EXISTS promoters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    ref_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`)

  await q(`CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    description TEXT,
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`)

  await q(`CREATE TABLE IF NOT EXISTS click_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    promoter_id UUID REFERENCES promoters(id) ON DELETE SET NULL,
    ref_code TEXT,
    visitor_key TEXT,
    ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`)

  await q(`CREATE UNIQUE INDEX IF NOT EXISTS click_events_daily_dedupe
    ON click_events (product_id, COALESCE(ref_code,''), COALESCE(visitor_key,''), date(created_at));`)

  console.log('✅ Schema initialized')
}
module.exports = { initSchema }
