let archiveData = {};
let currentPath = { event: null, year: null, month: null };

async function loadMasterLists() {
    try {
        const res = await fetch('data/list_index.txt?t=' + new Date().getTime());
        const text = await res.text();
        const lines = text.trim().split('\n').filter(l => l.length > 0);

        lines.forEach(line => {
            const parts = line.split('|').map(s => s.trim());
            if (parts.length < 5) return;
            const [event, year, month, id, title] = parts;
            
            if (!archiveData[event]) archiveData[event] = {};
            if (!archiveData[event][year]) archiveData[event][year] = {};
            if (!archiveData[event][year][month]) archiveData[event][year][month] = [];
            archiveData[event][year][month].push({ id, title });
        });
        renderGrid();
    } catch (e) { console.error("Load Error", e); }
}

function renderGrid() {
    const container = document.getElementById('lists-container');
    const breadcrumb = document.getElementById('breadcrumb-nav');
    let html = '';

    if (!currentPath.event) {
        breadcrumb.innerHTML = "Dashboard";
        Object.keys(archiveData).forEach(event => {
            html += createCard(event, "Explore Category", () => navigate(event, null, null));
        });
    } 
    else if (!currentPath.year) {
        breadcrumb.innerHTML = `<span onclick="resetNav()">Dashboard</span> / ${currentPath.event}`;
        Object.keys(archiveData[currentPath.event]).forEach(year => {
            html += createCard(year, "Explore Year", () => navigate(currentPath.event, year, null));
        });
    }
    else if (!currentPath.month) {
        breadcrumb.innerHTML = `<span onclick="resetNav()">Dashboard</span> / <span onclick="navigate('${currentPath.event}', null, null)">${currentPath.event}</span> / ${currentPath.year}`;
        Object.keys(archiveData[currentPath.event][currentPath.year]).forEach(month => {
            html += createCard(month, "Explore Month", () => navigate(currentPath.event, currentPath.year, month));
        });
    }
    else {
        breadcrumb.innerHTML = `<span onclick="resetNav()">Dashboard</span> / <span onclick="navigate('${currentPath.event}', null, null)">${currentPath.event}</span> / <span onclick="navigate('${currentPath.event}', '${currentPath.year}', null)">${currentPath.year}</span> / ${currentPath.month}`;
        archiveData[currentPath.event][currentPath.year][currentPath.month].forEach(item => {
            html += createCard(item.title, "View Setlist", () => location.href=`list.html?id=${item.id}`);
        });
    }
    container.innerHTML = html;
}

function createCard(title, label, action) {
    // Generate a random ID to attach the click listener to
    const safeId = 'btn-' + Math.random().toString(36).substr(2, 9);
    
    // Using setTimeout to attach listeners after the HTML is injected
    setTimeout(() => {
        const el = document.getElementById(safeId);
        if(el) el.onclick = action;
    }, 0);

    return `
        <div class="card-button" id="${safeId}">
            <div class="card-top">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
                <h3>${title}</h3>
            </div>
            <div class="card-bottom">
                <span>${label}</span>
                <span>→</span>
            </div>
        </div>`;
}

function navigate(ev, yr, mo) { currentPath = { event: ev, year: yr, month: mo }; renderGrid(); }
function resetNav() { currentPath = { event: null, year: null, month: null }; renderGrid(); }
function logout() { sessionStorage.removeItem('isAuth'); window.location.href = 'index.html'; }
