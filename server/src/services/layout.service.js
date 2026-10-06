const { getQrMatrix } = require('./qr.service');

// Average width of one character as a fraction of the font height. Only used to
// guess how wide the serial text is (to place the QR when the text is on the left,
// and to warn about overflow). It is an estimate, not a font measurement.
const CHAR_WIDTH_RATIO = 0.56;

// Works out where the QR code and the serial text go, in printer dots.
// (marginLeft, marginTop) is the top-left corner of the QR + text group.
function computeLayout(serial, cfg) {
  const { labelWidth, labelHeight, qrSize, marginLeft: ox, marginTop: oy, fontSize, textGap: gap, textPosition } = cfg;

  const matrix = getQrMatrix(serial);
  const qrDots = matrix.size * qrSize;
  const textH = fontSize;
  const estTextW = Math.round(serial.length * fontSize * CHAR_WIDTH_RATIO);

  // Side-by-side layouts: the shorter item is centred against the taller one.
  const rowH = Math.max(qrDots, textH);
  const qrOffset = Math.round((rowH - qrDots) / 2);
  const textOffset = Math.round((rowH - textH) / 2);

  let qr;
  let text;
  switch (textPosition) {
    case 'top':
      text = { x: ox, y: oy };
      qr = { x: ox, y: oy + textH + gap };
      break;
    case 'left': {
      const qrX = ox + estTextW + gap;
      qr = { x: qrX, y: oy + qrOffset };
      // Right-aligned block that ends just before the QR, so the text hugs it.
      text = { x: 0, y: oy + textOffset, blockWidth: qrX - gap, align: 'R' };
      break;
    }
    case 'right':
      qr = { x: ox, y: oy + qrOffset };
      text = { x: ox + qrDots + gap, y: oy + textOffset };
      break;
    case 'bottom':
    default:
      qr = { x: ox, y: oy };
      text = { x: ox, y: oy + qrDots + gap };
  }

  const warnings = [];
  if (qr.x + qrDots > labelWidth || qr.y + qrDots > labelHeight) {
    warnings.push('The QR code runs past the edge of the label.');
  }
  const textRight = textPosition === 'left' ? qr.x - gap : text.x + estTextW;
  if (textRight > labelWidth || text.y + textH > labelHeight) {
    warnings.push('The serial text may run past the edge of the label.');
  }

  return {
    labelWidth,
    labelHeight,
    qr: { ...qr, dots: qrDots, modules: matrix.size, path: matrix.path },
    text: { ...text, fontSize },
    warnings,
  };
}

module.exports = { computeLayout };
