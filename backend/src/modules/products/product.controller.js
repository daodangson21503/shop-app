const service = require('./product.service');

async function list(req, res, next) {
  try {
    const data = await service.list(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function detail(req, res, next) {
  try {
    const data = await service.getBySlug(req.params.slug);
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

module.exports = { list, detail, create, update, remove };