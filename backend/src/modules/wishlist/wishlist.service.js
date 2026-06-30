const prisma = require('../../config/db');

async function getByUser(userId) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function add(userId, productId) {
  return prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId: Number(productId) } },
    update: {},
    create: { userId, productId: Number(productId) },
  });
}

async function remove(userId, productId) {
  await prisma.wishlist.deleteMany({
    where: { userId, productId: Number(productId) },
  });
}

module.exports = { getByUser, add, remove };