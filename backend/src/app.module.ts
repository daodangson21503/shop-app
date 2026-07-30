import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UploadModule } from './modules/upload/upload.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UsersModule } from './modules/users/users.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SlidersModule } from './modules/sliders/sliders.module';
import { PagesModule } from './modules/pages/pages.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { ShippingModule } from './modules/shipping/shipping.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
    VouchersModule,
    WishlistModule,
    ReviewsModule,
    UploadModule,
    DashboardModule,
    UsersModule,
    NotificationsModule,
    HealthModule,
    MetricsModule,
    SettingsModule,
    SlidersModule,
    PagesModule,
    AddressesModule,
    ShippingModule,
  ],
})
export class AppModule {}
