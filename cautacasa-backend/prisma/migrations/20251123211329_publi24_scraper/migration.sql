-- AlterEnum
ALTER TYPE "ListingSource" ADD VALUE 'HOMEZZ';

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "transaction" SET DEFAULT 'UNKNOWN';
