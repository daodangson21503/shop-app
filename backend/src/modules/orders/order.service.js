const prisma = require('../../config/db');

async function create(data) {
  const { customer_name, customer_phone, customer_address, items, user_id, voucher_code } = data;

  if (!items || items.length === 0) {
    throw { status: 400, message: 'Giỏ hàng trống' };
  }

  return prisma.$transaction(async (tx) => {
    let subtotalAmount = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await tx.product.findFirst({
        where: { id: Number(item.product_id), isActive: true },
      });
      if (!product) throw { status: 404, message: `Sản phẩm id=${item.product_id} không tồn tại` };
      if (product.stock < item.quantity) {
        throw { status: 400, message: `Sản phẩm "${product.name}" không đủ hàng trong kho` };
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

    let voucherId = null;
    let discountAmount = 0;

    if (voucher_code) {
      const voucher = await tx.voucher.findUnique({ where: { code: voucher_code.toUpperCase().trim() } });
      const now = new Date();

      if (!voucher) throw { status: 404, message: 'Voucher không tồn tại' };
      if (!voucher.isActive) throw { status: 400, message: 'Voucher đã ngừng hoạt động' };
      if (voucher.expiresAt && voucher.expiresAt < now) {
        throw { status: 400, message: 'Voucher đã hết hạn' };
      }
      if (voucher.quantity > 0 && voucher.usedCount >= voucher.quantity) {
        throw { status: 400, message: 'Voucher đã hết lượt sử dụng' };
      }
      if (subtotalAmount < Number(voucher.minOrderAmount)) {
        throw {
          status: 400,
          message: `Đơn hàng tối thiểu ${Number(voucher.minOrderAmount).toLocaleString()}đ để dùng voucher này`,
        };
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
async function listAll() {
  return prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
}

async function getById(id) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) throw { status: 404, message: 'Order not found' };
  return order;
}

async function updateStatus(id, status) {
  try {
    return await prisma.order.update({ where: { id }, data: { status } });
  } catch {
    throw { status: 404, message: 'Order not found' };
  }
}

async function getByUserId(userId) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
}

async function cancelOrder(id, userId) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw { status: 404, message: 'Đơn hàng không tồn tại' };
  if (order.userId !== userId) throw { status: 403, message: 'Bạn không có quyền hủy đơn này' };
  if (order.status !== 'pending') {
    throw { status: 400, message: 'Chỉ có thể hủy đơn đang ở trạng thái Chờ xử lý' };
  }

  return prisma.$transaction(async (tx) => {
    const items = await tx.orderItem.findMany({ where: { orderId: id } });
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    return tx.order.update({ where: { id }, data: { status: 'cancelled' } });
  });
}

module.exports = { create, listAll, getById, updateStatus, getByUserId, cancelOrder };