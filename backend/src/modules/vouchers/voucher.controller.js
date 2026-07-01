const service = require('./voucher.service');

async function list(req, res, next) {
  try {
    const data = await service.list();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function listAvailable(req, res, next) {
  try {
    const orderAmount = req.query.orderAmount || 0;
    const data = await service.listAvailable(orderAmount);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function validate(req, res, next) {
  try {
    const { code, orderAmount } = req.body;
    const data = await service.validateAndApply(code, orderAmount);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const data = await service.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
}

module.exports = { list, listAvailable, validate, create, update, remove };