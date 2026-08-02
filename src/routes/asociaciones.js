const express = require('express');
const prisma = require('../lib/prisma');
const { validate } = require('../middleware/validate');
const { asociacionSchema } = require('../schemas/directorio');

const router = express.Router();

// Listado para el panel, con filtro opcional por dni
router.get('/', async (req, res) => {
  const { dni } = req.query;
  const asociaciones = await prisma.usuarioBarrio.findMany({
    where: dni ? { dni: String(dni) } : undefined,
    include: { barrio: true },
    orderBy: { fecha_creacion: 'desc' },
  });
  res.json(asociaciones);
});

router.post('/', validate(asociacionSchema), async (req, res) => {
  const asociacion = await prisma.usuarioBarrio.create({ data: req.body });
  res.status(201).json(asociacion);
});

// Alta/baja manual, para barrios que todavia no tienen configurado el aviso
// automatico (CONECTOR_URL/CONECTOR_API_KEY).
router.patch('/:id/estado', async (req, res) => {
  const { activo } = req.body;
  if (typeof activo !== 'boolean') {
    return res.status(400).json({ error: 'activo debe ser true o false' });
  }
  const asociacion = await prisma.usuarioBarrio.update({
    where: { id: Number(req.params.id) },
    data: { activo },
  });
  res.json(asociacion);
});

router.delete('/:id', async (req, res) => {
  await prisma.usuarioBarrio.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});

module.exports = router;
