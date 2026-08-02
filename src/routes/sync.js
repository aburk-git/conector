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
    await prisma.usuarioBarrio.deleteMany({ where: { dni, id_barrio: barrio.id_barrio } });
    return res.json({ ok: true, accion: 'eliminado' });
  }

  await prisma.usuarioBarrio.upsert({
    where: { dni_id_barrio: { dni, id_barrio: barrio.id_barrio } },
    update: { nombre, apellido },
    create: { dni, nombre, apellido, id_barrio: barrio.id_barrio },
  });
  res.json({ ok: true, accion: 'actualizado' });
});

module.exports = router;
