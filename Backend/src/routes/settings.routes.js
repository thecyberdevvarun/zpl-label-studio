const { Router } = require('express');
const c = require('../controllers/settings.controller');

const router = Router();
router.get('/', c.get);
router.put('/', c.save);

module.exports = router;
