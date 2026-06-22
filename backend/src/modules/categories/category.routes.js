const router = require('express').Router();
const prisma = require('../../config/db');

router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { id: 'asc' } });
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
});

module.exports = router;