const crypto = require('crypto');
const db = require('../services/database.service');

const FILE = 'history';
const EMPTY = { entries: [] };
const MAX_ENTRIES = 500; // oldest jobs are dropped after this

// Newest first.
exports.list = async () => ({ entries: (await db.read(FILE, EMPTY)).entries });

exports.add = (entry) =>
  db.update(FILE, EMPTY, (d) => {
    d.entries.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), ...entry });
    d.entries = d.entries.slice(0, MAX_ENTRIES);
    return { entries: d.entries };
  });

exports.clear = () =>
  db.update(FILE, EMPTY, (d) => {
    d.entries = [];
    return { entries: [] };
  });
