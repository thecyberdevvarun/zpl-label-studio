const app = require('./app');
const { PORT, DATABASE_DIR } = require('./config');

app.listen(PORT, () => {
  console.log('\n  QR Label Printer');
  console.log('  ─────────────────────────────────');
  console.log(`  App/API:  http://localhost:${PORT}`);
  console.log(`  Database: ${DATABASE_DIR}`);
  console.log('  ─────────────────────────────────\n');
});
