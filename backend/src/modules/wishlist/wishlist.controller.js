const service = require('./wishlist.service');

async function list(req, res, next) {
  try {
    const data = await service.getByUser(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function add(req, res, next) {
  try {
    await service.add(req.user.id, req.body.product_id);
    res.json({ success: true, message: 'Đã thêm vào yêu thích' });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.user.id, req.params.productId);
    res.json({ success: true, message: 'Đã xóa khỏi yêu thích' });
  } catch (err) { next(err); }
}

module.exports = { list, add, remove };