-- AlterTable
ALTER TABLE "barrio" ADD COLUMN "api_key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "barrio_api_key_key" ON "barrio"("api_key");
