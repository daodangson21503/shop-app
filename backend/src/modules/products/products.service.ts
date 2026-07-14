import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async list(query: { search?: string; category?: string; page?: number; limit?: number; sort?: string; featured?: string }) {
    const { search, category, page = 1, limit = 12, sort, featured } = query;
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where: any = {
      isActive: true,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(category && { categoryId: Number(category) }),
      ...(featured === 'true' && { isFeatured: true }),
    };

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'sold') orderBy = { soldCount: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        take,
        skip,
        include: {
          _count: { select: { reviews: true } },
          reviews: { select: { rating: true } },
          attributes: { orderBy: { sortOrder: 'asc' } },
          images: { orderBy: { sortOrder: 'asc' } },
          category: { select: { name: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const mapped = products.map((p) => {
      const { reviews, _count, category, ...rest } = p;
      const avgRating = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      return {
        ...rest,
        categoryName: category?.name || null,
        avgRating: Number(avgRating.toFixed(1)),
        reviewCount: _count.reviews,
      };
    });

    return {
      products: mapped,
      total,
      totalPages: Math.ceil(total / take),
    };
  }

  async getBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
        attributes: { orderBy: { sortOrder: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
        category: { select: { name: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Increment view count
    await this.prisma.product.update({
      where: { id: product.id },
      data: { views: { increment: 1 } },
    });

    const { reviews, _count, category, ...rest } = product;
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return {
      ...rest,
      categoryName: category?.name || null,
      avgRating: Number(avgRating.toFixed(1)),
      reviewCount: _count.reviews,
    };
  }

  async create(data: any) {
    const { name, slug, description, price, originalPrice, stock, image_url, category_id, attributes, images, brand, weight, unit, warranty, isFeatured, isActive } = data;
    return this.prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        stock: Number(stock),
        imageUrl: image_url,
        categoryId: category_id ? Number(category_id) : null,
        brand,
        weight: weight ? Number(weight) : undefined,
        unit: unit || 'cái',
        warranty,
        isFeatured: isFeatured ?? undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        ...(attributes?.length ? {
          attributes: {
            create: attributes.map((attr: any, idx: number) => ({
              name: attr.name,
              value: attr.value,
              sortOrder: attr.sortOrder ?? idx,
            })),
          },
        } : {}),
        ...(images?.length ? {
          images: {
            create: images.map((img: any, idx: number) => ({
              url: img.url,
              alt: img.alt || name,
              sortOrder: img.sortOrder ?? idx,
            })),
          },
        } : {}),
      },
      include: {
        attributes: { orderBy: { sortOrder: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async update(id: number, data: any) {
    const { name, description, price, originalPrice, stock, image_url, category_id, attributes, images, brand, weight, unit, warranty, isFeatured, isActive } = data;
    try {
      if (attributes !== undefined) {
        await this.prisma.productAttribute.deleteMany({ where: { productId: Number(id) } });
      }
      if (images !== undefined) {
        await this.prisma.productImage.deleteMany({ where: { productId: Number(id) } });
      }

      const updateData: any = {
        name,
        description,
        price: price ? Number(price) : undefined,
        originalPrice: originalPrice !== undefined ? Number(originalPrice) : undefined,
        stock: stock !== undefined ? Number(stock) : undefined,
        imageUrl: image_url,
        categoryId: category_id ? Number(category_id) : null,
        brand,
        weight: weight !== undefined ? Number(weight) : undefined,
        unit,
        warranty,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      };

      if (attributes?.length) {
        updateData.attributes = {
          create: attributes.map((attr: any, idx: number) => ({
            name: attr.name,
            value: attr.value,
            sortOrder: attr.sortOrder ?? idx,
          })),
        };
      }

      if (images?.length) {
        updateData.images = {
          create: images.map((img: any, idx: number) => ({
            url: img.url,
            alt: img.alt || name,
            sortOrder: img.sortOrder ?? idx,
          })),
        };
      }

      return await this.prisma.product.update({
        where: { id: Number(id) },
        data: updateData,
        include: {
          attributes: { orderBy: { sortOrder: 'asc' } },
          images: { orderBy: { sortOrder: 'asc' } },
        },
      });
    } catch {
      throw new NotFoundException('Product not found');
    }
  }

  async remove(id: number) {
    await this.prisma.product.update({
      where: { id: Number(id) },
      data: { isActive: false },
    });
    return { message: 'Deleted' };
  }
}
