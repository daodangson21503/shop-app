import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.voucher.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async listAvailable(orderAmount: number) {
    const now = new Date();
    const vouchers = await this.prisma.voucher.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
      },
      orderBy: { discountValue: 'desc' },
    });

    return vouchers.filter((v) => {
      const stillAvailable = v.quantity === 0 || v.usedCount < v.quantity;
      const meetsMinOrder = Number(orderAmount) >= Number(v.minOrderAmount);
      return stillAvailable && meetsMinOrder;
    });
  }

  async validateAndApply(code: string, orderAmount: number) {
    const voucher = await this.prisma.voucher.findUnique({ where: { code } });
    if (!voucher) throw new NotFoundException('Voucher không tồn tại');

    const now = new Date();
    if (!voucher.isActive) throw new BadRequestException('Voucher đã ngừng hoạt động');
    if (voucher.expiresAt && voucher.expiresAt < now) {
      throw new BadRequestException('Voucher đã hết hạn');
    }
    if (voucher.quantity > 0 && voucher.usedCount >= voucher.quantity) {
      throw new BadRequestException('Voucher đã hết lượt sử dụng');
    }
    if (Number(orderAmount) < Number(voucher.minOrderAmount)) {
      throw new BadRequestException(
        `Đơn hàng tối thiểu ${Number(voucher.minOrderAmount).toLocaleString()}đ để dùng voucher này`,
      );
    }

    let discountAmount = 0;
    if (voucher.discountType === 'percent') {
      discountAmount = (Number(orderAmount) * Number(voucher.discountValue)) / 100;
      if (voucher.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(voucher.maxDiscount));
      }
    } else {
      discountAmount = Number(voucher.discountValue);
    }
    discountAmount = Math.min(discountAmount, Number(orderAmount));

    return { voucher, discountAmount };
  }

  async create(data: any) {
    const { code, description, discount_type, discount_value, min_order_amount, max_discount, quantity, expires_at, is_active } = data;
    return this.prisma.voucher.create({
      data: {
        code: code.toUpperCase().trim(),
        description,
        discountType: discount_type,
        discountValue: Number(discount_value),
        minOrderAmount: Number(min_order_amount) || 0,
        maxDiscount: max_discount ? Number(max_discount) : null,
        quantity: Number(quantity) || 0,
        expiresAt: expires_at ? new Date(expires_at) : null,
        isActive: is_active !== undefined ? is_active : undefined,
      },
    });
  }

  async update(id: number, data: any) {
    const { description, discount_type, discount_value, min_order_amount, max_discount, quantity, expires_at, is_active } = data;
    try {
      return await this.prisma.voucher.update({
        where: { id: Number(id) },
        data: {
          description,
          discountType: discount_type,
          discountValue: discount_value ? Number(discount_value) : undefined,
          minOrderAmount: min_order_amount !== undefined ? Number(min_order_amount) : undefined,
          maxDiscount: max_discount ? Number(max_discount) : null,
          quantity: quantity !== undefined ? Number(quantity) : undefined,
          expiresAt: expires_at ? new Date(expires_at) : undefined,
          isActive: is_active,
        },
      });
    } catch {
      throw new NotFoundException('Voucher không tồn tại');
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.voucher.delete({ where: { id: Number(id) } });
      return { message: 'Deleted' };
    } catch {
      throw new NotFoundException('Voucher không tồn tại');
    }
  }
}
