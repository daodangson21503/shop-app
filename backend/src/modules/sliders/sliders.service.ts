import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SlidersService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.slider.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(data: any) {
    return this.prisma.slider.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        imageUrl: data.image_url,
        linkUrl: data.link_url,
        sortOrder: Number(data.sort_order) || 0,
        isActive: data.is_active ?? true,
      },
    });
  }

  async update(id: number, data: any) {
    try {
      return await this.prisma.slider.update({
        where: { id: Number(id) },
        data: {
          title: data.title,
          subtitle: data.subtitle,
          imageUrl: data.image_url,
          linkUrl: data.link_url,
          sortOrder: data.sort_order !== undefined ? Number(data.sort_order) : undefined,
          isActive: data.is_active,
        },
      });
    } catch {
      throw new NotFoundException('Slider không tồn tại');
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.slider.delete({ where: { id: Number(id) } });
      return { message: 'Đã xóa slider' };
    } catch {
      throw new NotFoundException('Slider không tồn tại');
    }
  }
}
