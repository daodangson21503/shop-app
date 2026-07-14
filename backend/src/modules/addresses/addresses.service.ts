import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async listByUser(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async create(userId: string, data: any) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({
      data: {
        userId,
        fullName: data.full_name,
        phone: data.phone,
        province: data.province,
        district: data.district,
        ward: data.ward,
        detail: data.detail,
        isDefault: data.is_default ?? false,
      },
    });
  }

  async update(id: number, userId: string, data: any) {
    const address = await this.prisma.address.findUnique({ where: { id: Number(id) } });
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
    if (address.userId !== userId) throw new ForbiddenException('Không có quyền chỉnh sửa địa chỉ này');

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({
      where: { id: Number(id) },
      data: {
        fullName: data.full_name,
        phone: data.phone,
        province: data.province,
        district: data.district,
        ward: data.ward,
        detail: data.detail,
        isDefault: data.is_default,
      },
    });
  }

  async remove(id: number, userId: string) {
    const address = await this.prisma.address.findUnique({ where: { id: Number(id) } });
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');
    if (address.userId !== userId) throw new ForbiddenException('Không có quyền xóa địa chỉ này');

    await this.prisma.address.delete({ where: { id: Number(id) } });
    return { message: 'Đã xóa địa chỉ' };
  }
}
