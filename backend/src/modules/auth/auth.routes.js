const router = require('express').Router();
const controller = require('./auth.controller');
const { authRequired } = require('../../middlewares/auth.middleware');

router.post('/login', controller.login);
router.get('/me', authRequired, (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = router;