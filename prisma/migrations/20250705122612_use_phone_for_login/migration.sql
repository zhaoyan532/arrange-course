/*
  Warnings:

  - You are about to drop the column `username` on the `teachers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `teachers` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "teachers_username_key";

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "username",
ALTER COLUMN "phone" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "teachers_phone_key" ON "teachers"("phone");
