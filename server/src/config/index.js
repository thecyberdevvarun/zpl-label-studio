const path = require('path');

// Project root (…/QR-Label-Printer). When packaged as an .exe the data folder
// sits next to the executable instead, because the exe's own files are read-only.
const baseDir = process.pkg ? path.dirname(process.execPath) : path.join(__dirname, '..', '..', '..');

module.exports = {
  PORT: Number(process.env.PORT) || 3001,
  // All saved data (printers, templates, settings) lives in this folder as JSON files.
  DATABASE_DIR: process.env.DATABASE_DIR || path.join(baseDir, 'database'),
  SOCKET_TIMEOUT_MS: 8000, // max time to connect to a printer
  DRAIN_DELAY_MS: 300, // let the printer receive all data before closing
};
