const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM producto');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM producto WHERE id = ?', [req.params.id]);
    if (results.length === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const [result] = await db.query('INSERT INTO producto SET ?', [req.body]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    await db.query('UPDATE producto SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ message: 'Actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM producto WHERE id = ?', [req.params.id]);
    res.json({ message: 'Eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByTipo = async (req, res) => {
  try {
    const tipo = req.params.tipo;  // Tipo de producto que pasas como parámetro
    const [results] = await db.query(`
      SELECT p.id, p.nombre, tp.nombre AS tipo_producto, p.unidad_medida_id
      FROM producto p
      JOIN tipoproducto tp ON p.tipo_producto_id = tp.id
      WHERE tp.nombre = ?
    `, [tipo]);

    if (results.length === 0) return res.status(404).json({ message: 'No se encontraron productos de este tipo' });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};