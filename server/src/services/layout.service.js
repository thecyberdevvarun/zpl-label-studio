const HttpError = require('../utils/HttpError');
const { getCode } = require('./code.service');

// Average width of one character as a fraction of the font height. Used only to
// guess how wide a line of text is (when text sits beside the code, and to warn about
// overflow). It is an estimate, not a font measurement.
const CHAR_WIDTH_RATIO = 0.56;
const QUIET_ZONE_MODULES = 10; // empty space a barcode needs on each side to scan reliably

const estimateWidth = (text, fontSize) => Math.max(1, Math.round(text.length * fontSize * CHAR_WIDTH_RATIO));
const centre = (outer, inner) => Math.round((outer - inner) / 2);

// Puts `secondary` on one side of `primary`. Returns where each goes, relative to the
// top-left of the combined box, plus the size of that box. When the two are stacked
// (top/bottom), `align` decides how the narrower one lines up with the wider one.
function place(primary, secondary, side, gap, align) {
  const rowH = Math.max(primary.h, secondary.h);
  const shift = (boxW, itemW) => {
    if (align === 'center') return centre(boxW, itemW);
    if (align === 'right') return boxW - itemW;
    return 0;
  };
  switch (side) {
    case 'top': {
      const w = Math.max(primary.w, secondary.w);
      return {
        primary: { x: shift(w, primary.w), y: secondary.h + gap },
        secondary: { x: shift(w, secondary.w), y: 0 },
        w,
        h: secondary.h + gap + primary.h,
      };
    }
    case 'left':
      return {
        primary: { x: secondary.w + gap, y: centre(rowH, primary.h) },
        secondary: { x: 0, y: centre(rowH, secondary.h) },
        w: secondary.w + gap + primary.w,
        h: rowH,
      };
    case 'right':
      return {
        primary: { x: 0, y: centre(rowH, primary.h) },
        secondary: { x: primary.w + gap, y: centre(rowH, secondary.h) },
        w: primary.w + gap + secondary.w,
        h: rowH,
      };
    case 'bottom':
    default: {
      const w = Math.max(primary.w, secondary.w);
      return {
        primary: { x: shift(w, primary.w), y: 0 },
        secondary: { x: shift(w, secondary.w), y: primary.h + gap },
        w,
        h: primary.h + gap + secondary.h,
      };
    }
  }
}

// Where the whole group starts, so that it sits on the left, in the centre, or on the right.
function groupLeft(width, cfg) {
  if (cfg.align === 'center') return Math.round((cfg.labelWidth - width) / 2);
  if (cfg.align === 'right') return cfg.labelWidth - cfg.marginLeft - width;
  return cfg.marginLeft;
}

// One line of text, with the justification that keeps it exactly where it should be
// without needing to know how wide it prints:
//   - beside the code: hugs it (right-aligned if on the left, left-aligned if on the right)
//   - above/below: left edge, centre line, or right edge of the box it belongs to
function textElement(pos, fontSize, side, align, box, hugX, gap, labelWidth) {
  const el = { x: pos.x, y: pos.y, fontSize };
  if (side === 'left') return { ...el, x: 0, blockWidth: Math.max(1, hugX - gap), align: 'R' };
  if (side === 'right') return el;
  if (align === 'right') return { ...el, x: 0, blockWidth: Math.max(1, box.x + box.w), align: 'R' };
  if (align === 'center') {
    const c = box.x + box.w / 2;
    const width = Math.max(10, Math.round(2 * Math.min(c, labelWidth - c)));
    return { ...el, x: Math.round(c - width / 2), blockWidth: width, align: 'C' };
  }
  return el;
}

// Estimated left and right edge of a text element, for overflow warnings.
function extent(el, textWidth) {
  if (el.align === 'R') return [el.blockWidth - textWidth, el.blockWidth];
  if (el.align === 'C') {
    const c = el.x + el.blockWidth / 2;
    return [c - textWidth / 2, c + textWidth / 2];
  }
  return [el.x, el.x + textWidth];
}

// Text-only label: just the custom text, left, centred or right.
function computeTextOnlyLayout(cfg) {
  if (!cfg.customText) throw new HttpError(400, 'Enter the text to print.');
  const { labelWidth, labelHeight, marginTop, customFontSize, align } = cfg;
  const box = { w: estimateWidth(cfg.customText, customFontSize), h: customFontSize };
  const x = groupLeft(box.w, cfg);
  const text = textElement({ x, y: marginTop }, customFontSize, 'bottom', align, { x, w: box.w }, 0, 0, labelWidth);

  const warnings = [];
  const [left, right] = extent(text, box.w);
  if (left < 0 || right > labelWidth || marginTop + box.h > labelHeight) {
    warnings.push('The text may run past the edge of the label.');
  }
  return {
    labelWidth,
    labelHeight,
    code: null,
    serial: null,
    custom: { ...text, text: cfg.customText },
    warnings,
  };
}

// Works out where the code, the serial text and the custom text go, in printer dots.
//   1. code + serial text are arranged (serial on the textPosition side of the code)
//   2. custom text is then placed on the customTextPosition side of that whole group
//   3. the whole group is put on the left, centre or right of the label (align)
function computeLayout(serial, cfg) {
  if (cfg.codeType === 'text') return computeTextOnlyLayout(cfg);

  const { labelWidth, labelHeight, marginTop, textGap: gap, align } = cfg;

  const code = getCode(serial, cfg);
  const serialBox = { w: estimateWidth(serial, cfg.fontSize), h: cfg.fontSize };
  const inner = place({ w: code.width, h: code.height }, serialBox, cfg.textPosition, gap, align);

  const customBox = cfg.customText
    ? { w: estimateWidth(cfg.customText, cfg.customFontSize), h: cfg.customFontSize }
    : null;
  const outer = customBox ? place({ w: inner.w, h: inner.h }, customBox, cfg.customTextPosition, gap, align) : null;

  const total = outer || inner;
  const origin = { x: groupLeft(total.w, cfg), y: marginTop };
  const innerAt = outer ? { x: origin.x + outer.primary.x, y: origin.y + outer.primary.y } : origin;
  const at = (base, rel) => ({ x: base.x + rel.x, y: base.y + rel.y });

  const codePos = at(innerAt, inner.primary);
  const serialText = textElement(
    at(innerAt, inner.secondary), cfg.fontSize, cfg.textPosition, align,
    { x: innerAt.x, w: inner.w }, codePos.x, gap, labelWidth,
  );

  let customText = null;
  if (outer) {
    customText = {
      ...textElement(
        at(origin, outer.secondary), cfg.customFontSize, cfg.customTextPosition, align,
        { x: origin.x, w: outer.w }, innerAt.x, gap, labelWidth,
      ),
      text: cfg.customText,
    };
  }

  // ── warnings ──
  const warnings = [];
  const codeName = code.type === 'qr' ? 'QR code' : 'barcode';
  if (codePos.x < 0 || codePos.x + code.width > labelWidth || codePos.y + code.height > labelHeight) {
    warnings.push(`The ${codeName} runs past the edge of the label.`);
  }
  const overflows = (el, box) => {
    const [left, right] = extent(el, box.w);
    return left < 0 || right > labelWidth || el.y + box.h > labelHeight;
  };
  if (overflows(serialText, serialBox)) warnings.push('The serial text may run past the edge of the label.');
  if (customText && overflows(customText, customBox)) warnings.push('The custom text may run past the edge of the label.');

  if (code.type !== 'qr') {
    const quiet = QUIET_ZONE_MODULES * cfg.barWidth;
    if (codePos.x >= 0 && codePos.x < quiet) {
      warnings.push(`The barcode needs about ${quiet} dots of empty space on its left to scan reliably (raise the side margin, or use a thinner bar width).`);
    } else if (codePos.x + code.width <= labelWidth && codePos.x + code.width + quiet > labelWidth) {
      warnings.push(`The barcode needs about ${quiet} dots of empty space on its right to scan reliably (raise the side margin, or use a thinner bar width).`);
    }
    if ((cfg.textPosition === 'left' || cfg.textPosition === 'right') && gap < quiet) {
      warnings.push(`Raise the spacing to at least ${quiet} dots so the text doesn't crowd the barcode.`);
    }
  }

  return {
    labelWidth,
    labelHeight,
    code: { ...codePos, type: code.type, width: code.width, height: code.height, viewBox: code.viewBox, path: code.path },
    serial: serialText,
    custom: customText,
    warnings,
  };
}

module.exports = { computeLayout };
