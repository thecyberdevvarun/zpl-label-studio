import { DEFAULT_LABEL, DEFAULT_BATCH_DELAY, TEXT_POSITIONS } from '../constants/defaults';

// [min, max] — mirrors the limits enforced by the server.
const LIMITS = {
  labelWidth: [100, 2000],
  labelHeight: [100, 2000],
  qrSize: [1, 10],
  marginLeft: [0, 2000],
  marginTop: [0, 2000],
  fontSize: [10, 200],
  textGap: [0, 500],
  copies: [1, 100],
};

const toInt = (value, [min, max], fallback) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

// Inputs may hold '' while the user is typing; this always returns valid values.
export function sanitizeLabel(raw = {}) {
  const out = {};
  for (const key of Object.keys(LIMITS)) {
    out[key] = toInt(raw[key], LIMITS[key], DEFAULT_LABEL[key]);
  }
  out.textPosition = TEXT_POSITIONS.includes(raw.textPosition) ? raw.textPosition : DEFAULT_LABEL.textPosition;
  return out;
}

export const sanitizeDelay = (value) => toInt(value, [0, 5000], DEFAULT_BATCH_DELAY);

// Label settings in the form they are saved (print settings + delay between labels).
export const toSavedLabel = (raw = {}) => ({ ...sanitizeLabel(raw), batchDelay: sanitizeDelay(raw.batchDelay) });
