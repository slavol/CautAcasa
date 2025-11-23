-- CreateEnum
CREATE TYPE "ListingSource" AS ENUM ('OLX', 'PUBLI24');

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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_link_key" ON "Listing"("link");
