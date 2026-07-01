const service = require('./review.service');

async function getByProduct(req, res, next) {
  try {
    const data = await service.getByProduct(req.params.productId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { product_id, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating phải từ 1-5' });
    }
    const data = await service.create(req.user.id, product_id, rating, comment);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.user.id, req.params.id);
    res.json({ success: true, message: 'Đã xóa đánh giá' });
  } catch (err) { next(err); }
}

module.exports = { getByProduct, create, remove };