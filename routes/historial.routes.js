const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historial.controller');

// GET con parámetros por query
router.get('/', historialController.obtenerHistorial);
router.get('/excel', historialController.descargarHistorialExcel);

module.exports = router;
