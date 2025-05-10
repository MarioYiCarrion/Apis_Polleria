const db = require('../db');

exports.login = async (req, res) => {
  const { correo, contrasena, origen } = req.body; // origen = 'web' o 'app'

  if (!correo || !contrasena || !origen) {
    return res.status(400).json({ message: 'Correo, contraseña y origen son requeridos' });
  }

  try {
    const [results] = await db.query('SELECT * FROM usuario WHERE correo = ?', [correo]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = results[0];

    if (usuario.contrasena !== contrasena) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Verifica si el rol permite acceder desde el origen especificado
    const rol = usuario.rol.toLowerCase();
    const origenValido = (rol === 'ambos') || (rol === origen);

    if (!origenValido) {
      return res.status(403).json({ message: 'Acceso denegado desde esta plataforma' });
    }

    res.json({
      message: 'Login exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
