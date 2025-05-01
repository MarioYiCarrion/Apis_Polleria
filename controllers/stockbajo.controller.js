const db = require('../db');

exports.getProductosStockBajo = (req, res) => {
    const query = 'SELECT * FROM productos_con_stock_bajo';  // La vista que creaste
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al ejecutar la consulta:', err);
        return res.status(500).send('Error en la consulta');
      }
      res.json(results);  // Devuelve los resultados en formato JSON
    });
  };