import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.page.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
  }

  async getBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Trang không tồn tại');
    return page;
  }

  async create(data: any) {
    return this.prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        metaDescription: data.meta_description,
        isActive: data.is_active ?? true,
      },
    });
  }

  async update(id: number, data: any) {
    try {
      return await this.prisma.page.update({
        where: { id: Number(id) },
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          metaDescription: data.meta_description,
          isActive: data.is_active,
        },
      });
    } catch {
      throw new NotFoundException('Trang không tồn tại');
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.page.update({
        where: { id: Number(id) },
        data: { isActive: false },
      });
    } catch {
      throw new NotFoundException('Trang không tồn tại');
    }
  }
}
