-- Linkflo Member / Ambassador / Wallet upgrade
-- Safe migration: keeps the old Merchant table name, adds member fields and new modules.

ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "bonusCreditBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "memberStatus" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "memberTier" TEXT NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "kycStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "referredById" TEXT;
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "monthlyPostCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "tierGraceCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Merchant" ADD COLUMN IF NOT EXISTS "lastTierCheckedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "Merchant_referralCode_key" ON "Merchant"("referralCode");
CREATE INDEX IF NOT EXISTS "Merchant_memberTier_kycStatus_memberStatus_idx" ON "Merchant"("memberTier", "kycStatus", "memberStatus");
CREATE INDEX IF NOT EXISTS "Merchant_referredById_idx" ON "Merchant"("referredById");

CREATE TABLE IF NOT EXISTS "CreditLedger" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "bucket" TEXT NOT NULL,
  "direction" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "balanceBefore" DOUBLE PRECISION NOT NULL,
  "balanceAfter" DOUBLE PRECISION NOT NULL,
  "category" TEXT NOT NULL,
  "referenceType" TEXT,
  "referenceId" TEXT,
  "note" TEXT,
  "createdByAdminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreditLedger_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CreditLedger_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "CreditLedger_merchantId_bucket_createdAt_idx" ON "CreditLedger"("merchantId", "bucket", "createdAt");
CREATE INDEX IF NOT EXISTS "CreditLedger_category_createdAt_idx" ON "CreditLedger"("category", "createdAt");

CREATE TABLE IF NOT EXISTS "ProductStoreItem" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'SERVICE',
  "price" DOUBLE PRECISION NOT NULL,
  "billingType" TEXT NOT NULL DEFAULT 'ONE_TIME',
  "bonusAllowed" BOOLEAN NOT NULL DEFAULT true,
  "normalBonusCap" DOUBLE PRECISION NOT NULL DEFAULT 0.30,
  "goldBonusCap" DOUBLE PRECISION NOT NULL DEFAULT 0.40,
  "diamondBonusCap" DOUBLE PRECISION NOT NULL DEFAULT 0.50,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductStoreItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ProductStoreItem_code_key" ON "ProductStoreItem"("code");

CREATE TABLE IF NOT EXISTS "MemberProductSubscription" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "productItemId" TEXT,
  "productCode" TEXT NOT NULL,
  "planCode" "PlanCode",
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "monthlyPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "nextBillingAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MemberProductSubscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MemberProductSubscription_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MemberProductSubscription_productItemId_fkey" FOREIGN KEY ("productItemId") REFERENCES "ProductStoreItem"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "MemberProductSubscription_merchantId_productCode_status_idx" ON "MemberProductSubscription"("merchantId", "productCode", "status");

CREATE TABLE IF NOT EXISTS "MarketingMaterial" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'IMAGE',
  "platform" TEXT NOT NULL DEFAULT 'ALL',
  "language" TEXT NOT NULL DEFAULT 'ZH',
  "fileUrl" TEXT,
  "caption" TEXT,
  "campaignId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketingMaterial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MonthlyCampaign" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "month" TEXT NOT NULL,
  "startAt" TIMESTAMP(3),
  "endAt" TIMESTAMP(3),
  "goldRequiredPosts" INTEGER NOT NULL DEFAULT 4,
  "diamondRequiredPosts" INTEGER NOT NULL DEFAULT 8,
  "storyRewardCredit" DOUBLE PRECISION NOT NULL DEFAULT 3,
  "postRewardCredit" DOUBLE PRECISION NOT NULL DEFAULT 5,
  "videoRewardCredit" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MonthlyCampaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SocialProofSubmission" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "campaignId" TEXT,
  "materialId" TEXT,
  "platform" TEXT NOT NULL,
  "postType" TEXT NOT NULL,
  "proofImageUrl" TEXT,
  "postUrl" TEXT,
  "caption" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "rewardCredit" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "adminNote" TEXT,
  "approvedById" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SocialProofSubmission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SocialProofSubmission_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "SocialProofSubmission_merchantId_status_createdAt_idx" ON "SocialProofSubmission"("merchantId", "status", "createdAt");

CREATE TABLE IF NOT EXISTS "ReferralEvent" (
  "id" TEXT NOT NULL,
  "referrerMerchantId" TEXT NOT NULL,
  "referredMerchantId" TEXT,
  "eventType" TEXT NOT NULL,
  "rewardStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "rewardCredit" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "orderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReferralEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ReferralEvent_referrerMerchantId_eventType_createdAt_idx" ON "ReferralEvent"("referrerMerchantId", "eventType", "createdAt");

CREATE TABLE IF NOT EXISTS "KycSubmission" (
  "id" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "icNumber" TEXT,
  "phone" TEXT,
  "socialProfile" TEXT,
  "icFrontUrl" TEXT,
  "icBackUrl" TEXT,
  "selfieUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "adminNote" TEXT,
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KycSubmission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "KycSubmission_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "KycSubmission_merchantId_status_createdAt_idx" ON "KycSubmission"("merchantId", "status", "createdAt");

CREATE TABLE IF NOT EXISTS "AmbassadorLevelSetting" (
  "id" TEXT NOT NULL,
  "tier" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "bonusCap" DOUBLE PRECISION NOT NULL,
  "kycRequired" BOOLEAN NOT NULL DEFAULT false,
  "monthlyPostRequired" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AmbassadorLevelSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AmbassadorLevelSetting_tier_key" ON "AmbassadorLevelSetting"("tier");
