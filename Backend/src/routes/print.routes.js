const { Router } = require('express');
const { printLabel, previewZpl } = require('../controllers/print.controller');

const router = Router();
router.post('/label', printLabel);
router.post('/preview', previewZpl);

module.exports = router;
