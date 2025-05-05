const db = require('../db');

exports.login = async (req, res) => {
  const { correo, contrasena } = req.body;

if (!correo || !contrasena) {
  return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
}

try {
  const [results] = await db.query('SELECT * FROM usuario WHERE correo = ?', [correo]);

  if (results.length === 0) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  const usuario = results[0];

  // Comparar la contraseña
  if (usuario.contrasena !== contrasena) {
    return res.status(401).json({ message: 'Contraseña incorrecta' });
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
