/*
  Warnings:

  - You are about to drop the column `customId` on the `ItemSetting` table. All the data in the column will be lost.
  - You are about to drop the column `itemName` on the `ItemSetting` table. All the data in the column will be lost.
  - Made the column `category` on table `ItemSetting` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Manager_createdAt_idx";

-- DropIndex
DROP INDEX "Manager_isActive_idx";

-- DropIndex
DROP INDEX "Manager_joinDate_idx";

-- DropIndex
DROP INDEX "Manager_name_idx";

-- DropIndex
DROP INDEX "Manager_department_idx";

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN "referralCode" TEXT;

-- CreateTable
CREATE TABLE "ProfileChangeRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processedBy" TEXT,
    "processedAt" DATETIME,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProfileChangeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromotionMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "myCode" TEXT NOT NULL,
    "referralCode" TEXT,
    "previousLevel" INTEGER NOT NULL,
    "currentLevel" INTEGER NOT NULL,
    "totalReferrals" INTEGER NOT NULL,
    "directReferrals" INTEGER NOT NULL,
    "indirectReferrals" INTEGER NOT NULL,
    "promotionDate" DATETIME NOT NULL,
    "giftContent" TEXT NOT NULL,
    "giftAmount" REAL,
    "giftType" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentDate" DATETIME,
    "processedBy" TEXT,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PaymentHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "myCode" TEXT NOT NULL,
    "referralCode" TEXT,
    "previousLevel" INTEGER NOT NULL,
    "currentLevel" INTEGER NOT NULL,
    "totalReferrals" INTEGER NOT NULL,
    "directReferrals" INTEGER NOT NULL,
    "indirectReferrals" INTEGER NOT NULL,
    "promotionDate" DATETIME NOT NULL,
    "giftContent" TEXT NOT NULL,
    "giftAmount" REAL,
    "giftType" TEXT NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "processedBy" TEXT NOT NULL,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SettlementRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userName" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "finalPoints" INTEGER NOT NULL,
    "sumPoints" INTEGER NOT NULL,
    "currentLevel" INTEGER NOT NULL,
    "basicCommission" INTEGER NOT NULL,
    "recruitmentCommission" INTEGER NOT NULL,
    "indirectCommission" INTEGER NOT NULL,
    "dividendBasicCommission" INTEGER NOT NULL,
    "dividendLevelCommission" INTEGER NOT NULL,
    "totalCommission" INTEGER NOT NULL,
    "settlementYearMonth" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "requestStatus" TEXT NOT NULL DEFAULT '정산대기',
    "processedBy" TEXT,
    "processedAt" DATETIME,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "paymentTerm" TEXT NOT NULL,
    "baseAmount" REAL NOT NULL,
    "expectedRate" REAL NOT NULL,
    "pointRate" REAL NOT NULL,
    "pointAmount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ItemSetting" ("baseAmount", "category", "createdAt", "expectedRate", "id", "paymentTerm", "pointAmount", "pointRate", "productName", "provider") SELECT "baseAmount", "category", "createdAt", "expectedRate", "id", "paymentTerm", "pointAmount", "pointRate", "productName", "provider" FROM "ItemSetting";
DROP TABLE "ItemSetting";
ALTER TABLE "new_ItemSetting" RENAME TO "ItemSetting";
CREATE INDEX "ItemSetting_category_idx" ON "ItemSetting"("category");
CREATE INDEX "ItemSetting_createdAt_idx" ON "ItemSetting"("createdAt");
CREATE TABLE "new_SidebarItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '📦',
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "customId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SidebarItem" ("createdAt", "customId", "href", "icon", "id", "isActive", "isCustom", "name", "order", "updatedAt") SELECT "createdAt", "customId", "href", "icon", "id", "isActive", "isCustom", "name", "order", "updatedAt" FROM "SidebarItem";
DROP TABLE "SidebarItem";
ALTER TABLE "new_SidebarItem" RENAME TO "SidebarItem";
CREATE UNIQUE INDEX "SidebarItem_href_key" ON "SidebarItem"("href");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ProfileChangeRequest_userId_idx" ON "ProfileChangeRequest"("userId");

-- CreateIndex
CREATE INDEX "ProfileChangeRequest_status_idx" ON "ProfileChangeRequest"("status");

-- CreateIndex
CREATE INDEX "ProfileChangeRequest_createdAt_idx" ON "ProfileChangeRequest"("createdAt");

-- CreateIndex
CREATE INDEX "ProfileChangeRequest_processedBy_idx" ON "ProfileChangeRequest"("processedBy");

-- CreateIndex
CREATE INDEX "PaymentHistory_userId_idx" ON "PaymentHistory"("userId");

-- CreateIndex
CREATE INDEX "PaymentHistory_userPhone_idx" ON "PaymentHistory"("userPhone");

-- CreateIndex
CREATE INDEX "PaymentHistory_myCode_idx" ON "PaymentHistory"("myCode");

-- CreateIndex
CREATE INDEX "PaymentHistory_paymentDate_idx" ON "PaymentHistory"("paymentDate");

-- CreateIndex
CREATE INDEX "PaymentHistory_processedBy_idx" ON "PaymentHistory"("processedBy");

-- CreateIndex
CREATE INDEX "PaymentHistory_currentLevel_idx" ON "PaymentHistory"("currentLevel");

-- CreateIndex
CREATE INDEX "SettlementRecord_userName_idx" ON "SettlementRecord"("userName");

-- CreateIndex
CREATE INDEX "SettlementRecord_userPhone_idx" ON "SettlementRecord"("userPhone");

-- CreateIndex
CREATE INDEX "SettlementRecord_settlementYearMonth_idx" ON "SettlementRecord"("settlementYearMonth");

-- CreateIndex
CREATE INDEX "SettlementRecord_paymentStatus_idx" ON "SettlementRecord"("paymentStatus");

-- CreateIndex
CREATE INDEX "SettlementRecord_requestStatus_idx" ON "SettlementRecord"("requestStatus");

-- CreateIndex
CREATE INDEX "SettlementRecord_processedBy_idx" ON "SettlementRecord"("processedBy");

-- CreateIndex
CREATE INDEX "SettlementRecord_approvedBy_idx" ON "SettlementRecord"("approvedBy");

-- CreateIndex
CREATE INDEX "SettlementRecord_createdAt_idx" ON "SettlementRecord"("createdAt");

-- CreateIndex
CREATE INDEX "SettlementRecord_totalCommission_idx" ON "SettlementRecord"("totalCommission");
