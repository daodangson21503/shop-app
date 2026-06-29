const router = require('express').Router();
const controller = require('./order.controller');
const { authRequired, adminOnly } = require('../../middlewares/auth.middleware');

router.post('/', controller.create); // khách đặt hàng - không cần login
router.get('/my-orders', authRequired, controller.getMyOrders);
router.get('/', authRequired, adminOnly, controller.listAll); // chỉ admin xem tất cả đơn
router.get('/:id', authRequired, adminOnly, controller.getById);
router.patch('/:id/status', authRequired, adminOnly, controller.updateStatus);

module.exports = router;