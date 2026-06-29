const router = require('express').Router();
router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/products', require('../modules/products/product.routes'));
router.use('/orders', require('../modules/orders/order.routes'));
router.use('/categories', require('../modules/categories/category.routes'));
router.use('/upload',     require('../modules/upload/upload.routes'));
module.exports = router;