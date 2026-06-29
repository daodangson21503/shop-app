const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 401, message: 'Invalid credentials' };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw { status: 401, message: 'Invalid credentials' };

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  return { token, user: { id: user.id, full_name: user.fullName, role: user.role } };
}

async function register(fullName, email, password) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw { status: 400, message: 'Email đã được sử dụng' };

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { fullName, email, passwordHash, role: 'customer' },
  });
  return { id: user.id, email: user.email, fullName: user.fullName };
}

module.exports = { login, register };