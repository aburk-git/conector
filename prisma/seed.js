require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/lib/prisma');

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@debarrios.com.ar';
  const password = process.env.SEED_ADMIN_PASSWORD || 'cambiar123';

  const existente = await prisma.adminUsuario.findUnique({ where: { email } });
  if (existente) {
    console.log(`Ya existe un admin con email ${email}`);
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);
  await prisma.adminUsuario.create({
    data: { nombre: 'Administrador', email, password_hash },
  });

  console.log(`Admin creado: ${email} / ${password}`);
}

main()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect());
