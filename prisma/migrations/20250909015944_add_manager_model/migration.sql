-- CreateTable
CREATE TABLE "Manager" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "department" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "joinDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Manager_department_idx" ON "Manager"("department");

-- CreateIndex
CREATE INDEX "Manager_name_idx" ON "Manager"("name");

-- CreateIndex
CREATE INDEX "Manager_joinDate_idx" ON "Manager"("joinDate");

-- CreateIndex
CREATE INDEX "Manager_isActive_idx" ON "Manager"("isActive");

-- CreateIndex
CREATE INDEX "Manager_createdAt_idx" ON "Manager"("createdAt");
