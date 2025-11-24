-- CreateTable
CREATE TABLE "ListingAI" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "cleanTitle" TEXT,
    "propertyType" TEXT,
    "rooms" INTEGER,
    "summary" TEXT,
    "highlights" TEXT[],
    "features" TEXT[],
    "priceRON" INTEGER,
    "priceEUR" INTEGER,
    "city" TEXT,
    "zone" TEXT,
    "isOwner" BOOLEAN,
    "qualityScore" INTEGER,
    "aiVersion" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingAI_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingAI_listingId_key" ON "ListingAI"("listingId");

-- AddForeignKey
ALTER TABLE "ListingAI" ADD CONSTRAINT "ListingAI_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
