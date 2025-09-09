-- AlterTable
ALTER TABLE "ItemSetting" ADD COLUMN "customId" TEXT;

-- CreateTable
CREATE TABLE "SidebarItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "customId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminLoginLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "loginAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutAt" DATETIME,
    "duration" INTEGER,
    CONSTRAINT "AdminLoginLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "joinDate" DATETIME NOT NULL,
    "lastLoginAt" DATETIME,
    "lastLogoutAt" DATETIME,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "currentSessionId" TEXT,
    "lastActivityAt" DATETIME,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "lastLogoutAt" DATETIME,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "currentSessionId" TEXT,
    "lastActivityAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);
INSERT INTO "new_User" ("accountHolder", "address", "addressDetail", "agreeTerms", "agreeTermsAt", "bankAccount", "bankName", "birthDate", "createdAt", "deletedAt", "email", "finalPoints", "gender", "id", "isActive", "lastLoginAt", "level", "loginCount", "marketingAgreed", "marketingAgreedAt", "monthlyReferrals", "name", "partnerStatus", "passwordHash", "phone", "points", "profileImage", "referralCode", "referralCodeConfirmed", "role", "settlementCycle", "status", "totalReferrals", "updatedAt", "zipCode") SELECT "accountHolder", "address", "addressDetail", "agreeTerms", "agreeTermsAt", "bankAccount", "bankName", "birthDate", "createdAt", "deletedAt", "email", "finalPoints", "gender", "id", "isActive", "lastLoginAt", "level", "loginCount", "marketingAgreed", "marketingAgreedAt", "monthlyReferrals", "name", "partnerStatus", "passwordHash", "phone", "points", "profileImage", "referralCode", "referralCodeConfirmed", "role", "settlementCycle", "status", "totalReferrals", "updatedAt", "zipCode" FROM "User";
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

-- CreateIndex
CREATE INDEX "SidebarItem_isCustom_idx" ON "SidebarItem"("isCustom");

-- CreateIndex
CREATE INDEX "SidebarItem_customId_idx" ON "SidebarItem"("customId");

-- CreateIndex
CREATE INDEX "SidebarItem_order_idx" ON "SidebarItem"("order");

-- CreateIndex
CREATE UNIQUE INDEX "SidebarItem_href_key" ON "SidebarItem"("href");

-- CreateIndex
CREATE INDEX "AdminLoginLog_adminId_idx" ON "AdminLoginLog"("adminId");

-- CreateIndex
CREATE INDEX "AdminLoginLog_email_idx" ON "AdminLoginLog"("email");

-- CreateIndex
CREATE INDEX "AdminLoginLog_action_idx" ON "AdminLoginLog"("action");

-- CreateIndex
CREATE INDEX "AdminLoginLog_loginAt_idx" ON "AdminLoginLog"("loginAt");

-- CreateIndex
CREATE INDEX "AdminLoginLog_logoutAt_idx" ON "AdminLoginLog"("logoutAt");

-- CreateIndex
CREATE INDEX "AdminLoginLog_sessionId_idx" ON "AdminLoginLog"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_phone_key" ON "Admin"("phone");

-- CreateIndex
CREATE INDEX "Admin_email_idx" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_phone_idx" ON "Admin"("phone");

-- CreateIndex
CREATE INDEX "Admin_role_idx" ON "Admin"("role");

-- CreateIndex
CREATE INDEX "Admin_status_idx" ON "Admin"("status");

-- CreateIndex
CREATE INDEX "Admin_joinDate_idx" ON "Admin"("joinDate");

-- CreateIndex
CREATE INDEX "Admin_isOnline_idx" ON "Admin"("isOnline");

-- CreateIndex
CREATE INDEX "ItemSetting_customId_idx" ON "ItemSetting"("customId");
