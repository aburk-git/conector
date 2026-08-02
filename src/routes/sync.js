const express = require('express');
const rateLimit = require('express-rate-limit');
const prisma = require('../lib/prisma');
const { validate } = require('../middleware/validate');
const { webhookSchema } = require('../schemas/directorio');

const router = express.Router();

const limitadorWebhook = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// Lo llama el backend de un barrio cada vez que un usuario con DNI se crea,
// edita o cambia de estado. Se identifica con su propia api_key (no hay JWT
// de admin aca: es trafico servidor-a-servidor).
router.post('/webhook', limitadorWebhook, validate(webhookSchema), async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Falta x-api-key' });

  const barrio = await prisma.barrio.findUnique({ where: { api_key: apiKey } });
  if (!barrio) return res.status(401).json({ error: 'api_key invalida' });

  const { dni, nombre, apellido, activo } = req.body;

  if (activo === false) {
    // Se mantiene el registro (marcado inactivo) en vez de borrarlo: queda
    // visible en el panel quien tuvo acceso y se le dio de baja. /buscar solo
    // trae activo=true, asi que deja de poder entrar a la app igual.
    await prisma.usuarioBarrio.updateMany({ where: { dni, id_barrio: barrio.id_barrio }, data: { activo: false } });
    return res.json({ ok: true, accion: 'marcado_inactivo' });
  }

  await prisma.usuarioBarrio.upsert({
    where: { dni_id_barrio: { dni, id_barrio: barrio.id_barrio } },
    update: { nombre, apellido, activo: true },
    create: { dni, nombre, apellido, id_barrio: barrio.id_barrio, activo: true },
  });
  res.json({ ok: true, accion: 'actualizado' });
});

module.exports = router;
