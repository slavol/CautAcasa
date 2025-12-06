-- CreateEnum
CREATE TYPE "ListingSource" AS ENUM ('OLX');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('RENT', 'SALE', 'UNKNOWN');

-- CreateTable
CREATE TABLE "Listing" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER,
    "description" TEXT,
    "city" TEXT,
    "image" TEXT,
    "link" TEXT NOT NULL,
    "source" "ListingSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedPrice" DOUBLE PRECISION,
    "currency" TEXT,
    "transaction" "TransactionType" NOT NULL DEFAULT 'UNKNOWN',

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingAI" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "cleanTitle" TEXT,
    "propertyType" TEXT,
    "transaction" "TransactionType",
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
CREATE UNIQUE INDEX "Listing_link_key" ON "Listing"("link");

-- CreateIndex
CREATE UNIQUE INDEX "ListingAI_listingId_key" ON "ListingAI"("listingId");

-- AddForeignKey
ALTER TABLE "ListingAI" ADD CONSTRAINT "ListingAI_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
