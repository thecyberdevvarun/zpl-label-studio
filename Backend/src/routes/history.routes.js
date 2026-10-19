const { Router } = require('express');
const c = require('../controllers/history.controller');

const router = Router();
router.get('/', c.list);
router.post('/', c.add);
router.delete('/', c.clear);

module.exports = router;
