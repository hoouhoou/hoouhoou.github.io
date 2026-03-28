let archiveData = {};
let currentPath = { event: null, year: null, month: null };
let searchTerm = '';

async function loadMasterLists() {
    const container = document.getElementById('lists-container');
    container.innerHTML = '<div class="loading">Loading archive...</div>';
    try {
        const snapshot = await db.collection('episodes').get();
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
    const container = document.getElementById('lists-container');
    const breadcrumb = document.getElementById('breadcrumb-nav');
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
    const breadcrumb = document.getElementById('breadcrumb-nav');
    if (!breadcrumb) return;
    let html = 'ROOT / ';
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
}

function navigate(ev, yr, mo) {
    currentPath = { event: ev, year: yr, month: mo };
    localStorage.setItem('lastPath', JSON.stringify(currentPath));
    searchTerm = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    renderGrid();
}

function resetNav() {
    currentPath = { event: null, year: null, month: null };
    localStorage.removeItem('lastPath');
    renderGrid();
}

function handleSearch(term) {
    searchTerm = term;
    renderGrid();
}
window.searchHandler = handleSearch;

async function processAndDownload() {
    const input = document.getElementById('rawInput').value.trim();
    const fileName = document.getElementById('fileName').value.trim() || 'archive_node';
    const event = document.getElementById('newEvent').value.trim();
    const year = document.getElementById('newYear').value.trim();
    const month = document.getElementById('newMonth').value.trim();
    const previewDiv = document.getElementById('previewArea');

    if (!input || !event || !year || !month) {
        alert("Please provide raw data, event, year, and month.");
        return;
    }

    // Number each non-empty line, preserve original text
    const lines = input.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map((line, index) => {
            const num = String(index + 1).padStart(2, '0');
            return `${num} ${line}`;
        });
    const formatted = lines.join('\n');

    previewDiv.textContent = formatted;
    previewDiv.style.display = 'block';

    // Create a valid Firestore document ID (replace slashes with underscores)
    const docId = `${event}/${year}/${month}/${fileName}`.replace(/\//g, '_');

    try {
        await db.collection('episodes').doc(docId).set({
            event,
            year,
            month,
            id: `${event}/${year}/${month}/${fileName}`,
            title: fileName.replace(/_/g, ' '),
            content: formatted
        });
        alert(`Episode saved to Firestore.`);
        loadMasterLists(); // refresh dashboard
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
