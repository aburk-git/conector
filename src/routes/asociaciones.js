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

router.delete('/:id', async (req, res) => {
  await prisma.usuarioBarrio.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});

module.exports = router;
