const { parseHistoryEntry } = require('../utils/validators');
const history = require('../repositories/history.repository');

const handle = (fn) => async (req, res, next) => {
  try {
    res.json(await fn(req));
  } catch (err) {
    next(err);
  }
};

exports.list = handle(() => history.list());
exports.add = handle((req) => history.add(parseHistoryEntry(req.body)));
exports.clear = handle(() => history.clear());
