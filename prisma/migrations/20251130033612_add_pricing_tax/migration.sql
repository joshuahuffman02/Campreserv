-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campground" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "description" TEXT,
    "stateTaxPercent" REAL NOT NULL DEFAULT 0,
    "localTaxPercent" REAL NOT NULL DEFAULT 0,
    "taxesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Campground" ("city", "createdAt", "description", "id", "name", "state") SELECT "city", "createdAt", "description", "id", "name", "state" FROM "Campground";
DROP TABLE "Campground";
ALTER TABLE "new_Campground" RENAME TO "Campground";
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campgroundId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "guestFirstName" TEXT NOT NULL,
    "guestLastName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "arrivalDate" DATETIME NOT NULL,
    "departureDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'booked',
    "nights" INTEGER NOT NULL DEFAULT 1,
    "subtotalCents" INTEGER NOT NULL DEFAULT 0,
    "taxCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reservation_campgroundId_fkey" FOREIGN KEY ("campgroundId") REFERENCES "Campground" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("arrivalDate", "campgroundId", "createdAt", "departureDate", "guestEmail", "guestFirstName", "guestLastName", "id", "siteId", "status") SELECT "arrivalDate", "campgroundId", "createdAt", "departureDate", "guestEmail", "guestFirstName", "guestLastName", "id", "siteId", "status" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE TABLE "new_Site" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campgroundId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "nightlyRateCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Site_campgroundId_fkey" FOREIGN KEY ("campgroundId") REFERENCES "Campground" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Site" ("campgroundId", "createdAt", "id", "kind", "name") SELECT "campgroundId", "createdAt", "id", "kind", "name" FROM "Site";
DROP TABLE "Site";
ALTER TABLE "new_Site" RENAME TO "Site";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
