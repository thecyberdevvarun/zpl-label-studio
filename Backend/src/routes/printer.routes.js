const { Router } = require('express');
const c = require('../controllers/printer.controller');

const router = Router();
router.get('/', c.list);
router.post('/', c.create);
router.post('/status', c.checkStatus);
router.put('/selected', c.select); // must come before '/:id'
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
