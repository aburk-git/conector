const express = require('express');
const prisma = require('../lib/prisma');
const { validate } = require('../middleware/validate');
const { buscarSchema } = require('../schemas/directorio');

const router = express.Router();

// Endpoint publico que usa la app CELULAR: dado un DNI, devuelve los barrios
// (con su url) donde esa persona tiene usuario. No requiere auth porque es el
// primer paso, antes de que la app tenga token de ningun barrio.
router.post('/', validate(buscarSchema), async (req, res) => {
  const { dni } = req.body;

  const asociaciones = await prisma.usuarioBarrio.findMany({
    where: { dni, activo: true, barrio: { activo: true } },
    include: { barrio: true },
  });

  const barrios = asociaciones.map((a) => ({
    id_barrio: a.barrio.id_barrio,
    nombre: a.barrio.nombre,
    subdominio: a.barrio.subdominio,
    url: a.barrio.url,
  }));

  res.json({ barrios });
});

module.exports = router;
