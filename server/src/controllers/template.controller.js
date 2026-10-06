const { parseTemplate, parsePrintedRange, parseId } = require('../utils/validators');
const templates = require('../repositories/templates.repository');

const handle = (fn) => async (req, res, next) => {
  try {
    res.json(await fn(req));
  } catch (err) {
    next(err);
  }
};

exports.list = handle(() => templates.list());
exports.save = handle((req) => templates.upsert(parseTemplate(req.body)));
exports.remove = handle((req) => templates.remove(parseId(req.params.id)));
exports.markPrinted = handle((req) => templates.markPrinted(parseId(req.params.id), parsePrintedRange(req.body)));
