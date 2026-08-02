const express = require('express');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { validate } = require('../middleware/validate');
const { barrioSchema } = require('../schemas/directorio');

const router = express.Router();

router.get('/', async (req, res) => {
  const barrios = await prisma.barrio.findMany({ orderBy: { nombre: 'asc' } });
  res.json(barrios);
});

router.post('/', validate(barrioSchema), async (req, res) => {
  const barrio = await prisma.barrio.create({
    data: { ...req.body, api_key: crypto.randomBytes(24).toString('hex') },
  });
  res.status(201).json(barrio);
});

router.put('/:id', validate(barrioSchema), async (req, res) => {
  const barrio = await prisma.barrio.update({
    where: { id_barrio: Number(req.params.id) },
    data: req.body,
  });
  res.json(barrio);
});

router.delete('/:id', async (req, res) => {
  await prisma.barrio.delete({ where: { id_barrio: Number(req.params.id) } });
  res.status(204).end();
});

// Pide al backend del barrio la lista completa de usuarios con DNI y
// reemplaza sus asociaciones aca. Se usa para el alta inicial (antes de que
// el barrio haya empezado a avisar altas/bajas por su cuenta via webhook).
router.post('/:id/sincronizar', async (req, res) => {
  const barrio = await prisma.barrio.findUnique({ where: { id_barrio: Number(req.params.id) } });
  if (!barrio) return res.status(404).json({ error: 'Barrio no encontrado' });

  let usuarios;
  try {
    const respuesta = await fetch(`${barrio.url}/api/directorio/export`, {
      headers: { 'x-api-key': barrio.api_key },
      signal: AbortSignal.timeout(15000),
    });
    if (!respuesta.ok) {
      return res.status(502).json({ error: `El barrio respondio ${respuesta.status}. Revisa que tenga configurado CONECTOR_API_KEY con esta misma clave.` });
    }
    ({ usuarios } = await respuesta.json());
  } catch (err) {
    return res.status(502).json({ error: `No se pudo contactar al barrio: ${err.message}` });
  }

  await prisma.$transaction([
    prisma.usuarioBarrio.deleteMany({ where: { id_barrio: barrio.id_barrio } }),
    prisma.usuarioBarrio.createMany({
      data: usuarios.map((u) => ({ ...u, id_barrio: barrio.id_barrio })),
      skipDuplicates: true,
    }),
  ]);

  res.json({ sincronizados: usuarios.length });
});

module.exports = router;
