require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('./middleware/auth');
const authRouter = require('./routes/auth');
const barriosRouter = require('./routes/barrios');
const asociacionesRouter = require('./routes/asociaciones');
const buscarRouter = require('./routes/buscar');
const syncRouter = require('./routes/sync');

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

const limitadorGlobal = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 2000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limitadorGlobal);

// Limite propio y mas estricto para /buscar: es publico (sin token), asi que
// es el unico lugar por donde alguien podria intentar adivinar DNIs.
const limitadorBuscar = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authRouter);
app.use('/api/buscar', limitadorBuscar, buscarRouter);

app.use('/api/barrios', requireAuth, barriosRouter);
app.use('/api/asociaciones', requireAuth, asociacionesRouter);

// Sin requireAuth: se autentica sola con x-api-key (trafico servidor-a-servidor
// de cada barrio, no un usuario con sesion).
app.use('/api/sync', syncRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  res.status(500).json({ error: 'Ocurrio un error inesperado en el servidor' });
});

process.on('unhandledRejection', (err) => {
  console.error('Promesa no manejada:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Excepcion no capturada:', err);
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`CONECTOR escuchando en http://localhost:${port}`);
});
