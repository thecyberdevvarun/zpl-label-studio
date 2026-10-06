const crypto = require('crypto');
const db = require('../services/database.service');
const HttpError = require('../utils/HttpError');

const FILE = 'printers';
const EMPTY = { selectedId: null, printers: [] };
const view = (d) => ({ printers: d.printers, selectedId: d.selectedId });

const findIndex = (d, id) => {
  const i = d.printers.findIndex((p) => p.id === id);
  if (i === -1) throw new HttpError(404, 'Printer not found.');
  return i;
};

exports.list = async () => view(await db.read(FILE, EMPTY));

exports.create = (data) =>
  db.update(FILE, EMPTY, (d) => {
    const printer = { id: crypto.randomUUID(), ...data };
    d.printers.push(printer);
    d.selectedId = printer.id; // a newly added printer becomes the one in use
    return { ...view(d), printer };
  });

exports.update = (id, data) =>
  db.update(FILE, EMPTY, (d) => {
    const i = findIndex(d, id);
    d.printers[i] = { ...d.printers[i], ...data };
    return view(d);
  });

exports.remove = (id) =>
  db.update(FILE, EMPTY, (d) => {
    findIndex(d, id);
    d.printers = d.printers.filter((p) => p.id !== id);
    if (d.selectedId === id) d.selectedId = d.printers[0]?.id ?? null;
    return view(d);
  });

exports.select = (id) =>
  db.update(FILE, EMPTY, (d) => {
    findIndex(d, id);
    d.selectedId = id;
    return view(d);
  });
