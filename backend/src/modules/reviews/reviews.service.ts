import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async getByProduct(productId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { productId: Number(productId) },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return { reviews, avgRating: Math.round(avgRating * 10) / 10, count: reviews.length };
  }

  async create(userId: string, productId: number, rating: number, comment?: string) {
    if (!rating || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating phải từ 1-5');
    }
    return this.prisma.review.upsert({
      where: { userId_productId: { userId, productId: Number(productId) } },
      update: { rating, comment },
      create: { userId, productId: Number(productId), rating, comment },
    });
  }

  async remove(userId: string, reviewId: number) {
    await this.prisma.review.deleteMany({
      where: { id: Number(reviewId), userId },
    });
    return { message: 'Đã xóa đánh giá' };
  }
}
