/*
  Warnings:

  - Added the required column `address` to the `Hotel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "amenities" TEXT;
