-- CreateTable
CREATE TABLE "admin_usuario" (
    "id_admin" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_usuario_pkey" PRIMARY KEY ("id_admin")
);

-- CreateTable
CREATE TABLE "barrio" (
    "id_barrio" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "subdominio" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barrio_pkey" PRIMARY KEY ("id_barrio")
);

-- CreateTable
CREATE TABLE "usuario_barrio" (
    "id" SERIAL NOT NULL,
    "dni" TEXT NOT NULL,
    "nombre" TEXT,
    "apellido" TEXT,
    "id_barrio" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_barrio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_usuario_email_key" ON "admin_usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "barrio_subdominio_key" ON "barrio"("subdominio");

-- CreateIndex
CREATE INDEX "usuario_barrio_dni_idx" ON "usuario_barrio"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_barrio_dni_id_barrio_key" ON "usuario_barrio"("dni", "id_barrio");

-- AddForeignKey
ALTER TABLE "usuario_barrio" ADD CONSTRAINT "usuario_barrio_id_barrio_fkey" FOREIGN KEY ("id_barrio") REFERENCES "barrio"("id_barrio") ON DELETE RESTRICT ON UPDATE CASCADE;
