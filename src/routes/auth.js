const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const prisma = require('../lib/prisma');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { loginSchema, cambiarPasswordSchema } = require('../schemas/directorio');

const router = express.Router();

const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Proba de nuevo en unos minutos.' },
});

// Login del panel de administracion de CONECTOR (no tiene nada que ver con
// el login de los usuarios finales dentro de cada barrio).
router.post('/login', limitadorLogin, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const admin = await prisma.adminUsuario.findUnique({ where: { email } });
  if (!admin) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }

  const passwordValida = await bcrypt.compare(password, admin.password_hash);
  if (!passwordValida) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }

  const token = jwt.sign(
    { id_admin: admin.id_admin, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' },
  );

  res.json({ token, admin: { id_admin: admin.id_admin, nombre: admin.nombre, email: admin.email } });
});

router.patch('/password', requireAuth, validate(cambiarPasswordSchema), async (req, res) => {
  const { password_actual, password_nueva } = req.body;

  const admin = await prisma.adminUsuario.findUnique({ where: { id_admin: req.admin.id_admin } });
  const passwordValida = await bcrypt.compare(password_actual, admin.password_hash);
  if (!passwordValida) {
    return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
  }

  const password_hash = await bcrypt.hash(password_nueva, 10);
  await prisma.adminUsuario.update({ where: { id_admin: admin.id_admin }, data: { password_hash } });

  res.json({ ok: true });
});

module.exports = router;
