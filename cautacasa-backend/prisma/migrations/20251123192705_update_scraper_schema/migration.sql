/*
  Warnings:

  - The `transaction` column on the `Listing` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SALE', 'RENT', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "convertedPrice" DOUBLE PRECISION,
ADD COLUMN     "currency" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT,
DROP COLUMN "transaction",
ADD COLUMN     "transaction" "TransactionType";
