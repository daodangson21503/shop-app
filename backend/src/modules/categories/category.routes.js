const router = require('express').Router();
const prisma = require('../../config/db');
const { authRequired, adminOnly } = require('../../middlewares/auth.middleware');

// GET tất cả danh mục (public - ai cũng xem được)
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
});

// POST tạo danh mục mới (admin only)
router.post('/', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên và slug' });
    }
    const category = await prisma.category.create({ data: { name, slug } });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Slug đã tồn tại, vui lòng chọn slug khác' });
    }
    next(err);
  }
});

// PUT sửa danh mục (admin only)
router.put('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: { name },
    });
    res.json({ success: true, data: category });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    next(err);
  }
});

// DELETE xóa danh mục (admin only) - chỉ xóa nếu không còn sản phẩm nào
router.delete('/:id', authRequired, adminOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa, vẫn còn ${productCount} sản phẩm thuộc danh mục này`,
      });
    }
    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: 'Đã xóa danh mục' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }
    next(err);
  }
});

module.exports = router;