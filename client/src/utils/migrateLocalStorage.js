import * as db from '../api/databaseApi';
import { toSavedLabel } from './label';

const KEYS = ['qrlp.printers', 'qrlp.selectedPrinterId', 'qrlp.templates', 'qrlp.serial', 'qrlp.settings'];

const read = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
};

// The previous version kept the QR position in qrX/qrY; it is now the group's margin.
const convertLabel = (old = {}) =>
  toSavedLabel({ ...old, marginLeft: old.qrX, marginTop: old.qrY });

// Moves printers, templates and settings that an earlier version saved in this
// browser into the server's database folder, then clears them from the browser.
// Only fills in what the database doesn't have yet. Safe to call on every start.
export async function migrateLocalStorage() {
  if (!KEYS.some((k) => localStorage.getItem(k) !== null)) return;

  try {
    const oldPrinters = read('qrlp.printers') ?? [];
    const oldTemplates = read('qrlp.templates') ?? [];
    const oldSerial = read('qrlp.serial');
    const oldSettings = read('qrlp.settings');

    const current = await db.getPrinters();
    if (current.printers.length === 0 && oldPrinters.length) {
      const idMap = {};
      for (const p of oldPrinters) {
        const res = await db.createPrinter({ name: p.name, host: p.host, port: p.port });
        idMap[p.id] = res.printer.id;
      }
      const wanted = idMap[read('qrlp.selectedPrinterId')];
      if (wanted) await db.selectPrinter(wanted);
    }

    const existing = await db.getTemplates();
    if (existing.templates.length === 0) {
      for (const t of oldTemplates) {
        await db.saveTemplate({ name: t.name, start: t.start, end: t.end, label: convertLabel(t.label), lastPrinted: t.lastPrinted ?? undefined });
      }
    }

    const savedSettings = await db.getSettings();
    if (Object.keys(savedSettings).length === 0 && (oldSerial || oldSettings)) {
      await db.saveSettings({ serial: oldSerial ?? undefined, label: convertLabel(oldSettings ?? {}) });
    }

    KEYS.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    // Server not reachable (or data invalid): keep the browser data and try again next start.
    console.warn('Could not move browser data to the database folder:', err.message);
  }
}
