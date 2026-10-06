const { computeLayout } = require('./layout.service');

// Used only when a request leaves a setting out.
const DEFAULT_LABEL = {
  labelWidth: 400, // dots
  labelHeight: 300, // dots
  qrSize: 6, // QR magnification (dots per module)
  marginLeft: 40, // top-left corner of the QR + text group
  marginTop: 40,
  fontSize: 40,
  textGap: 20, // space between QR and text
  textPosition: 'bottom', // top | bottom | left | right (relative to the QR)
  copies: 1,
};

// Returns the ZPL and the layout it was built from (the preview draws the same layout).
function buildLabel(serial, label = {}) {
  const cfg = { ...DEFAULT_LABEL, ...label };
  const layout = computeLayout(serial, cfg);
  const { qr, text } = layout;

  const textField = [
    `^FO${text.x},${text.y}`,
    `^A0N,${cfg.fontSize},${Math.round(cfg.fontSize * 0.8)}`,
    ...(text.blockWidth ? [`^FB${text.blockWidth},1,0,${text.align},0`] : []),
    `^FD${serial}^FS`,
  ];

  const zpl = [
    '^XA',
    `^PW${cfg.labelWidth}`,
    `^LL${cfg.labelHeight}`,
    '^LH0,0',
    `^FO${qr.x},${qr.y}`,
    `^BQN,2,${cfg.qrSize}`,
    `^FDQA,${serial}^FS`,
    ...textField, // the serial is printed once, next to the QR
    `^PQ${cfg.copies}`,
    '^XZ',
  ].join('\n');

  return { zpl, layout };
}

const generateZPL = (serial, label) => buildLabel(serial, label).zpl;

module.exports = { DEFAULT_LABEL, buildLabel, generateZPL };
