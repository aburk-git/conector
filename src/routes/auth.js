const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { validate } = require('../middleware/validate');
const { loginSchema } = require('../schemas/directorio');

const router = express.Router();

// Login del panel de administracion de CONECTOR (no tiene nada que ver con
// el login de los usuarios finales dentro de cada barrio).
router.post('/login', validate(loginSchema), async (req, res) => {
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

module.exports = router;
