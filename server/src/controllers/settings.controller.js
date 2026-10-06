const { parseSettings } = require('../utils/validators');
const settings = require('../repositories/settings.repository');

exports.get = async (req, res, next) => {
  try {
    res.json(await settings.get());
  } catch (err) {
    next(err);
  }
};

exports.save = async (req, res, next) => {
  try {
    res.json(await settings.save(parseSettings(req.body)));
  } catch (err) {
    next(err);
  }
};
