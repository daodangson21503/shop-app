const prisma = require('../../config/db');

async function list({ search, category, page = 1, limit = 12 }) {
  const take = Number(limit);
  const skip = (Number(page) - 1) * take;

  const where = {
    isActive: true,
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
    ...(category && { categoryId: Number(category) }),
  };

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
    skip,
    include: {
      _count: { select: { reviews: true } },
      reviews: { select: { rating: true } },
    },
  });

  return products.map((p) => {
    const { reviews, _count, ...rest } = p;
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    return {
      ...rest,
      avgRating: Number(avgRating.toFixed(1)),
      reviewCount: _count.reviews,
    };
  });
}

async function getBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      _count: { select: { reviews: true } },
      reviews: { select: { rating: true } },
    },
  });
  if (!product) throw { status: 404, message: 'Product not found' };

  const { reviews, _count, ...rest } = product;
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return {
    ...rest,
    avgRating: Number(avgRating.toFixed(1)),
    reviewCount: _count.reviews,
  };
}

async function create(data) {
  const { name, slug, description, price, stock, image_url, category_id } = data;
  return prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      stock,
      imageUrl: image_url,
      categoryId: category_id ? Number(category_id) : null,
    },
  });
}

async function update(id, data) {
  const { name, description, price, stock, image_url, category_id } = data;
  try {
    return await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price,
        stock,
        imageUrl: image_url,
        categoryId: category_id ? Number(category_id) : null,
      },
    });
  } catch {
    throw { status: 404, message: 'Product not found' };
  }
}

async function remove(id) {
  await prisma.product.update({
    where: { id: Number(id) },
    data: { isActive: false },
  });
}

module.exports = { list, getBySlug, create, update, remove };