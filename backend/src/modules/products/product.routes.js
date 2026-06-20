const router = require('express').Router();
const controller = require('./product.controller');
const { authRequired, adminOnly } = require('../../middlewares/auth.middleware');

router.get('/', controller.list);
router.get('/:slug', controller.detail);
router.post('/', authRequired, adminOnly, controller.create);
router.put('/:id', authRequired, adminOnly, controller.update);
router.delete('/:id', authRequired, adminOnly, controller.remove);

module.exports = router;