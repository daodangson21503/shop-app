import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getByUser(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, productId: number) {
    return this.prisma.wishlist.upsert({
      where: { userId_productId: { userId, productId: Number(productId) } },
      update: {},
      create: { userId, productId: Number(productId) },
    });
  }

  async remove(userId: string, productId: number) {
    await this.prisma.wishlist.deleteMany({
      where: { userId, productId: Number(productId) },
    });
    return { message: 'Đã xóa khỏi yêu thích' };
  }
}
