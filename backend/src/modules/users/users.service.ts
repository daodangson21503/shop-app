import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async listAll(query: { page: number; limit: number; search: string }) {
    const take = Math.max(1, query.limit);
    const skip = Math.max(0, (query.page - 1) * take);
    const search = query.search;

    const where: any = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page: query.page, limit: take };
  }

  async toggleStatus(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');
    if (user.role === 'admin') throw new BadRequestException('Không thể khóa tài khoản Admin');

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, fullName: true, isActive: true },
    });
  }

  async getStats() {
    const [total, active, customers, admins, newThisMonth] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: 'customer' } }),
      this.prisma.user.count({ where: { role: 'admin' } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return { total, active, blocked: total - active, customers, admins, newThisMonth };
  }
}
