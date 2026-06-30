const router = require('express').Router();
const prisma = require('../../config/db');
const { authRequired, adminOnly } = require('../../middlewares/auth.middleware');

router.get('/stats', authRequired, adminOnly, async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Doanh thu hôm nay / tuần / tháng (chỉ tính đơn completed)
    const [todayRevenue, weekRevenue, monthRevenue, totalOrders, totalProducts, totalCustomers] =
      await Promise.all([
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { createdAt: { gte: todayStart }, status: { not: 'cancelled' } },
        }),
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { createdAt: { gte: weekStart }, status: { not: 'cancelled' } },
        }),
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { createdAt: { gte: monthStart }, status: { not: 'cancelled' } },
        }),
        prisma.order.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.user.count({ where: { role: 'customer' } }),
      ]);

    // Doanh thu 7 ngày gần nhất (cho biểu đồ)
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const result = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: dayStart, lt: dayEnd },
          status: { not: 'cancelled' },
        },
      });

      dailyRevenue.push({
        date: dayStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: Number(result._sum.totalAmount || 0),
      });
    }

    // Top 5 sản phẩm bán chạy
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProducts = topProductsRaw.map(item => ({
      name: item.productName,
      soldQuantity: item._sum.quantity,
      revenue: Number(item._sum.subtotal),
    }));

    // Đơn hàng theo trạng thái
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    res.json({
      success: true,
      data: {
        revenue: {
          today: Number(todayRevenue._sum.totalAmount || 0),
          week: Number(weekRevenue._sum.totalAmount || 0),
          month: Number(monthRevenue._sum.totalAmount || 0),
        },
        totalOrders,
        totalProducts,
        totalCustomers,
        dailyRevenue,
        topProducts,
        ordersByStatus: ordersByStatus.map(s => ({ status: s.status, count: s._count.id })),
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;