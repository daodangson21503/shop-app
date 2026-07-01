const prisma = require('../../config/db');

async function list() {
  return prisma.voucher.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

async function listAvailable(orderAmount) {
  const now = new Date();
  const vouchers = await prisma.voucher.findMany({
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

async function getByCode(code) {
  const voucher = await prisma.voucher.findUnique({ where: { code } });
  if (!voucher) throw { status: 404, message: 'Voucher không tồn tại' };
  return voucher;
}

function calculateDiscount(voucher, orderAmount) {
  const amount = Number(orderAmount);
  let discount = 0;

  if (voucher.discountType === 'percent') {
    discount = (amount * Number(voucher.discountValue)) / 100;
    if (voucher.maxDiscount) {
      discount = Math.min(discount, Number(voucher.maxDiscount));
    }
  } else {
    discount = Number(voucher.discountValue);
  }

  return Math.min(discount, amount);
}

async function validateAndApply(code, orderAmount) {
  const voucher = await getByCode(code);
  const now = new Date();

  if (!voucher.isActive) {
    throw { status: 400, message: 'Voucher đã ngừng hoạt động' };
  }
  if (voucher.expiresAt && voucher.expiresAt < now) {
    throw { status: 400, message: 'Voucher đã hết hạn' };
  }
  if (voucher.quantity > 0 && voucher.usedCount >= voucher.quantity) {
    throw { status: 400, message: 'Voucher đã hết lượt sử dụng' };
  }
  if (Number(orderAmount) < Number(voucher.minOrderAmount)) {
    throw {
      status: 400,
      message: `Đơn hàng tối thiểu ${Number(voucher.minOrderAmount).toLocaleString()}đ để dùng voucher này`,
    };
  }

  const discountAmount = calculateDiscount(voucher, orderAmount);
  return { voucher, discountAmount };
}

async function create(data) {
  const { code, description, discount_type, discount_value, min_order_amount, max_discount, quantity, expires_at } = data;
  return prisma.voucher.create({
    data: {
      code: code.toUpperCase().trim(),
      description,
      discountType: discount_type,
      discountValue: discount_value,
      minOrderAmount: min_order_amount || 0,
      maxDiscount: max_discount || null,
      quantity: quantity || 0,
      expiresAt: expires_at ? new Date(expires_at) : null,
    },
  });
}

async function update(id, data) {
  const { description, discount_type, discount_value, min_order_amount, max_discount, quantity, expires_at, is_active } = data;
  try {
    return await prisma.voucher.update({
      where: { id: Number(id) },
      data: {
        description,
        discountType: discount_type,
        discountValue: discount_value,
        minOrderAmount: min_order_amount,
        maxDiscount: max_discount || null,
        quantity,
        expiresAt: expires_at ? new Date(expires_at) : null,
        isActive: is_active,
      },
    });
  } catch {
    throw { status: 404, message: 'Voucher không tồn tại' };
  }
}

async function remove(id) {
  try {
    await prisma.voucher.delete({ where: { id: Number(id) } });
  } catch {
    throw { status: 404, message: 'Voucher không tồn tại' };
  }
}

module.exports = {
  list,
  listAvailable,
  getByCode,
  validateAndApply,
  create,
  update,
  remove,
};