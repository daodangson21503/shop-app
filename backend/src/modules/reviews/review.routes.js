const router = require('express').Router();
const controller = require('./review.controller');
const { authRequired } = require('../../middlewares/auth.middleware');

router.get('/product/:productId', controller.getByProduct);
router.post('/', authRequired, controller.create);
router.delete('/:id', authRequired, controller.remove);

module.exports = router;