const crypto = require('crypto');
const db = require('../services/database.service');
const HttpError = require('../utils/HttpError');

const FILE = 'templates';
const EMPTY = { templates: [] };

exports.list = async () => ({ templates: (await db.read(FILE, EMPTY)).templates });

// Saving with an existing name overwrites that template (keeping its id and last-printed info).
exports.upsert = (data) =>
  db.update(FILE, EMPTY, (d) => {
    const i = d.templates.findIndex((t) => t.name === data.name);
    let saved;
    if (i === -1) {
      saved = { id: crypto.randomUUID(), lastPrinted: null, ...data };
      d.templates.push(saved);
    } else {
      saved = { ...d.templates[i], ...data };
      d.templates[i] = saved;
    }
    return { templates: d.templates, saved };
  });

exports.remove = (id) =>
  db.update(FILE, EMPTY, (d) => {
    if (!d.templates.some((t) => t.id === id)) throw new HttpError(404, 'Template not found.');
    d.templates = d.templates.filter((t) => t.id !== id);
    return { templates: d.templates };
  });

exports.markPrinted = (id, range) =>
  db.update(FILE, EMPTY, (d) => {
    const t = d.templates.find((x) => x.id === id);
    if (!t) throw new HttpError(404, 'Template not found.');
    t.lastPrinted = range;
    return { templates: d.templates };
  });
