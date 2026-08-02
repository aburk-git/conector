const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const barrioSchema = z.object({
  nombre: z.string().min(1),
  subdominio: z.string().min(1),
  url: z.string().url(),
  activo: z.boolean().optional(),
});

const asociacionSchema = z.object({
  dni: z.string().min(1),
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  id_barrio: z.number().int(),
});

const buscarSchema = z.object({
  dni: z.string().min(1),
});

const webhookSchema = z.object({
  dni: z.string().min(1).max(20),
  nombre: z.string().max(100).optional(),
  apellido: z.string().max(100).optional(),
  activo: z.boolean().optional(),
});

module.exports = { loginSchema, barrioSchema, asociacionSchema, buscarSchema, webhookSchema };
