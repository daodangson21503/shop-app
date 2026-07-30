-- CreateTable
CREATE TABLE "shipping_fees" (
    "id" SERIAL NOT NULL,
    "province" TEXT NOT NULL,
    "base_fee" DECIMAL(10,0) NOT NULL,
    "per_kg_fee" DECIMAL(10,0) NOT NULL DEFAULT 0,
    "free_min" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "estimated_days" TEXT,

    CONSTRAINT "shipping_fees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shipping_fees_province_idx" ON "shipping_fees"("province");
