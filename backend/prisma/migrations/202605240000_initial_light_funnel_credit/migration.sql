DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'MERCHANT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PlanCode" AS ENUM ('STARTER', 'GROWTH', 'SCALE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT,
  "role" "Role" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Merchant" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "brandName" TEXT NOT NULL,
  "whatsapp" TEXT NOT NULL,
  "plan" "PlanCode" NOT NULL DEFAULT 'STARTER',
  "planStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
  "nextBillingAt" TIMESTAMP(3),
  "lastMonthlyChargeAt" TIMESTAMP(3),
  "isHidden" BOOLEAN NOT NULL DEFAULT false,
  "extraSkuCredits" INTEGER NOT NULL DEFAULT 0,
  "creditBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Merchant_userId_key" ON "Merchant"("userId");
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "headline" TEXT NOT NULL,
  "subheadline" TEXT,
  "description" TEXT,
  "sop" TEXT,
  "priceNote" TEXT,
  "imageUrl" TEXT,
  "heroImageUrl" TEXT,
  "videoUrl" TEXT,
  "galleryImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "translations" JSONB NOT NULL DEFAULT '{}',
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "isHidden" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");
ALTER TABLE "Product" ADD CONSTRAINT "Product_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "FunnelSection" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "isHidden" BOOLEAN NOT NULL DEFAULT false,
  "translations" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FunnelSection_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "FunnelSection" ADD CONSTRAINT "FunnelSection_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "PromoterLink" (
  "id" TEXT NOT NULL,
  "promoterId" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "promoterName" TEXT NOT NULL,
  "promoterPhone" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromoterLink_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PromoterLink_code_key" ON "PromoterLink"("code");
CREATE INDEX IF NOT EXISTS "PromoterLink_merchantId_promoterId_idx" ON "PromoterLink"("merchantId", "promoterId");
ALTER TABLE "PromoterLink" ADD CONSTRAINT "PromoterLink_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PromoterLink" ADD CONSTRAINT "PromoterLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "TrackingEvent" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "promoterLinkId" TEXT,
  "type" TEXT NOT NULL,
  "refCode" TEXT,
  "visitorKey" TEXT,
  "ip" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TrackingEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TrackingEvent_productId_promoterLinkId_type_visitorKey_createdAt_idx" ON "TrackingEvent"("productId", "promoterLinkId", "type", "visitorKey", "createdAt");
ALTER TABLE "TrackingEvent" ADD CONSTRAINT "TrackingEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrackingEvent" ADD CONSTRAINT "TrackingEvent_promoterLinkId_fkey" FOREIGN KEY ("promoterLinkId") REFERENCES "PromoterLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "BillingTransaction" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT,
  "type" TEXT NOT NULL,
  "plan" "PlanCode",
  "skuCredits" INTEGER NOT NULL DEFAULT 0,
  "creditAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "billId" TEXT,
  "billUrl" TEXT,
  "rawPayload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BillingTransaction_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "BillingTransaction" ADD CONSTRAINT "BillingTransaction_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "planStatus" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "nextBillingAt" TIMESTAMP(3);
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "lastMonthlyChargeAt" TIMESTAMP(3);
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "heroImageUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "galleryImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "translations" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FunnelSection" ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FunnelSection" ADD COLUMN IF NOT EXISTS "translations" JSONB NOT NULL DEFAULT '{}';
