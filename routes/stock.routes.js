const express = require('express');
const router = express.Router();
const controller = require('../controllers/stock.controller');

router.get('/', controller.getAll);
router.get('/exportar-excel', controller.exportStockToExcel);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove)


module.exports = router;
