const router = require('express').Router();
const controller = require('./wishlist.controller');
const { authRequired } = require('../../middlewares/auth.middleware');

router.get('/', authRequired, controller.list);
router.post('/', authRequired, controller.add);
router.delete('/:productId', authRequired, controller.remove);

module.exports = router;