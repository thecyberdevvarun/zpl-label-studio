const QRCode = require('qrcode');

// Builds the QR matrix for a serial. `size` is the number of modules per side
// (needed to know how many dots the QR takes), `path` is an SVG path for the preview.
// Uses error-correction level Q, the same level the label's ^FDQA data asks the printer for.
function getQrMatrix(text) {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: 'Q' });
  const size = modules.size;
  let path = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (modules.data[r * size + c]) path += `M${c} ${r}h1v1h-1z`;
    }
  }
  return { size, path };
}

module.exports = { getQrMatrix };
