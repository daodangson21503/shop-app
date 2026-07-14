/*
  Warnings:

  - You are about to drop the column `quantity` on the `vouchers` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `vouchers` table. All the data in the column will be lost.
  - You are about to alter the column `min_order_amount` on the `vouchers` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Decimal(12,2)`.
  - Added the required column `title` to the `vouchers` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `discount_type` on the `vouchers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "vouchers_is_active_idx";

-- AlterTable
ALTER TABLE "vouchers" DROP COLUMN "quantity",
DROP COLUMN "updated_at",
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "usage_limit" INTEGER NOT NULL DEFAULT 100,
DROP COLUMN "discount_type",
ADD COLUMN     "discount_type" TEXT NOT NULL,
ALTER COLUMN "discount_value" SET DEFAULT 0,
ALTER COLUMN "min_order_amount" SET DATA TYPE DECIMAL(12,2);
