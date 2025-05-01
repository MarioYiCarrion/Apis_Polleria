const express = require('express');
const router = express.Router();
const controller = require('../controllers/producto.controller');



router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.get('/tipo/:tipoId', controller.getByTipo);
router.get('/stock-bajo', controller.getStockBajo);


module.exports = router;
