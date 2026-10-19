const { parsePrinter, parsePrinterRecord, parseId } = require('../utils/validators');
const { checkConnection } = require('../services/printer.service');
const printers = require('../repositories/printers.repository');

const handle = (fn) => async (req, res, next) => {
  try {
    res.json(await fn(req));
  } catch (err) {
    next(err);
  }
};

// POST /api/printers/status  { printer: {host, port} }  — can this printer be reached?
exports.checkStatus = handle(async (req) => {
  const printer = parsePrinter(req.body.printer);
  await checkConnection(printer);
  return { online: true, ...printer };
});

// Saved printers (stored in database/printers.json)
exports.list = handle(() => printers.list());
exports.create = handle((req) => printers.create(parsePrinterRecord(req.body)));
exports.update = handle((req) => printers.update(parseId(req.params.id), parsePrinterRecord(req.body)));
exports.remove = handle((req) => printers.remove(parseId(req.params.id)));
exports.select = handle((req) => printers.select(parseId(req.body?.id)));
