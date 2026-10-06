const db = require('../services/database.service');

const FILE = 'settings';

// Returns {} when nothing has been saved yet; the client fills in defaults.
exports.get = () => db.read(FILE, {});

exports.save = async (settings) => {
  await db.replace(FILE, settings);
  return settings;
};
