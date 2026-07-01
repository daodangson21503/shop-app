const prisma = require('../../config/db');

async function getByProduct(productId) {
  const reviews = await prisma.review.findMany({
    where: { productId: Number(productId) },
    include: { user: { select: { fullName: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return { reviews, avgRating: Math.round(avgRating * 10) / 10, count: reviews.length };
}

async function create(userId, productId, rating, comment) {
  // Kiểm tra user đã từng mua sản phẩm này chưa (optional, đơn giản hóa: chỉ check đã login)
  return prisma.review.upsert({
    where: { userId_productId: { userId, productId: Number(productId) } },
    update: { rating, comment },
    create: { userId, productId: Number(productId), rating, comment },
  });
}

async function remove(userId, reviewId) {
  await prisma.review.deleteMany({
    where: { id: Number(reviewId), userId },
  });
}

module.exports = { getByProduct, create, remove };