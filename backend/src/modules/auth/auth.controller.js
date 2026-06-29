const authService = require('./auth.service');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;
    const data = await authService.register(fullName, email, password);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = { login, register };