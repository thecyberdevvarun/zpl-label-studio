import {
  DEFAULT_LABEL,
  DEFAULT_BATCH_DELAY,
  DEFAULT_DPI,
  TEXT_POSITIONS,
  CODE_TYPES,
  SIZE_UNITS,
  ALIGNMENTS,
  CUSTOM_TEXT_MAX,
} from '../constants/defaults';

// [min, max] — mirrors the limits enforced by the server.
const LIMITS = {
  qrSize: [1, 10],
  barWidth: [1, 10],
  barHeight: [20, 500],
  marginLeft: [0, 9999],
  marginTop: [0, 9999],
  fontSize: [10, 200],
  textGap: [0, 500],
  customFontSize: [10, 200],
  copies: [1, 100],
};

export const MM_LIMITS = [10, 1000]; // label width/height in millimetres
const MAX_WIDTH_DOTS = 9999; // printer limit (^PW)
const MAX_LENGTH_DOTS = 32000; // printer limit (^LL)
const MIN_DOTS = 20;
export const MM_PER_INCH = 25.4;

const toInt = (value, [min, max], fallback) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const toDecimal = (value, [min, max], fallback) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(max, Math.max(min, n)) * 100) / 100;
};

// ── size: millimetres <-> dots ──
export const mmToDots = (mm, dpi) => Math.round((mm * dpi) / MM_PER_INCH);
export const dotsToMm = (dots, dpi) => (dots * MM_PER_INCH) / dpi;

// Custom text allows standard keyboard characters, minus ^ ~ and \ (they have a
// special meaning in ZPL). Anything else is removed.
export const cleanCustomText = (value) =>
  String(value ?? '')
    .replace(/[^\x20-\x7E]|[\^~\\]/g, '')
    .slice(0, CUSTOM_TEXT_MAX);

const oneOf = (value, list, fallback) => (list.includes(value) ? value : fallback);

// Inputs may hold '' while the user is typing; this always returns valid values.
// The label size stays in millimetres here (that's how it is saved).
export function sanitizeLabel(raw = {}) {
  const out = {};
  for (const key of Object.keys(LIMITS)) {
    out[key] = toInt(raw[key], LIMITS[key], DEFAULT_LABEL[key]);
  }
  out.labelWidthMm = toDecimal(raw.labelWidthMm, MM_LIMITS, DEFAULT_LABEL.labelWidthMm);
  out.labelHeightMm = toDecimal(raw.labelHeightMm, MM_LIMITS, DEFAULT_LABEL.labelHeightMm);
  out.sizeUnit = oneOf(raw.sizeUnit, SIZE_UNITS, DEFAULT_LABEL.sizeUnit);
  out.align = oneOf(raw.align, ALIGNMENTS, DEFAULT_LABEL.align);
  out.codeType = oneOf(raw.codeType, CODE_TYPES, DEFAULT_LABEL.codeType);
  out.textPosition = oneOf(raw.textPosition, TEXT_POSITIONS, DEFAULT_LABEL.textPosition);
  out.customTextPosition = oneOf(raw.customTextPosition, TEXT_POSITIONS, DEFAULT_LABEL.customTextPosition);
  out.customText = cleanCustomText(raw.customText).trim();
  return out;
}

export const sanitizeDelay = (value) => toInt(value, [0, 5000], DEFAULT_BATCH_DELAY);

// The label size in dots for a printer with this resolution, kept within what the printer accepts.
export function labelDots(raw, dpi = DEFAULT_DPI) {
  const { labelWidthMm, labelHeightMm } = sanitizeLabel(raw);
  const rawWidth = mmToDots(labelWidthMm, dpi);
  const rawHeight = mmToDots(labelHeightMm, dpi);
  return {
    width: Math.min(MAX_WIDTH_DOTS, Math.max(MIN_DOTS, rawWidth)),
    height: Math.min(MAX_LENGTH_DOTS, Math.max(MIN_DOTS, rawHeight)),
    tooWide: rawWidth > MAX_WIDTH_DOTS,
    tooLong: rawHeight > MAX_LENGTH_DOTS,
  };
}

// What the server needs for one label: everything in dots, using the selected printer's resolution.
export function toPrintLabel(raw, dpi = DEFAULT_DPI) {
  // eslint-disable-next-line no-unused-vars
  const { labelWidthMm, labelHeightMm, sizeUnit, ...rest } = sanitizeLabel(raw);
  const { width, height } = labelDots(raw, dpi);
  return { ...rest, labelWidth: width, labelHeight: height };
}

// Label settings in the form they are saved (print settings + delay between labels).
export const toSavedLabel = (raw = {}) => ({ ...sanitizeLabel(raw), batchDelay: sanitizeDelay(raw.batchDelay) });

// Settings and templates saved by earlier versions stored the size in dots.
// Convert those to millimetres (assuming a 203 dpi printer) so nothing is lost.
export function upgradeLabel(saved) {
  if (!saved) return {};
  const { labelWidth, labelHeight, ...rest } = saved;
  const out = { ...rest };
  if (out.labelWidthMm === undefined && labelWidth !== undefined) {
    out.labelWidthMm = Math.round(dotsToMm(labelWidth, DEFAULT_DPI) * 10) / 10;
  }
  if (out.labelHeightMm === undefined && labelHeight !== undefined) {
    out.labelHeightMm = Math.round(dotsToMm(labelHeight, DEFAULT_DPI) * 10) / 10;
  }
  return out;
}
