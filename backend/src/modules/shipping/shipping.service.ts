import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  async calculate(province: string, subtotal: number, weight: number) {
    const fee = await this.prisma.shippingFee.findFirst({
      where: { province: { contains: province, mode: 'insensitive' } },
    });

    if (!fee) {
      const defaultFee = { fee: 30000, estimatedDays: '3-5 ngày', message: 'Phí vận chuyển mặc định' };
      return defaultFee;
    }

    const freeMin = Number(fee.freeMin);
    if (freeMin > 0 && subtotal >= freeMin) {
      return { fee: 0, estimatedDays: fee.estimatedDays, message: `Miễn phí vận chuyển đến ${province}` };
    }

    const baseFee = Number(fee.baseFee);
    const perKgFee = Number(fee.perKgFee);
    const extraKgs = Math.max(0, Math.ceil(weight - 1));
    const totalFee = baseFee + extraKgs * perKgFee;

    return { fee: totalFee, estimatedDays: fee.estimatedDays, message: `Phí vận chuyển đến ${province}` };
  }

  async getProvinces() {
    const fees = await this.prisma.shippingFee.findMany({ orderBy: { province: 'asc' } });
    return fees.map((f) => ({
      province: f.province,
      baseFee: f.baseFee,
      perKgFee: f.perKgFee,
      freeMin: f.freeMin,
      estimatedDays: f.estimatedDays,
    }));
  }
}
