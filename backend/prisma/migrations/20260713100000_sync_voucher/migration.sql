/*
  Synchronize vouchers table with schema.prisma:
  - Drop title, usage_limit (from update_voucher migration)
  - Add quantity, updated_at
  - Convert discount_type TEXT back to DiscountType enum
  - Restore min_order_amount precision to DECIMAL(14,2)
*/

-- Handle 'freeship' which is not a valid DiscountType enum value
UPDATE "vouchers" SET "discount_type" = 'fixed' WHERE "discount_type" = 'freeship';

ALTER TABLE "vouchers" DROP COLUMN "title",
                        DROP COLUMN "usage_limit";

ALTER TABLE "vouchers" ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 0,
                        ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "vouchers" ALTER COLUMN "discount_type" TYPE "DiscountType" USING "discount_type"::"DiscountType";

ALTER TABLE "vouchers" ALTER COLUMN "min_order_amount" SET DATA TYPE DECIMAL(14,2);

CREATE INDEX IF NOT EXISTS "vouchers_is_active_idx" ON "vouchers"("is_active");
