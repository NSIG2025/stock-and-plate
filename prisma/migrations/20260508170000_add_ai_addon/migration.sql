ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hasAiAddon" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "aiAddonSubscriptionId" TEXT;
ALTER TABLE "User" ADD CONSTRAINT "User_aiAddonSubscriptionId_key" UNIQUE ("aiAddonSubscriptionId");
