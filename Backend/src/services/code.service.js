const JsBarcode = require('jsbarcode');
const HttpError = require('../utils/HttpError');
const { getQrMatrix } = require('./qr.service');

// The kinds of code a label can carry. To add another barcode type later, add it to
// BARCODES (how to check and encode it) and give zpl.service.js its ZPL command.
// 'text' prints only the custom text (no code, no serial).
const CODE_TYPES = ['qr', 'code128', 'code39', 'text'];

const BARCODES = {
  code128: {
    name: 'Code 128',
    format: 'CODE128B', // subset B — what the printer uses by default, so widths match
    test: /^[\x20-\x7E]+$/,
    hint: 'standard keyboard characters only',
  },
  code39: {
    name: 'Code 39',
    format: 'CODE39',
    test: /^[0-9A-Z\-. $\/+%]+$/,
    hint: 'only capital letters A–Z, digits 0–9, space and - . $ / + %',
  },
};

// One bar per run of 1s. viewBox width = number of modules (1 unit = 1 narrow bar).
function barsToPath(pattern) {
  let path = '';
  for (let i = 0; i < pattern.length; ) {
    if (pattern[i] !== '1') {
      i++;
      continue;
    }
    let run = 0;
    while (pattern[i + run] === '1') run++;
    path += `M${i} 0h${run}v1h-${run}z`;
    i += run;
  }
  return path;
}

function encodeBarcode(serial, type) {
  const spec = BARCODES[type];
  if (!spec.test.test(serial)) {
    throw new HttpError(400, `"${serial}" can't be printed as ${spec.name}: ${spec.hint}.`);
  }
  const out = {};
  JsBarcode(out, serial, { format: spec.format });
  return out.encodings.map((e) => e.data).join('');
}

// Builds the code (QR or barcode) for one serial: its size in printer dots and the
// vector path the preview draws.
function getCode(serial, cfg) {
  if (cfg.codeType === 'qr') {
    const qr = getQrMatrix(serial);
    const dots = qr.size * cfg.qrSize;
    return { type: 'qr', width: dots, height: dots, viewBox: [qr.size, qr.size], path: qr.path };
  }
  const pattern = encodeBarcode(serial, cfg.codeType);
  return {
    type: cfg.codeType,
    width: pattern.length * cfg.barWidth,
    height: cfg.barHeight,
    viewBox: [pattern.length, 1],
    path: barsToPath(pattern),
  };
}

module.exports = { CODE_TYPES, getCode };
