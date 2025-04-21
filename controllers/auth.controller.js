const db = require('../db');
const bcrypt = require('bcryptjs'); // Solo si las contraseñas están encriptadas

exports.login = async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
  }

  try {
    const [results] = await db.query('SELECT * FROM usuario WHERE correo = ?', [correo]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = results[0];

    // Si las contraseñas están en texto plano (NO recomendado en producción):
    // if (usuario.contraseña !== contraseña) {
    //   return res.status(401).json({ message: 'Contraseña incorrecta' });
    // }

    // Si las contraseñas están encriptadas:
    bcrypt.compare(contraseña, usuario.contraseña, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Error al verificar la contraseña' });

      if (!isMatch) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }

      // Si la contraseña es correcta, retornar los datos del usuario
      res.json({
        message: 'Login exitoso',
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol
        }
      });
    });

  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
