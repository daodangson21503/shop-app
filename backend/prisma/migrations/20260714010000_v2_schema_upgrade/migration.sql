-- v2_schema_upgrade: New tables + new fields

-- AlterTable: users
ALTER TABLE "users" ADD COLUMN "avatar" TEXT;
ALTER TABLE "users" ADD COLUMN "phone_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "last_login" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "refresh_token" TEXT;

-- AlterTable: products
ALTER TABLE "products" ADD COLUMN "original_price" DECIMAL(12,2);
ALTER TABLE "products" ADD COLUMN "weight" DECIMAL(8,2);
ALTER TABLE "products" ADD COLUMN "unit" TEXT NOT NULL DEFAULT 'cái';
ALTER TABLE "products" ADD COLUMN "brand" TEXT;
ALTER TABLE "products" ADD COLUMN "sold_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN "is_featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN "seo_title" TEXT;
ALTER TABLE "products" ADD COLUMN "seo_description" TEXT;
ALTER TABLE "products" ADD COLUMN "warranty" TEXT;

-- AlterTable: orders
ALTER TABLE "orders" ADD COLUMN "shipping_province" TEXT;
ALTER TABLE "orders" ADD COLUMN "shipping_district" TEXT;
ALTER TABLE "orders" ADD COLUMN "shipping_ward" TEXT;
ALTER TABLE "orders" ADD COLUMN "payment_method" TEXT;
ALTER TABLE "orders" ADD COLUMN "payment_status" TEXT DEFAULT 'unpaid';
ALTER TABLE "orders" ADD COLUMN "shipping_fee" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "note" TEXT;
ALTER TABLE "orders" ADD COLUMN "coupon_code" TEXT;
ALTER TABLE "orders" ADD COLUMN "cancellation_reason" TEXT;
ALTER TABLE "orders" ADD COLUMN "confirmed_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "shipping_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "completed_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "cancelled_at" TIMESTAMP(3);

-- CreateTable: addresses
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "province" TEXT,
    "district" TEXT,
    "ward" TEXT,
    "detail" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable: product_images
CREATE TABLE "product_images" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable: pages
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "meta_description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable: sliders
CREATE TABLE "sliders" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "image_url" TEXT NOT NULL,
    "link_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sliders_pkey" PRIMARY KEY ("id")
);

-- CreateTable: settings
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX "addresses_user_id_idx" ON "addresses"("user_id");
CREATE INDEX "product_images_product_id_idx" ON "product_images"("product_id");
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");
CREATE INDEX "orders_payment_status_idx" ON "orders"("payment_status");

-- AddForeignKeys
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
