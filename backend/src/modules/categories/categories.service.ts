import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.category.findMany({
      orderBy: { id: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async create(name: string, slug: string) {
    if (!name || !slug) {
      throw new BadRequestException('Vui lòng nhập tên và slug');
    }
    try {
      return await this.prisma.category.create({ data: { name, slug } });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new BadRequestException('Slug đã tồn tại, vui lòng chọn slug khác');
      }
      throw err;
    }
  }

  async update(id: number, name: string, slug?: string) {
    try {
      return await this.prisma.category.update({
        where: { id: Number(id) },
        data: { name, ...(slug ? { slug } : {}) },
      });
    } catch (err: any) {
      if (err.code === 'P2025') throw new NotFoundException('Không tìm thấy danh mục');
      if (err.code === 'P2002') throw new BadRequestException('Slug đã tồn tại, vui lòng chọn slug khác');
      throw err;
    }
  }

  async remove(id: number) {
    const productCount = await this.prisma.product.count({ where: { categoryId: Number(id) } });
    if (productCount > 0) {
      throw new BadRequestException(
        `Không thể xóa, vẫn còn ${productCount} sản phẩm thuộc danh mục này`,
      );
    }
    try {
      await this.prisma.category.delete({ where: { id: Number(id) } });
      return { message: 'Đã xóa danh mục' };
    } catch (err: any) {
      if (err.code === 'P2025') throw new NotFoundException('Không tìm thấy danh mục');
      throw err;
    }
  }
}
