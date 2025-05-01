const express = require('express');
const router = express.Router();
const stockbajoController = require('../controllers/stockbajo.controller');

// Definir la ruta para obtener productos con stock bajo
router.get('/stock-bajo', stockbajoController.getProductosStockBajo);

module.exports = router;