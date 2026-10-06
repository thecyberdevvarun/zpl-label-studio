import { request } from './http';

// The printer always comes from the UI — the server never stores one.
const toPrinterPayload = ({ host, port }) => ({ host, port: Number(port) });

export const checkPrinter = (printer, signal) =>
  request('/printers/status', { method: 'POST', body: { printer: toPrinterPayload(printer) }, signal });

export const printLabel = (printer, serial, label) =>
  request('/print/label', { method: 'POST', body: { printer: toPrinterPayload(printer), serial, label } });

export const previewZpl = (serial, label) =>
  request('/print/preview', { method: 'POST', body: { serial, label } });
