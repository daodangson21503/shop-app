import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { customer_name, customer_phone, customer_address, items, user_id, voucher_code } = data;

    if (!items || items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    return this.prisma.$transaction(async (tx) => {
      let subtotalAmount = 0;
      const verifiedItems: any[] = [];

      for (const item of items) {
        const product = await tx.product.findFirst({
          where: { id: Number(item.product_id), isActive: true },
        });
        if (!product) throw new NotFoundException(`Sản phẩm id=${item.product_id} không tồn tại`);
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Sản phẩm "${product.name}" không đủ hàng trong kho`);
        }

        const subtotal = Number(product.price) * item.quantity;
        subtotalAmount += subtotal;

        verifiedItems.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal,
        });
      }

      let voucherId: number | null = null;
      let discountAmount = 0;

      if (voucher_code) {
        const voucher = await tx.voucher.findUnique({
          where: { code: voucher_code.toUpperCase().trim() },
        });
        const now = new Date();

        if (!voucher) throw new NotFoundException('Voucher không tồn tại');
        if (!voucher.isActive) throw new BadRequestException('Voucher đã ngừng hoạt động');
        if (voucher.expiresAt && voucher.expiresAt < now) {
          throw new BadRequestException('Voucher đã hết hạn');
        }
        if (voucher.quantity > 0 && voucher.usedCount >= voucher.quantity) {
          throw new BadRequestException('Voucher đã hết lượt sử dụng');
        }
        if (subtotalAmount < Number(voucher.minOrderAmount)) {
          throw new BadRequestException(
            `Đơn hàng tối thiểu ${Number(voucher.minOrderAmount).toLocaleString()}đ để dùng voucher này`,
          );
        }

        if (voucher.discountType === 'percent') {
          discountAmount = (subtotalAmount * Number(voucher.discountValue)) / 100;
          if (voucher.maxDiscount) {
            discountAmount = Math.min(discountAmount, Number(voucher.maxDiscount));
          }
        } else {
          discountAmount = Number(voucher.discountValue);
        }
        discountAmount = Math.min(discountAmount, subtotalAmount);

        voucherId = voucher.id;

        await tx.voucher.update({
          where: { id: voucher.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      const totalAmount = subtotalAmount - discountAmount;

      const order = await tx.order.create({
        data: {
          userId: user_id || null,
          voucherId,
          customerName: customer_name,
          customerPhone: customer_phone,
          customerAddress: customer_address,
          subtotalAmount,
          discountAmount,
          totalAmount,
          items: { create: verifiedItems },
        },
        include: { items: true, voucher: true },
      });

      for (const item of verifiedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });
  }

  async listAll() {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: { select: { imageUrl: true } } },
        },
      },
    });
    return orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        imageUrl: item.product?.imageUrl || null,
        product: undefined,
      })),
    }));
  }

  async getById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { imageUrl: true } } },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        imageUrl: item.product?.imageUrl || null,
        product: undefined,
      })),
    };
  }

  async trackByPhone(id: string, phone: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { imageUrl: true, name: true } } },
        },
      },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.customerPhone !== phone) {
      throw new NotFoundException('Số điện thoại không khớp với đơn hàng');
    }
    return {
      id: order.id,
      status: order.status,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount,
      subtotalAmount: order.subtotalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      confirmedAt: order.confirmedAt,
      shippingAt: order.shippingAt,
      completedAt: order.completedAt,
      cancelledAt: order.cancelledAt,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        imageUrl: item.product?.imageUrl || null,
      })),
    };
  }

  async updateStatus(id: string, status: string) {
    try {
      return await this.prisma.order.update({
        where: { id },
        data: { status: status as any },
      });
    } catch {
      throw new NotFoundException('Order not found');
    }
  }

  async getByUserId(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: { select: { imageUrl: true } } },
        },
      },
    });
    return orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        imageUrl: item.product?.imageUrl || null,
        product: undefined,
      })),
    }));
  }

  async cancelOrder(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (order.userId !== userId) throw new ForbiddenException('Bạn không có quyền hủy đơn này');
    if (order.status !== 'pending') {
      throw new BadRequestException('Chỉ có thể hủy đơn đang ở trạng thái Chờ xử lý');
    }

    return this.prisma.$transaction(async (tx) => {
      const items = await tx.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      return tx.order.update({ where: { id }, data: { status: 'cancelled' as any } });
    });
  }
}
