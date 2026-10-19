export const MAX_BATCH = 500;
export const DEFAULT_PRINTER_PORT = 9100; // standard raw/JetDirect port, only used to pre-fill the form
export const DEFAULT_DPI = 203; // used when a printer has no resolution saved

// Print resolution choices (dots per inch). SATO printers use 305/609 instead of 300/600.
export const DPI_OPTIONS = [
  { value: 203, label: '203 dpi (8 dots/mm)' },
  { value: 300, label: '300 dpi (12 dots/mm)' },
  { value: 305, label: '305 dpi (12 dots/mm, SATO)' },
  { value: 600, label: '600 dpi (24 dots/mm)' },
  { value: 609, label: '609 dpi (24 dots/mm, SATO)' },
];

export const SIZE_UNITS = ['mm', 'in'];
export const ALIGNMENTS = ['left', 'center', 'right'];

// Common label sizes, in millimetres.
export const LABEL_PRESETS = [
  { width: 30, height: 20 },
  { width: 40, height: 30 },
  { width: 50, height: 25 },
  { width: 50, height: 30 },
  { width: 50, height: 40 },
  { width: 60, height: 40 },
  { width: 70, height: 50 },
  { width: 100, height: 50 },
  { width: 100, height: 100 },
  { width: 100, height: 150, note: '4 × 6 in' },
];
export const POLL_INTERVAL_MS = 30000;

export const TEXT_POSITIONS = ['top', 'bottom', 'left', 'right'];
export const CODE_TYPES = ['qr', 'code128', 'code39', 'text']; // 'text' = custom text only
export const CUSTOM_TEXT_MAX = 60;

export const DEFAULT_LABEL = {
  labelWidthMm: 50, // physical label size; converted to dots using the printer's resolution
  labelHeightMm: 40,
  sizeUnit: 'mm', // which unit the size boxes show: 'mm' | 'in'
  codeType: 'qr', // 'qr' | 'code128' | 'code39' | 'text'
  qrSize: 6,
  barWidth: 2, // barcode: narrowest bar, in dots
  barHeight: 100, // barcode: height, in dots
  align: 'left', // where everything sits on the label: 'left' | 'center' | 'right'
  marginLeft: 40, // distance from the side edge (the right edge when aligned right)
  marginTop: 40,
  fontSize: 40, // serial text
  textGap: 20, // space between items
  textPosition: 'bottom', // serial text, relative to the code
  customText: '', // optional line printed on every label
  customTextPosition: 'top', // relative to the code + serial
  customFontSize: 30,
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
