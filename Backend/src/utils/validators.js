const HttpError = require('./HttpError');
const { CODE_TYPES } = require('../services/code.service');

const HOST_RE = /^[a-zA-Z0-9]([a-zA-Z0-9.-]{0,251}[a-zA-Z0-9])?$/;
// ^ and ~ are ZPL control characters, so they cannot appear in label data.
const SERIAL_RE = /^[^\^~\u0000-\u001F\u007F]{1,100}$/;
const TEXT_POSITIONS = ['top', 'bottom', 'left', 'right'];
const ALIGNMENTS = ['left', 'center', 'right'];

// Allowed range for each numeric label setting: [min, max]
const LABEL_LIMITS = {
  labelWidth: [20, 9999], // dots (^PW max)
  labelHeight: [20, 32000], // dots (^LL max)
  qrSize: [1, 10],
  marginLeft: [0, 9999],
  marginTop: [0, 9999],
  fontSize: [10, 200],
  textGap: [0, 500],
  barWidth: [1, 10],
  barHeight: [20, 500],
  customFontSize: [10, 200],
  copies: [1, 100],
};
const CUSTOM_TEXT_MAX = 60;
// Custom text: standard keyboard characters, minus the ZPL control characters ^ ~ and \
const CUSTOM_TEXT_OK = /^[\x20-\x7E]*$/;
const CUSTOM_TEXT_FORBIDDEN = /[\^~\\]/;
const BATCH_DELAY_LIMITS = [0, 5000];

// The label's physical size is saved in millimetres (or shown in inches); the client
// converts it to dots using the selected printer's resolution before printing.
const LABEL_SIZE_MM_LIMITS = [10, 1000];
const SIZE_UNITS = ['mm', 'in'];

// Print resolution of a saved printer, in dots per inch.
const DPI_LIMITS = [100, 1200];
const DEFAULT_DPI = 203;

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function parseInteger(value, key, [min, max]) {
  const n = Number(value);
  if (value === '' || value === null || !Number.isInteger(n) || n < min || n > max) {
    throw new HttpError(400, `${key} must be a whole number between ${min} and ${max}.`);
  }
  return n;
}

function parseDecimal(value, key, [min, max]) {
  const n = typeof value === 'number' ? value : Number(value);
  if (value === '' || value === null || !Number.isFinite(n) || n < min || n > max) {
    throw new HttpError(400, `${key} must be a number between ${min} and ${max}.`);
  }
  return Math.round(n * 100) / 100;
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

// A printer to save: address + a display name (defaults to the address) + print resolution.
function parsePrinterRecord(input) {
  const { host, port } = parsePrinter(input);
  const name = String(input.name ?? '').trim().slice(0, 100) || host;
  const dpiInput = input.dpi === undefined || input.dpi === '' ? DEFAULT_DPI : input.dpi;
  const dpi = parseInteger(dpiInput, 'dpi', DPI_LIMITS);
  return { name, host, port, dpi };
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
  for (const key of ['textPosition', 'customTextPosition']) {
    if (input[key] === undefined) continue;
    if (!TEXT_POSITIONS.includes(input[key])) {
      throw new HttpError(400, `${key} must be one of: ${TEXT_POSITIONS.join(', ')}.`);
    }
    config[key] = input[key];
  }
  if (input.align !== undefined) {
    if (!ALIGNMENTS.includes(input.align)) {
      throw new HttpError(400, `align must be one of: ${ALIGNMENTS.join(', ')}.`);
    }
    config.align = input.align;
  }
  if (input.codeType !== undefined) {
    if (!CODE_TYPES.includes(input.codeType)) {
      throw new HttpError(400, `codeType must be one of: ${CODE_TYPES.join(', ')}.`);
    }
    config.codeType = input.codeType;
  }
  if (input.customText !== undefined) {
    const text = typeof input.customText === 'string' ? input.customText.trim() : null;
    if (text === null || text.length > CUSTOM_TEXT_MAX) {
      throw new HttpError(400, `Custom text must be up to ${CUSTOM_TEXT_MAX} characters.`);
    }
    if (!CUSTOM_TEXT_OK.test(text) || CUSTOM_TEXT_FORBIDDEN.test(text)) {
      throw new HttpError(400, 'Custom text can only use letters, numbers and common symbols (not ^ ~ or \\).');
    }
    config.customText = text;
  }
  return config;
}

// Label settings as stored in the database: print settings + the delay between labels
// + the label's physical size and the unit it is shown in.
function parseSavedLabel(input) {
  const label = parseLabelConfig(input);
  if (isObject(input)) {
    for (const key of ['labelWidthMm', 'labelHeightMm']) {
      if (input[key] !== undefined) label[key] = parseDecimal(input[key], key, LABEL_SIZE_MM_LIMITS);
    }
    if (input.sizeUnit !== undefined) {
      if (!SIZE_UNITS.includes(input.sizeUnit)) {
        throw new HttpError(400, `sizeUnit must be one of: ${SIZE_UNITS.join(', ')}.`);
      }
      label.sizeUnit = input.sizeUnit;
    }
  }
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

const JOB_STATUSES = ['done', 'stopped', 'failed'];

// One finished print job, for the history page and dashboard. The time is added by the server.
function parseHistoryEntry(input) {
  if (!isObject(input)) throw new HttpError(400, 'A history entry is required.');
  const text = (value, field, max) => {
    const v = value === undefined || value === null ? '' : value;
    if (typeof v !== 'string' || v.length > max) throw new HttpError(400, `${field} must be text of up to ${max} characters.`);
    return v;
  };
  const labels = Number(input.labels);
  if (!Number.isInteger(labels) || labels < 0 || labels > 1000000) {
    throw new HttpError(400, 'labels must be a whole number between 0 and 1000000.');
  }
  if (!JOB_STATUSES.includes(input.status)) throw new HttpError(400, `status must be one of: ${JOB_STATUSES.join(', ')}.`);
  if (!CODE_TYPES.includes(input.type)) throw new HttpError(400, `type must be one of: ${CODE_TYPES.join(', ')}.`);
  return {
    printer: text(input.printer, 'printer', 100),
    type: input.type,
    summary: text(input.summary, 'summary', 200),
    labels,
    status: input.status,
    template: text(input.template, 'template', 100),
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
  parseHistoryEntry,
  parseId,
};
