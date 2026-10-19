const path = require('path');
// Load the .env that sits in the project root (works whatever the working directory is).
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = require('./src/app');
const { PORT, DATABASE_DIR } = require('./src/config');

app.listen(PORT, () => {
  console.log('\n  ZPL Label Studio');
  console.log('  ─────────────────────────────────');
  console.log(`  App/API:  http://localhost:${PORT}`);
  console.log(`  Database: ${DATABASE_DIR}`);
  console.log('  ─────────────────────────────────\n');
});
