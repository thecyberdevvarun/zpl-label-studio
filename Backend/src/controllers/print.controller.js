const { parsePrinter, parseSerial, parseLabelConfig } = require('../utils/validators');
const { DEFAULT_LABEL, buildLabel } = require('../services/zpl.service');
const { sendToPrinter } = require('../services/printer.service');

// Text-only labels don't carry a serial number.
const isTextOnly = (label) => (label.codeType ?? DEFAULT_LABEL.codeType) === 'text';

// POST /api/print/label  { printer: {host, port}, serial, label? }
async function printLabel(req, res, next) {
  try {
    const printer = parsePrinter(req.body.printer);
    const label = parseLabelConfig(req.body.label);
    const serial = isTextOnly(label) ? '' : parseSerial(req.body.serial);

    await sendToPrinter(printer, buildLabel(serial, label).zpl);
    res.json({ ok: true, serial });
  } catch (err) {
    next(err);
  }
}

// POST /api/print/preview  { serial, label? }  → the ZPL that would be sent + the layout it uses
function previewZpl(req, res, next) {
  try {
    const label = parseLabelConfig(req.body.label);
    const serial = isTextOnly(label) ? '' : parseSerial(req.body.serial);
    res.json(buildLabel(serial, label));
  } catch (err) {
    next(err);
  }
}

module.exports = { printLabel, previewZpl };
