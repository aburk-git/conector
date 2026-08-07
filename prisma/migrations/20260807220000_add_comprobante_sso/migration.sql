-- CreateTable
CREATE TABLE "comprobante_sso" (
    "jti" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "id_barrio_origen" INTEGER NOT NULL,
    "expira" TIMESTAMP(3) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comprobante_sso_pkey" PRIMARY KEY ("jti")
);

-- CreateTable
CREATE TABLE "comprobante_sso_uso" (
    "id" SERIAL NOT NULL,
    "jti" TEXT NOT NULL,
    "id_barrio" INTEGER NOT NULL,
    "fecha_canje" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comprobante_sso_uso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comprobante_sso_dni_idx" ON "comprobante_sso"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "comprobante_sso_uso_jti_id_barrio_key" ON "comprobante_sso_uso"("jti", "id_barrio");

-- AddForeignKey
ALTER TABLE "comprobante_sso_uso" ADD CONSTRAINT "comprobante_sso_uso_jti_fkey" FOREIGN KEY ("jti") REFERENCES "comprobante_sso"("jti") ON DELETE RESTRICT ON UPDATE CASCADE;
