const router = require('express').Router();
const pool = require('../../config/db');

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

module.exports = router;