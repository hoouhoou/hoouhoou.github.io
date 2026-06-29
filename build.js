const fs = require('fs');
const path = require('path');

console.log('🔍 Starting production archive compile pipeline...');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Build Error: Missing environment credentials (SUPABASE_URL / SUPABASE_ANON_KEY)');
  process.exit(1);
}

// Build destination paths
const srcIndex = path.join(__dirname, 'index.html');
const srcStyle = path.join(__dirname, 'style.css');
const srcScript = path.join(__dirname, 'script.js');
const distDir = path.join(__dirname, 'dist');

// Validate root index file presence
if (!fs.existsSync(srcIndex)) {
  console.error(`❌ Build Error: Base file template not found at ${srcIndex}`);
  process.exit(1);
}

// Ensure distribution container directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Read template and compile token mappings
let htmlContent = fs.readFileSync(srcIndex, 'utf8');
htmlContent = htmlContent.replace(/\{\{SUPABASE_URL\}\}/g, SUPABASE_URL);
htmlContent = htmlContent.replace(/\{\{SUPABASE_ANON_KEY\}\}/g, SUPABASE_ANON_KEY);

// Write production assets directly to distribution target
fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);
console.log('✅ Production HTML output successfully compiled with secret mappings.');

// Safely stage supporting modular assets if they exist
if (fs.existsSync(srcStyle)) {
  fs.copyFileSync(srcStyle, path.join(distDir, 'style.css'));
  console.log('✅ Staged style.css into production distribution container.');
}

if (fs.existsSync(srcScript)) {
  let scriptContent = fs.readFileSync(srcScript, 'utf8');
  // Inject tokens in script.js as well if you choose to separate configuration targets
  scriptContent = scriptContent.replace(/\{\{SUPABASE_URL\}\}/g, SUPABASE_URL);
  scriptContent = scriptContent.replace(/\{\{SUPABASE_ANON_KEY\}\}/g, SUPABASE_ANON_KEY);
  fs.writeFileSync(path.join(distDir, 'script.js'), scriptContent);
  console.log('✅ Staged script.js into production distribution container.');
}

console.log('🚀 Archival compilation complete. Pipeline ready for GitHub Pages delivery.');
