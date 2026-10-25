
const jwt = require('jsonwebtoken');

// Comprobar si el usuario tiene un token válido
function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || '';

  if (!encabezado.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token no proporcionado'
    });
  }

  const token = encabezado.slice(7);

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = datos;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o vencido'
    });
  }
}

module.exports = verificarToken;
