/*
  Warnings:

  - The values [HOMEZZ] on the enum `ListingSource` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `transaction` on table `Listing` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ListingSource_new" AS ENUM ('OLX', 'PUBLI24');
ALTER TABLE "Listing" ALTER COLUMN "source" TYPE "ListingSource_new" USING ("source"::text::"ListingSource_new");
ALTER TYPE "ListingSource" RENAME TO "ListingSource_old";
ALTER TYPE "ListingSource_new" RENAME TO "ListingSource";
DROP TYPE "public"."ListingSource_old";
COMMIT;

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "transaction" SET NOT NULL;
