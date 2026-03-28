console.log("✅ Classics script loaded");

let archiveData = {};
let currentPath = { event: null, year: null, month: null };
let searchTerm = '';
let currentUserRole = 'viewer';
let container, breadcrumb, searchInput, generateBtn, rawInput, fileName, newEvent, newYear, newMonth, previewArea, toggleGenBtn, generatorPanel, autoNumberCheckbox;

// Initialize after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    container = document.getElementById('lists-container');
    breadcrumb = document.getElementById('breadcrumb-nav');
    searchInput = document.getElementById('searchInput');
    generateBtn = document.getElementById('generateBtn');
    rawInput = document.getElementById('rawInput');
    fileName = document.getElementById('fileName');
    newEvent = document.getElementById('newEvent');
    newYear = document.getElementById('newYear');
    newMonth = document.getElementById('newMonth');
    previewArea = document.getElementById('previewArea');
    toggleGenBtn = document.getElementById('toggleGenBtn');
    generatorPanel = document.getElementById('generator-panel');
    autoNumberCheckbox = document.getElementById('autoNumberCheckbox');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.trim().toLowerCase();
            renderGrid();
        });
    }
});

// Called from dashboard.html after Firebase Auth confirms user
function initAfterAuth(role) {
    currentUserRole = role;
    if (currentUserRole !== 'admin') {
        if (toggleGenBtn) toggleGenBtn.style.display = 'none';
        if (generatorPanel) generatorPanel.style.display = 'none';
    } else {
        if (toggleGenBtn) {
            toggleGenBtn.addEventListener('click', () => {
                generatorPanel.style.display = generatorPanel.style.display === 'block' ? 'none' : 'block';
            });
        }
        if (generateBtn) {
            generateBtn.addEventListener('click', processAndDownload);
        }
    }
    loadMasterLists();
}

async function loadMasterLists() {
    if (!container) return;
    container.innerHTML = '<div class="loading">Loading archive...</div>';
    try {
        // Use the "classics" collection instead of "episodes"
        const snapshot = await db.collection('classics').get();
        archiveData = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            const { event, year, month, id, title } = data;
            if (!archiveData[event]) archiveData[event] = {};
            if (!archiveData[event][year]) archiveData[event][year] = {};
            if (!archiveData[event][year][month]) archiveData[event][year][month] = [];
            archiveData[event][year][month].push({ id, title });
        });
        const saved = localStorage.getItem('lastPath');
        if (saved) {
            try {
                const path = JSON.parse(saved);
                if (path.event && archiveData[path.event]) currentPath = path;
                else resetNav();
            } catch (e) { resetNav(); }
        } else {
            resetNav();
        }
        renderGrid();
    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="loading">❌ Failed to load data. Check Firestore.</div>';
    }
}

function renderGrid() {
    if (!container) return;

    let items = [];

    if (!currentPath.event) {
        items = Object.keys(archiveData).map(ev => ({
            title: ev, sub: "PLATFORM", action: () => navigate(ev, null, null)
        }));
        updateBreadcrumb();
    } else if (!currentPath.year) {
        items = Object.keys(archiveData[currentPath.event]).map(yr => ({
            title: yr, sub: "YEAR", action: () => navigate(currentPath.event, yr, null)
        }));
        updateBreadcrumb();
    } else if (!currentPath.month) {
        items = Object.keys(archiveData[currentPath.event][currentPath.year]).map(mo => ({
            title: mo, sub: "MONTH", action: () => navigate(currentPath.event, currentPath.year, mo)
        }));
        updateBreadcrumb();
    } else {
        let episodes = archiveData[currentPath.event][currentPath.year][currentPath.month];
        if (searchTerm) episodes = episodes.filter(ep => ep.title.toLowerCase().includes(searchTerm));
        items = episodes.map(ep => ({
            title: ep.title, sub: "EPISODE", action: () => window.location.href = `list.html?id=${ep.id}`
        }));
        updateBreadcrumb();
    }

    container.innerHTML = '';
    if (items.length === 0) {
        container.innerHTML = '<div class="loading">No items found.</div>';
        return;
    }
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-button';
        card.onclick = item.action;
        card.innerHTML = `<div class="card-top"><h3>${escapeHtml(item.title)}</h3></div><div class="card-bottom"><span>${item.sub}</span><span style="color:#fff">→</span></div>`;
        container.appendChild(card);
    });
}

function updateBreadcrumb() {
    if (!breadcrumb) return;
    let html = '<span id="homeBtn" class="home-btn">🏠 HOME</span> ROOT / ';
    if (currentPath.event) html += `<span class="breadcrumb-link" data-event="${currentPath.event}">${escapeHtml(currentPath.event)}</span> / `;
    if (currentPath.year) html += `<span class="breadcrumb-link" data-event="${currentPath.event}" data-year="${currentPath.year}">${escapeHtml(currentPath.year)}</span> / `;
    if (currentPath.month) html += `<span class="breadcrumb-link" data-event="${currentPath.event}" data-year="${currentPath.year}" data-month="${currentPath.month}">${escapeHtml(currentPath.month)}</span> / `;
    breadcrumb.innerHTML = html.slice(0, -2);
    document.querySelectorAll('.breadcrumb-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const ev = link.dataset.event;
            const yr = link.dataset.year || null;
            const mo = link.dataset.month || null;
            navigate(ev, yr, mo);
        });
    });
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) homeBtn.addEventListener('click', () => resetNav());
}

function navigate(ev, yr, mo) {
    currentPath = { event: ev, year: yr, month: mo };
    localStorage.setItem('lastPath', JSON.stringify(currentPath));
    searchTerm = '';
    if (searchInput) searchInput.value = '';
    renderGrid();
}

function resetNav() {
    currentPath = { event: null, year: null, month: null };
    localStorage.removeItem('lastPath');
    renderGrid();
}

async function processAndDownload() {
    if (!rawInput || !fileName || !newEvent || !newYear || !newMonth || !previewArea) return;

    const input = rawInput.value.trim();
    const file = fileName.value.trim() || 'archive_node';
    const event = newEvent.value.trim();
    const year = newYear.value.trim();
    const month = newMonth.value.trim();
    const autoNumber = autoNumberCheckbox ? autoNumberCheckbox.checked : true;

    if (!input || !event || !year || !month) {
        alert("Please provide raw data, event, year, and month.");
        return;
    }

    let formatted;
    if (autoNumber) {
        const lines = input.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map((line, index) => {
                const num = String(index + 1).padStart(2, '0');
                return `${num} ${line}`;
            });
        formatted = lines.join('\n');
    } else {
        formatted = input;
    }

    previewArea.textContent = formatted;
    previewArea.style.display = 'block';

    const docId = `${event}/${year}/${month}/${file}`.replace(/\//g, '_');

    try {
        await db.collection('classics').doc(docId).set({
            event, year, month,
            id: `${event}/${year}/${month}/${file}`,
            title: file.replace(/_/g, ' '),
            content: formatted
        });
        alert(`Item saved to Firestore.`);
        loadMasterLists();
    } catch (err) {
        console.error(err);
        alert("Save failed.");
    }
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

window.initAfterAuth = initAfterAuth;