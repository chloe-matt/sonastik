/*
  Warnings:

  - You are about to drop the column `count` on the `WordLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WordLog" DROP COLUMN "count",
ADD COLUMN     "totalFound" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalNotFound" INTEGER NOT NULL DEFAULT 0;
