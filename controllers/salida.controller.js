const db = require('../db');

exports.getAll = (req, res) => {
  db.query('SELECT * FROM salida', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getById = (req, res) => {
  db.query('SELECT * FROM salida WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'No encontrado' });
    res.json(results[0]);
  });
};

exports.create = (req, res) => {
  db.query('INSERT INTO salida SET ?', req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...req.body });
  });
};

exports.update = (req, res) => {
  db.query('UPDATE salida SET ? WHERE id = ?', [req.body, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Actualizado correctamente' });
  });
};

exports.remove = (req, res) => {
  db.query('DELETE FROM salida WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Eliminado correctamente' });
  });
};
