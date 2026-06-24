const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const result = html
  .replace(/\{\{SUPABASE_URL\}\}/g, process.env.SUPABASE_URL || '')
  .replace(/\{\{SUPABASE_ANON_KEY\}\}/g, process.env.SUPABASE_ANON_KEY || '');
if (!fs.existsSync('dist')) fs.mkdirSync('dist');
fs.writeFileSync('dist/index.html', result);
console.log('✅ Built');
