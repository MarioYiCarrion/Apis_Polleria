const express = require('express');
const router = express.Router();
const {
    obtenerHistorial,
    descargarHistorialExcel
} = require('../controllers/historialController');

router.get('/', obtenerHistorial);
router.get('/excel', descargarHistorialExcel);

module.exports = router;
