const { Router } = require('express');
const printRoutes = require('./print.routes');
const printerRoutes = require('./printer.routes');
const templateRoutes = require('./template.routes');
const settingsRoutes = require('./settings.routes');
const historyRoutes = require('./history.routes');

const router = Router();
router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/print', printRoutes);
router.use('/printers', printerRoutes);
router.use('/templates', templateRoutes);
router.use('/settings', settingsRoutes);
router.use('/history', historyRoutes);

module.exports = router;
