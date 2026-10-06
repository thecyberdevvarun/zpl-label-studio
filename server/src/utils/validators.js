const HttpError = require('./HttpError');

const HOST_RE = /^[a-zA-Z0-9]([a-zA-Z0-9.-]{0,251}[a-zA-Z0-9])?$/;
// ^ and ~ are ZPL control characters, so they cannot appear in label data.
const SERIAL_RE = /^[^\^~\u0000-\u001F\u007F]{1,100}$/;
const TEXT_POSITIONS = ['top', 'bottom', 'left', 'right'];

// Allowed range for each numeric label setting: [min, max]
const LABEL_LIMITS = {
  labelWidth: [100, 2000],
  labelHeight: [100, 2000],
  qrSize: [1, 10],
  marginLeft: [0, 2000],
  marginTop: [0, 2000],
  fontSize: [10, 200],
  textGap: [0, 500],
  copies: [1, 100],
};
const BATCH_DELAY_LIMITS = [0, 5000];

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function parseInteger(value, key, [min, max]) {
  const n = Number(value);
  if (value === '' || value === null || !Number.isInteger(n) || n < min || n > max) {
    throw new HttpError(400, `${key} must be a whole number between ${min} and ${max}.`);
  }
  return n;
}

function parsePrinter(input) {
  if (!isObject(input)) {
    throw new HttpError(400, 'No printer selected. Choose a printer in the app first.');
  }
  const host = String(input.host ?? '').trim();
  const port = Number(input.port);

  if (!HOST_RE.test(host)) {
    throw new HttpError(400, `Invalid printer address "${host}". Use an IP address or hostname.`);
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new HttpError(400, 'Printer port must be a whole number between 1 and 65535.');
  }
  return { host, port };
}

// A printer to save: address + a display name (defaults to the address).
function parsePrinterRecord(input) {
  const { host, port } = parsePrinter(input);
  const name = String(input.name ?? '').trim().slice(0, 100) || host;
  return { name, host, port };
}

function parseSerial(value) {
  const serial = typeof value === 'string' ? value.trim() : '';
  if (!serial) throw new HttpError(400, 'A serial number is required.');
  if (!SERIAL_RE.test(serial)) {
    throw new HttpError(400, 'Serial must be 1–100 characters and cannot contain ^ or ~.');
  }
  return serial;
}

// Returns only the known label settings that were provided, validated.
// Missing settings are filled with defaults by the ZPL service.
function parseLabelConfig(input) {
  if (input === undefined || input === null) return {};
  if (!isObject(input)) throw new HttpError(400, 'Label settings must be an object.');

  const config = {};
  for (const [key, limits] of Object.entries(LABEL_LIMITS)) {
    if (input[key] !== undefined) config[key] = parseInteger(input[key], key, limits);
  }
  if (input.textPosition !== undefined) {
    if (!TEXT_POSITIONS.includes(input.textPosition)) {
      throw new HttpError(400, `textPosition must be one of: ${TEXT_POSITIONS.join(', ')}.`);
    }
    config.textPosition = input.textPosition;
  }
  return config;
}

// Label settings as stored in the database: print settings + the delay between labels.
function parseSavedLabel(input) {
  const label = parseLabelConfig(input);
  if (isObject(input) && input.batchDelay !== undefined) {
    label.batchDelay = parseInteger(input.batchDelay, 'batchDelay', BATCH_DELAY_LIMITS);
  }
  return label;
}

function parseSerialParts(input, field) {
  if (!isObject(input)) throw new HttpError(400, `${field} is required.`);
  const parts = {};
  for (const key of ['prefix', 'number', 'suffix']) {
    const value = input[key] === undefined ? '' : input[key];
    if (typeof value !== 'string' || value.length > 50) {
      throw new HttpError(400, `${field}.${key} must be text of up to 50 characters.`);
    }
    parts[key] = value;
  }
  if (!/^\d*$/.test(parts.number)) throw new HttpError(400, `${field}.number can only contain digits.`);
  return parts;
}

function parseName(value) {
  const name = typeof value === 'string' ? value.trim() : '';
  if (!name || name.length > 100) throw new HttpError(400, 'Name must be 1–100 characters.');
  return name;
}

function parseTemplate(input) {
  if (!isObject(input)) throw new HttpError(400, 'Template is required.');
  const template = {
    name: parseName(input.name),
    start: parseSerialParts(input.start, 'start'),
    end: parseSerialParts(input.end, 'end'),
    label: parseSavedLabel(input.label),
  };
  if (input.lastPrinted) template.lastPrinted = parsePrintedRange(input.lastPrinted);
  return template;
}

function parsePrintedRange(input) {
  if (!isObject(input)) throw new HttpError(400, 'Printed range is required.');
  const range = {};
  for (const key of ['start', 'end']) {
    if (typeof input[key] !== 'string' || !input[key] || input[key].length > 100) {
      throw new HttpError(400, `${key} must be a serial of up to 100 characters.`);
    }
    range[key] = input[key];
  }
  return range;
}

function parseSettings(input) {
  if (!isObject(input)) throw new HttpError(400, 'Settings are required.');
  const serial = isObject(input.serial) ? input.serial : {};
  return {
    serial: { start: parseSerialParts(serial.start, 'serial.start'), end: parseSerialParts(serial.end, 'serial.end') },
    label: parseSavedLabel(input.label),
  };
}

function parseId(value) {
  if (typeof value !== 'string' || !value || value.length > 100) throw new HttpError(400, 'A valid id is required.');
  return value;
}

module.exports = {
  parsePrinter,
  parsePrinterRecord,
  parseSerial,
  parseLabelConfig,
  parseTemplate,
  parsePrintedRange,
  parseSettings,
  parseId,
};
