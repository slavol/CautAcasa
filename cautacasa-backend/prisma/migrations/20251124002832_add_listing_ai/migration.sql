-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ListingAI" ADD COLUMN     "transaction" "TransactionType";
