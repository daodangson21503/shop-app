const service = require('./order.service');

async function create(req, res, next) {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

async function listAll(req, res, next) {
  try {
    const data = await service.listAll();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const data = await service.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const data = await service.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function getMyOrders(req, res, next) {
  try {
    const data = await service.getByUserId(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function cancelOrder(req, res, next) {
  try {
    const data = await service.cancelOrder(req.params.id, req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}
module.exports = { create, listAll, getById, updateStatus, getMyOrders, cancelOrder };