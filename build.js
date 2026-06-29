const fs = require('fs');
const path = require('path');

console.log('🔍 Triggering environment engine build serialization...');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Build Interrupted: Required target environment definitions (SUPABASE_URL / SUPABASE_ANON_KEY) absent.');
  process.exit(1);
}

const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}

// 1. Process and compile index.html
const sourceIndexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(sourceIndexPath)) {
  let indexHtml = fs.readFileSync(sourceIndexPath, 'utf8');
  indexHtml = indexHtml.replace(/\{\{SUPABASE_URL\}\}/g, SUPABASE_URL);
  indexHtml = indexHtml.replace(/\{\{SUPABASE_ANON_KEY\}\}/g, SUPABASE_ANON_KEY);
  fs.writeFileSync(path.join(distPath, 'index.html'), indexHtml);
  console.log('✅ Compiled: index.html -> dist/index.html');
} else {
  console.error('❌ Error: Base index.html template file missing.');
  process.exit(1);
}

// 2. Clone sheets.html seamlessly into build distribution folder
const sourceSheetsPath = path.join(__dirname, 'sheets.html');
if (fs.existsSync(sourceSheetsPath)) {
  fs.copyFileSync(sourceSheetsPath, path.join(distPath, 'sheets.html'));
  console.log('✅ Compiled: sheets.html -> dist/sheets.html');
}

console.log('🚀 Build pipeline fully completed.');
