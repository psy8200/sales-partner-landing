-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ItemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT,
    "customId" TEXT,
    "itemName" TEXT,
    "provider" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "paymentTerm" TEXT NOT NULL,
    "baseAmount" REAL NOT NULL,
    "expectedRate" REAL NOT NULL,
    "pointRate" REAL NOT NULL,
    "pointAmount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ItemSetting" ("baseAmount", "category", "createdAt", "customId", "expectedRate", "id", "paymentTerm", "pointAmount", "pointRate", "productName", "provider") SELECT "baseAmount", "category", "createdAt", "customId", "expectedRate", "id", "paymentTerm", "pointAmount", "pointRate", "productName", "provider" FROM "ItemSetting";
DROP TABLE "ItemSetting";
ALTER TABLE "new_ItemSetting" RENAME TO "ItemSetting";
CREATE INDEX "ItemSetting_category_idx" ON "ItemSetting"("category");
CREATE INDEX "ItemSetting_customId_idx" ON "ItemSetting"("customId");
CREATE INDEX "ItemSetting_itemName_idx" ON "ItemSetting"("itemName");
CREATE INDEX "ItemSetting_createdAt_idx" ON "ItemSetting"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
