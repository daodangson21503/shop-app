import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.setting.findMany({ orderBy: { id: 'asc' } });
  }

  async getByKey(key: string) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException('Setting không tồn tại');
    return setting;
  }

  async upsert(key: string, value: string) {
    return this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async remove(key: string) {
    try {
      await this.prisma.setting.delete({ where: { key } });
      return { message: 'Đã xóa setting' };
    } catch (err: any) {
      if (err.code === 'P2025') throw new NotFoundException('Setting không tồn tại');
      throw err;
    }
  }
}
