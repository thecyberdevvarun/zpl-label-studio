import { MAX_BATCH } from '../constants/defaults';

const clean = (p) => ({
  prefix: (p.prefix ?? '').trim(),
  number: (p.number ?? '').trim(),
  suffix: (p.suffix ?? '').trim(),
});

export const formatSerial = (parts) => {
  const p = clean(parts);
  return `${p.prefix}${p.number}${p.suffix}`;
};

const fail = (error) => ({ serials: [], total: null, error });

// Expands a start/end pair into the list of serials to print.
export function buildSerialRange(startParts, endParts, max = MAX_BATCH) {
  const s = clean(startParts);
  const e = clean(endParts);

  if (!s.number || !e.number) return fail('Enter a start and end number.');
  if (!/^\d+$/.test(s.number) || !/^\d+$/.test(e.number)) return fail('Numbers can only contain digits.');
  if (s.prefix !== e.prefix || s.suffix !== e.suffix) return fail('Start and end need the same prefix and suffix.');

  const from = BigInt(s.number);
  const to = BigInt(e.number);
  if (from > to) return fail('Start number must be less than or equal to the end number.');
  if (to - from + 1n > BigInt(max)) return fail(`A batch can have at most ${max} labels.`);

  const digits = Math.max(s.number.length, e.number.length);
  const serials = [];
  for (let n = from; n <= to; n++) {
    serials.push(`${s.prefix}${n.toString().padStart(digits, '0')}${s.suffix}`);
  }
  return { serials, total: serials.length, error: null };
}
