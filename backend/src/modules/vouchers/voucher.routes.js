const router = require('express').Router();
const controller = require('./voucher.controller');
const { authRequired, adminOnly } = require('../../middlewares/auth.middleware');

router.get('/available', controller.listAvailable);
router.post('/validate', authRequired, controller.validate);

router.get('/', authRequired, adminOnly, controller.list);
router.post('/', authRequired, adminOnly, controller.create);
router.put('/:id', authRequired, adminOnly, controller.update);
router.delete('/:id', authRequired, adminOnly, controller.remove);

module.exports = router;