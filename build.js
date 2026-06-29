const fs = require('fs');
const path = require('path');

console.log('🔍 Executing production deployment compilation pipeline...');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Build Error: Missing environment variables (SUPABASE_URL / SUPABASE_ANON_KEY)');
  process.exit(1);
}

// Dynamically discover index.html to handle nested subdirectory structures safely
let indexPath = path.join(__dirname, 'index.html');

if (!fs.existsSync(indexPath)) {
  // Check common folder nesting alternatives if root layer misses
  const alternativePaths = [
    path.join(process.cwd(), 'index.html'),
    path.join(__dirname, 'book-archive', 'index.html')
  ];
  
  for (const altPath of alternativePaths) {
    if (fs.existsSync(altPath)) {
      indexPath = altPath;
      break;
    }
  }
}

console.log('📄 Sourcing base workspace layout from:', indexPath);

if (!fs.existsSync(indexPath)) {
  console.error('❌ Error: Base index.html template file not found! Current directory map:', __dirname);
  process.exit(1);
}

let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Inject the environment keys into the client script placeholders
htmlContent = htmlContent.replace(/\{\{SUPABASE_URL\}\}/g, SUPABASE_URL);
htmlContent = htmlContent.replace(/\{\{SUPABASE_ANON_KEY\}\}/g, SUPABASE_ANON_KEY);

// Force output directly relative to the active pipeline workspace
const baseDir = path.dirname(indexPath);
const distDir = path.join(baseDir, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);

// Also mirror sheets.html alongside it if present
const sheetsSrc = path.join(baseDir, 'sheets.html');
if (fs.existsSync(sheetsSrc)) {
  fs.copyFileSync(sheetsSrc, path.join(distDir, 'sheets.html'));
  console.log('✅ Compiled tracking reference sheets asset inside /dist bundle.');
}

console.log('✅ Staged and compiled workspace configuration assets successfully within distribution layer.');
