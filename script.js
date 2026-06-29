import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- CONFIGURATION TARGETS ---
// GitHub Actions workflow build script reads and maps these directly via build.js
const SUPABASE_URL = '{{SUPABASE_URL}}';
const SUPABASE_ANON_KEY = '{{SUPABASE_ANON_KEY}}';
const BUCKET_NAME = 'documents'; // Match your storage bucket name
const RECOGNIZED_ARCHIVIST = 'your-email@example.com'; // Match your exact email address

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cache internal elements
const authScreen = document.getElementById('auth-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const authError = document.getElementById('auth-error');
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');

const uploadForm = document.getElementById('upload-form');
const uploadStatus = document.getElementById('upload-status');
const searchInput = document.getElementById('search-input');
const tableBody = document.getElementById('archive-table-body');
const emptyState = document.getElementById('empty-state');

let cachedDocuments = [];
let currentSessionUser = null;

// Initialize app session on load
async function initializeApp() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (session && session.user && session.user.email === RECOGNIZED_ARCHIVIST) {
    setupDashboard(session.user);
  } else {
    // Force cleanup if session was unauthorized or missing
    if (session) await supabase.auth.signOut();
    showAuthScreen();
  }
}

function showAuthScreen() {
  authScreen.classList.remove('hidden');
  dashboardScreen.classList.add('hidden');
}

function setupDashboard(user) {
  currentSessionUser = user;
  authScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
  userDisplay.textContent = user.email;
  fetchDocuments();
}

// --- HANDLE AUTH PIPELINE ---
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.classList.add('hidden');
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Strict hard lock frontend match
  if (email !== RECOGNIZED_ARCHIVIST) {
    authError.textContent = "Access Denied: Email address is not authorized for this workspace.";
    authError.classList.remove('hidden');
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    authError.textContent = error.message;
    authError.classList.remove('hidden');
  } else if (data.user) {
    setupDashboard(data.user);
  }
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  currentSessionUser = null;
  showAuthScreen();
});

// --- FETCH & RENDER ARCHIVE ROWS ---
async function fetchDocuments() {
  const { data, error } = await supabase
    .from('personal_documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents index:', error.message);
    return;
  }

  cachedDocuments = data || [];
  renderDocuments(cachedDocuments);
}

function renderDocuments(docs) {
  tableBody.innerHTML = '';
  if (docs.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  docs.forEach(doc => {
    const row = document.createElement('tr');
    const createdDate = new Date(doc.created_at).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    row.innerHTML = `
      <td><strong>${escapeHtml(doc.title)}</strong></td>
      <td class="subtitle">${escapeHtml(doc.file_name)}</td>
      <td>${createdDate}</td>
      <td class="text-right">
        <a href="#" class="download-link" data-path="${escapeHtml(doc.file_path)}">Retrieve File</a>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Attach dynamic download logic
  document.querySelectorAll('.download-link').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const filePath = e.target.getAttribute('data-path');
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 60); // 60 seconds temporary window

      if (error) {
        alert('Could not generate secure file token: ' + error.message);
      } else if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    });
  });
}

// --- SECURE UPLOAD FLOW (AUTOMATES USER_ID ASSIGNMENT) ---
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  uploadStatus.classList.add('hidden');

  if (!currentSessionUser) return;

  const title = document.getElementById('doc-title').value.trim();
  const fileInput = document.getElementById('doc-file');
  const file = fileInput.files[0];

  if (!file) return;

  const fileExt = file.name.split('.').pop();
  // Prefix path with user ID folder to structure your bucket completely cleanly
  const uniqueFilePath = `${currentSessionUser.id}/${Date.now()}_${file.name}`;

  try {
    // Step 1: Storage Upload
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueFilePath, file, { cacheControl: '3600', upsert: false });

    if (storageError) throw storageError;

    // Step 2: Database Catalog Row Insert (Automatically maps authentication ID)
    const { error: dbError } = await supabase
      .from('personal_documents')
      .insert({
        user_id: currentSessionUser.id,
        title: title,
        file_name: file.name,
        file_path: uniqueFilePath
      });

    if (dbError) throw dbError;

    // UI Updates
    uploadStatus.textContent = "Archival success: Document recorded securely.";
    uploadStatus.classList.remove('hidden');
    uploadForm.reset();
    fetchDocuments();

  } catch (error) {
    uploadStatus.textContent = ` Archival failure: ${error.message}`;
    uploadStatus.classList.remove('hidden');
  }
});

// --- LOCAL LIVE SEARCH FILTER ---
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    renderDocuments(cachedDocuments);
    return;
  }

  const filtered = cachedDocuments.filter(doc => 
    doc.title.toLowerCase().includes(query) || 
    doc.file_name.toLowerCase().includes(query)
  );
  renderDocuments(filtered);
});

// Helper validation escape to prevent rendering bugs
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Trigger Application Pipeline Initialization
document.addEventListener('DOMContentLoaded', initializeApp);
