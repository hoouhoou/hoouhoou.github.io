const fs = require('fs');

console.log('🔍 Building with env vars...');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/\{\{SUPABASE_URL\}\}/g, SUPABASE_URL);
html = html.replace(/\{\{SUPABASE_ANON_KEY\}\}/g, SUPABASE_ANON_KEY);

if (!fs.existsSync('dist')) fs.mkdirSync('dist');
fs.writeFileSync('dist/index.html', html);
console.log('✅ Built successfully with injected keys.');
