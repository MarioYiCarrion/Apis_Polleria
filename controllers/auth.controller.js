const db = require('../db');

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

    // Comparar la contraseña en texto plano
    if (usuario.contraseña !== contraseña) {
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

  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
