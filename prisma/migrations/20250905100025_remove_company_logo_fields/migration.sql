/*
  Warnings:

  - You are about to drop the column `bottomLogo` on the `CompanyInfo` table. All the data in the column will be lost.
  - You are about to drop the column `companyLogo` on the `CompanyInfo` table. All the data in the column will be lost.
  - Added the required column `area` to the `PartnerApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referrer` to the `PartnerApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contract" ADD COLUMN "confirmedAt" DATETIME;
ALTER TABLE "Contract" ADD COLUMN "decisionPoints" INTEGER;
ALTER TABLE "Contract" ADD COLUMN "insuredName" TEXT;
ALTER TABLE "Contract" ADD COLUMN "insuredPhone" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CompanyInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "businessNumber" TEXT NOT NULL,
    "representative" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "referralCodeDefault" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CompanyInfo" ("address", "businessNumber", "companyName", "createdAt", "description", "email", "id", "isActive", "phone", "referralCodeDefault", "representative", "updatedAt", "website") SELECT "address", "businessNumber", "companyName", "createdAt", "description", "email", "id", "isActive", "phone", "referralCodeDefault", "representative", "updatedAt", "website" FROM "CompanyInfo";
DROP TABLE "CompanyInfo";
ALTER TABLE "new_CompanyInfo" RENAME TO "CompanyInfo";
CREATE INDEX "CompanyInfo_isActive_idx" ON "CompanyInfo"("isActive");
CREATE INDEX "CompanyInfo_createdAt_idx" ON "CompanyInfo"("createdAt");
CREATE TABLE "new_PartnerApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "availableDate" TEXT NOT NULL,
    "availableTime" TEXT NOT NULL,
    "preferredTime" TEXT,
    "area" TEXT NOT NULL,
    "referrer" TEXT NOT NULL,
    "additionalNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processedBy" TEXT,
    "processedAt" DATETIME,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "completedAt" DATETIME,
    "cancelledAt" DATETIME,
    "cancelledBy" TEXT,
    "cancelReason" TEXT,
    "adminMemo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PartnerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PartnerApplication" ("additionalNote", "adminMemo", "approvedAt", "approvedBy", "availableDate", "availableTime", "completedAt", "createdAt", "id", "preferredTime", "processedAt", "processedBy", "status", "updatedAt", "userId") SELECT "additionalNote", "adminMemo", "approvedAt", "approvedBy", "availableDate", "availableTime", "completedAt", "createdAt", "id", "preferredTime", "processedAt", "processedBy", "status", "updatedAt", "userId" FROM "PartnerApplication";
DROP TABLE "PartnerApplication";
ALTER TABLE "new_PartnerApplication" RENAME TO "PartnerApplication";
CREATE INDEX "PartnerApplication_userId_idx" ON "PartnerApplication"("userId");
CREATE INDEX "PartnerApplication_status_idx" ON "PartnerApplication"("status");
CREATE INDEX "PartnerApplication_availableDate_idx" ON "PartnerApplication"("availableDate");
CREATE INDEX "PartnerApplication_processedBy_idx" ON "PartnerApplication"("processedBy");
CREATE INDEX "PartnerApplication_approvedBy_idx" ON "PartnerApplication"("approvedBy");
CREATE INDEX "PartnerApplication_createdAt_idx" ON "PartnerApplication"("createdAt");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "role" TEXT NOT NULL DEFAULT 'GENERAL',
    "partnerStatus" TEXT NOT NULL DEFAULT 'NOT_APPLIED',
    "points" REAL NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "referralCode" TEXT,
    "referralCodeConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "finalPoints" REAL NOT NULL DEFAULT 0,
    "monthlyReferrals" INTEGER NOT NULL DEFAULT 0,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "accountHolder" TEXT,
    "settlementCycle" TEXT,
    "profileImage" TEXT,
    "birthDate" DATETIME,
    "gender" TEXT,
    "address" TEXT,
    "addressDetail" TEXT,
    "zipCode" TEXT,
    "marketingAgreed" BOOLEAN NOT NULL DEFAULT false,
    "marketingAgreedAt" DATETIME,
    "agreeTerms" BOOLEAN NOT NULL DEFAULT false,
    "agreeTermsAt" DATETIME,
    "lastLoginAt" DATETIME,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);
INSERT INTO "new_User" ("accountHolder", "address", "addressDetail", "bankAccount", "bankName", "birthDate", "createdAt", "deletedAt", "email", "gender", "id", "isActive", "lastLoginAt", "level", "loginCount", "marketingAgreed", "marketingAgreedAt", "name", "partnerStatus", "passwordHash", "phone", "points", "profileImage", "role", "settlementCycle", "status", "updatedAt", "zipCode") SELECT "accountHolder", "address", "addressDetail", "bankAccount", "bankName", "birthDate", "createdAt", "deletedAt", "email", "gender", "id", "isActive", "lastLoginAt", "level", "loginCount", "marketingAgreed", "marketingAgreedAt", "name", "partnerStatus", "passwordHash", "phone", "points", "profileImage", "role", "settlementCycle", "status", "updatedAt", "zipCode" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_phone_idx" ON "User"("phone");
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_partnerStatus_idx" ON "User"("partnerStatus");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
