const fs = require('fs');
const path = require('path');

console.log('🔍 Executing compiled asset transformation pipeline...');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Build Interrupted: Environment variables are missing.');
  process.exit(1);
}

const srcIndex = path.join(__dirname, 'index.html');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(srcIndex)) {
  console.error(`❌ Template script absent at: ${srcIndex}`);
  process.exit(1);
}

let htmlContent = fs.readFileSync(srcIndex, 'utf8');
htmlContent = htmlContent.replace(/\{\{SUPABASE_URL\}\}/g, SUPABASE_URL);
htmlContent = htmlContent.replace(/\{\{SUPABASE_ANON_KEY\}\}/g, SUPABASE_ANON_KEY);

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);
console.log('✅ Staged clean production index mapping directly inside /dist folder array.');
