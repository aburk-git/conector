const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const prisma = require('../lib/prisma');
const { validate } = require('../middleware/validate');
const { ssoEmitirSchema, ssoCanjearSchema } = require('../schemas/directorio');

const router = express.Router();

// Mismo criterio que /api/sync/webhook: es trafico servidor-a-servidor, cada
// barrio se identifica con su propia api_key, no hay JWT de admin aca.
const limitadorSso = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const VIGENCIA_MINUTOS = 2;

async function barrioPorApiKey(req) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return null;
  return prisma.barrio.findUnique({ where: { api_key: apiKey } });
}

// Lo llama el barrio de origen justo despues de validar la contraseña de un
// login (password correcta, DNI presente). Devuelve un comprobante corto que
// la app puede canjear en los demas barrios de ese mismo DNI para entrar sin
// pedir contraseña de nuevo. Si el DNI no tiene otros barrios activos, no
// tiene sentido emitir nada.
router.post('/emitir', limitadorSso, validate(ssoEmitirSchema), async (req, res) => {
  const barrioOrigen = await barrioPorApiKey(req);
  if (!barrioOrigen) return res.status(401).json({ error: 'api_key invalida' });

  const { dni } = req.body;

  const asociaciones = await prisma.usuarioBarrio.findMany({
    where: { dni, activo: true, id_barrio: { not: barrioOrigen.id_barrio }, barrio: { activo: true } },
    include: { barrio: true },
  });

  if (!asociaciones.length) {
    return res.json({ comprobante: null, otrosBarrios: [] });
  }

  const jti = crypto.randomUUID();
  const expira = new Date(Date.now() + VIGENCIA_MINUTOS * 60 * 1000);

  await prisma.comprobanteSso.create({
    data: { jti, dni, id_barrio_origen: barrioOrigen.id_barrio, expira },
  });

  const comprobante = jwt.sign({ dni, jti }, process.env.SSO_JWT_SECRET, { expiresIn: `${VIGENCIA_MINUTOS}m` });

  res.json({
    comprobante,
    otrosBarrios: asociaciones.map((a) => ({
      id_barrio: a.barrio.id_barrio,
      nombre: a.barrio.nombre,
      subdominio: a.barrio.subdominio,
      url: a.barrio.url,
    })),
  });
});

// Lo llama cada barrio destino para canjear el comprobante que le paso la
// app. Un mismo comprobante se puede canjear una vez por barrio (para poder
// entrar solo a TODOS los barrios del DNI con el mismo comprobante), pero no
// dos veces en el mismo barrio dentro de su ventana de validez.
router.post('/canjear', limitadorSso, validate(ssoCanjearSchema), async (req, res) => {
  const barrioDestino = await barrioPorApiKey(req);
  if (!barrioDestino) return res.status(401).json({ error: 'api_key invalida' });

  const { comprobante } = req.body;

  let payload;
  try {
    payload = jwt.verify(comprobante, process.env.SSO_JWT_SECRET);
  } catch {
    return res.status(401).json({ valido: false, error: 'Comprobante invalido o vencido' });
  }

  const fila = await prisma.comprobanteSso.findUnique({ where: { jti: payload.jti } });
  if (!fila || fila.dni !== payload.dni || fila.expira < new Date()) {
    return res.status(401).json({ valido: false, error: 'Comprobante invalido o vencido' });
  }

  const asociacion = await prisma.usuarioBarrio.findUnique({
    where: { dni_id_barrio: { dni: payload.dni, id_barrio: barrioDestino.id_barrio } },
  });
  if (!asociacion || !asociacion.activo) {
    return res.status(404).json({ valido: false, error: 'Ese DNI no tiene usuario activo en este barrio' });
  }

  try {
    await prisma.comprobanteSsoUso.create({ data: { jti: payload.jti, id_barrio: barrioDestino.id_barrio } });
  } catch {
    // Constraint unica [jti, id_barrio]: ya se habia canjeado en ESTE barrio antes.
    return res.status(409).json({ valido: false, error: 'Comprobante ya canjeado en este barrio' });
  }

  res.json({ valido: true, dni: payload.dni, nombre: asociacion.nombre, apellido: asociacion.apellido });
});

module.exports = router;
