const router = require('express').Router();
const path = require('path');
const { authRequired, adminOnly } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');

router.post(
  '/image',
  authRequired,
  adminOnly,
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ success: true, data: { url } });
  }
);

module.exports = router;