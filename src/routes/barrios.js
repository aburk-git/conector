const express = require('express');
const prisma = require('../lib/prisma');
const { validate } = require('../middleware/validate');
const { barrioSchema } = require('../schemas/directorio');

const router = express.Router();

router.get('/', async (req, res) => {
  const barrios = await prisma.barrio.findMany({ orderBy: { nombre: 'asc' } });
  res.json(barrios);
});

router.post('/', validate(barrioSchema), async (req, res) => {
  const barrio = await prisma.barrio.create({ data: req.body });
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

module.exports = router;
