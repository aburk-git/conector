function validate(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        error: 'Datos invalidos',
        detalles: resultado.error.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message })),
      });
    }
    req.body = resultado.data;
    next();
  };
}

module.exports = { validate };
