const prisma = require('../../config/db');

async function create(data) {
  const { customer_name, customer_phone, customer_address, items, user_id } = data;

  if (!items || items.length === 0) {
    throw { status: 400, message: 'Giỏ hàng trống' };
  }

  return prisma.$transaction(async (tx) => {
    let totalAmount = 0;
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
      totalAmount += subtotal;

      verifiedItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal,
      });
    }

    const order = await tx.order.create({
      data: {
        userId: user_id || null,
        customerName: customer_name,
        customerPhone: customer_phone,
        customerAddress: customer_address,
        totalAmount,
        items: { create: verifiedItems },
      },
      include: { items: true },
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

module.exports = { create, listAll, getById, updateStatus, getByUserId };