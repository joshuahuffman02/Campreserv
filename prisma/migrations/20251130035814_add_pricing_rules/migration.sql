-- CreateTable
CREATE TABLE "PricingRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campgroundId" TEXT NOT NULL,
    "siteId" TEXT,
    "label" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "siteKind" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "dayOfWeek" INTEGER,
    "minNights" INTEGER,
    "percentAdjust" REAL,
    "flatAdjustCents" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PricingRule_campgroundId_fkey" FOREIGN KEY ("campgroundId") REFERENCES "Campground" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PricingRule_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
