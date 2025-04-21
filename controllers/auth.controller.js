const db = require('../db');
const bcrypt = require('bcryptjs'); // Solo si las contraseñas están encriptadas

exports.login = (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
  }

  const sql = 'SELECT * FROM usuario WHERE correo = ?';
  db.query(sql, [correo], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = results[0];

    // Si las contraseñas están en texto plano (NO recomendado en producción):
    if (usuario.contraseña !== contraseña) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Si estuvieran encriptadas, usar:
    // bcrypt.compare(contraseña, usuario.contraseña, (err, isMatch) => {
    //   if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });
    //   // continuar...
    // });

    // Si todo está bien, retornar los datos necesarios del usuario
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
};
