export const MAX_BATCH = 500;
export const DEFAULT_PRINTER_PORT = 9100; // standard raw/JetDirect port, only used to pre-fill the form
export const POLL_INTERVAL_MS = 30000;

export const TEXT_POSITIONS = ['top', 'bottom', 'left', 'right'];

export const DEFAULT_LABEL = {
  labelWidth: 400,
  labelHeight: 300,
  qrSize: 6,
  marginLeft: 40, // top-left corner of the QR + text group
  marginTop: 40,
  fontSize: 40,
  textGap: 20, // space between QR and text
  textPosition: 'bottom',
  copies: 1,
};

export const DEFAULT_BATCH_DELAY = 150;

export const DEFAULT_SERIAL = {
  start: { prefix: 'SN', number: '000001', suffix: '' },
  end: { prefix: 'SN', number: '000010', suffix: '' },
};

// What is saved in database/settings.json
export const DEFAULT_SETTINGS = {
  serial: DEFAULT_SERIAL,
  label: { ...DEFAULT_LABEL, batchDelay: DEFAULT_BATCH_DELAY },
};
