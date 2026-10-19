const { Router } = require('express');
const c = require('../controllers/template.controller');

const router = Router();
router.get('/', c.list);
router.post('/', c.save);
router.patch('/:id/printed', c.markPrinted);
router.delete('/:id', c.remove);

module.exports = router;
