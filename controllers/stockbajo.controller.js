const db = require('../db');

exports.getProductosStockBajo = async (req, res) => {
    try {
      const [rows, fields] = await db.query('SELECT * FROM productos_con_stock_bajo');  // Usamos await para la consulta
      res.json(rows);  // Devuelve los resultados en formato JSON
    } catch (err) {
      console.error('Error al ejecutar la consulta:', err);
      res.status(500).send('Error en la consulta');
    }
  };