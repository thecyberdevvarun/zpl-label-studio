const fs = require('fs/promises');
const path = require('path');
const { DATABASE_DIR } = require('../config');

// A tiny file database: every collection is one JSON file in DATABASE_DIR.
// Writes are queued per file (no two writes overlap) and atomic (temp file + rename),
// so a crash or power cut can't leave a half-written file.

const queues = new Map();
const fileFor = (name) => path.join(DATABASE_DIR, `${name}.json`);

async function read(name, fallback) {
  const file = fileFor(name);
  let text;
  try {
    text = await fs.readFile(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return structuredClone(fallback);
    throw err;
  }
  try {
    return { ...structuredClone(fallback), ...JSON.parse(text) };
  } catch {
    // Keep the unreadable file for inspection instead of silently overwriting it.
    const backup = path.join(DATABASE_DIR, `${name}.corrupt-${Date.now()}.json`);
    await fs.rename(file, backup);
    console.warn(`  ! ${name}.json was not valid JSON. Moved to ${path.basename(backup)}`);
    return structuredClone(fallback);
  }
}

async function writeAtomic(name, data) {
  await fs.mkdir(DATABASE_DIR, { recursive: true });
  const file = fileFor(name);
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

function enqueue(name, task) {
  const run = (queues.get(name) || Promise.resolve()).then(task);
  queues.set(name, run.catch(() => {})); // a failed task must not block the next one
  return run;
}

// Read → change → save, one at a time. Throwing inside `mutate` cancels the save.
const update = (name, fallback, mutate) =>
  enqueue(name, async () => {
    const data = await read(name, fallback);
    const result = await mutate(data);
    await writeAtomic(name, data);
    return result;
  });

const replace = (name, data) => enqueue(name, () => writeAtomic(name, data));

module.exports = { read, update, replace };
