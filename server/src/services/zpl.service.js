const { computeLayout } = require('./layout.service');

// Used only when a request leaves a setting out.
const DEFAULT_LABEL = {
  labelWidth: 400, // dots
  labelHeight: 300, // dots
  codeType: 'qr', // qr | code128 | code39 | text (custom text only)
  qrSize: 6, // QR magnification (dots per module)
  barWidth: 2, // barcode: width of the narrowest bar, in dots
  barHeight: 100, // barcode: height, in dots
  align: 'left', // where everything sits on the label: left | center | right
  marginLeft: 40, // distance from the side edge (the right edge when aligned right)
  marginTop: 40,
  fontSize: 40, // serial text
  textGap: 20, // space between items
  textPosition: 'bottom', // serial text: top | bottom | left | right of the code
  customText: '', // optional line printed on every label
  customTextPosition: 'top', // top | bottom | left | right of the code + serial
  customFontSize: 30,
  copies: 1,
};

const textField = (el, data) => [
  `^FO${el.x},${el.y}`,
  `^A0N,${el.fontSize},${Math.round(el.fontSize * 0.8)}`,
  ...(el.blockWidth ? [`^FB${el.blockWidth},1,0,${el.align},0`] : []),
  `^FD${data}^FS`,
];

// The ZPL for the code itself. Barcodes print without their own human-readable line
// (the serial text is printed separately, once, where you chose).
function codeField(code, serial, cfg) {
  const at = `^FO${code.x},${code.y}`;
  switch (code.type) {
    case 'code128':
      return [`^BY${cfg.barWidth},3,${cfg.barHeight}`, at, `^BCN,${cfg.barHeight},N,N,N`, `^FD${serial}^FS`];
    case 'code39':
      return [`^BY${cfg.barWidth},3,${cfg.barHeight}`, at, `^B3N,N,${cfg.barHeight},N,N`, `^FD${serial}^FS`];
    case 'qr':
    default:
      return [at, `^BQN,2,${cfg.qrSize}`, `^FDQA,${serial}^FS`];
  }
}

// Returns the ZPL and the layout it was built from (the preview draws the same layout).
function buildLabel(serial, label = {}) {
  const cfg = { ...DEFAULT_LABEL, ...label };
  const layout = computeLayout(serial, cfg);

  const zpl = [
    '^XA',
    `^PW${cfg.labelWidth}`,
    `^LL${cfg.labelHeight}`,
    '^LH0,0',
    ...(layout.code ? codeField(layout.code, serial, cfg) : []),
    ...(layout.serial ? textField(layout.serial, serial) : []), // the serial is printed once
    ...(layout.custom ? textField(layout.custom, layout.custom.text) : []),
    `^PQ${cfg.copies}`,
    '^XZ',
  ].join('\n');

  return { zpl, layout };
}

const generateZPL = (serial, label) => buildLabel(serial, label).zpl;

module.exports = { DEFAULT_LABEL, buildLabel, generateZPL };
