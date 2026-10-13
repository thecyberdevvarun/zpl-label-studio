export const CODE_TYPE_NAMES = { qr: 'QR code', code128: 'Code 128', code39: 'Code 39', text: 'Text only' };

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
