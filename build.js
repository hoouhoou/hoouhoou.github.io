const fs = require('fs');
const path = require('path');

console.log('🔍 Executing production deployment compilation pipeline...');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Build Error: Missing environment variables (SUPABASE_URL / SUPABASE_ANON_KEY)');
  process.exit(1);
}

const indexPath = path.join(__dirname, 'index.html');
console.log('📄 Sourcing base workspace layout from:', indexPath);

if (!fs.existsSync(indexPath)) {
  console.error('❌ Error: Base index.html template file not found!');
  process.exit(1);
}

let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Inject the environment keys into the client script
htmlContent = htmlContent.replace(/\{\{SUPABASE_URL\}\}/g, SUPABASE_URL);
htmlContent = htmlContent.replace(/\{\{SUPABASE_ANON_KEY\}\}/g, SUPABASE_ANON_KEY);

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);
console.log('✅ Staged and compiled index.html successfully within /dist container.');
