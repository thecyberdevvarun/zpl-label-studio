const { parsePrinter, parseSerial, parseLabelConfig } = require('../utils/validators');
const { buildLabel } = require('../services/zpl.service');
const { sendToPrinter } = require('../services/printer.service');

// POST /api/print/label  { printer: {host, port}, serial, label? }
async function printLabel(req, res, next) {
  try {
    const printer = parsePrinter(req.body.printer);
    const serial = parseSerial(req.body.serial);
    const label = parseLabelConfig(req.body.label);

    await sendToPrinter(printer, buildLabel(serial, label).zpl);
    res.json({ ok: true, serial });
  } catch (err) {
    next(err);
  }
}

// POST /api/print/preview  { serial, label? }  → the ZPL that would be sent + the layout it uses
function previewZpl(req, res, next) {
  try {
    const serial = parseSerial(req.body.serial);
    const label = parseLabelConfig(req.body.label);
    res.json(buildLabel(serial, label));
  } catch (err) {
    next(err);
  }
}

module.exports = { printLabel, previewZpl };
