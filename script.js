let archiveData = {};
let currentPath = { event: null, year: null, month: null };

async function loadMasterLists() {
    const res = await fetch('data/list_index.txt?t=' + Date.now());
    const text = await res.text();
    text.trim().split('\n').forEach(line => {
        const [event, year, month, id, title] = line.split('|').map(s => s.trim());
        if (!archiveData[event]) archiveData[event] = {};
        if (!archiveData[event][year]) archiveData[event][year] = {};
        if (!archiveData[event][year][month]) archiveData[event][year][month] = [];
        archiveData[event][year][month].push({ id, title });
    });
    renderGrid();
}

function renderGrid() {
    const container = document.getElementById('lists-container');
    const breadcrumb = document.getElementById('breadcrumb-nav');
    container.innerHTML = ""; 
    let items = [];

    if (!currentPath.event) {
        breadcrumb.innerHTML = "ROOT / DASHBOARD";
        Object.keys(archiveData).forEach(ev => items.push({ title: ev, sub: "PLATFORM", action: () => navigate(ev, null, null) }));
    } else if (!currentPath.year) {
        breadcrumb.innerHTML = `ROOT / <span onclick="resetNav()">${currentPath.event}</span>`;
        Object.keys(archiveData[currentPath.event]).forEach(yr => items.push({ title: yr, sub: "YEAR", action: () => navigate(currentPath.event, yr, null) }));
    } else if (!currentPath.month) {
        breadcrumb.innerHTML = `ROOT / <span onclick="resetNav()">${currentPath.event}</span> / ${currentPath.year}`;
        Object.keys(archiveData[currentPath.event][currentPath.year]).forEach(mo => items.push({ title: mo, sub: "MONTH", action: () => navigate(currentPath.event, currentPath.year, mo) }));
    } else {
        breadcrumb.innerHTML = `ROOT / <span onclick="resetNav()">${currentPath.event}</span> / ${currentPath.year} / ${currentPath.month}`;
        archiveData[currentPath.event][currentPath.year][currentPath.month].forEach(ep => items.push({ title: ep.title, sub: "EPISODE", action: () => location.href=`list.html?id=${ep.id}` }));
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card-button';
        div.onclick = item.action;
        div.innerHTML = `<div class="card-top"><h3>${item.title}</h3></div><div class="card-bottom"><span>${item.sub}</span><span style="color:#fff">→</span></div>`;
        container.appendChild(div);
    });
}

function navigate(ev, yr, mo) { currentPath = { event: ev, year: yr, month: mo }; renderGrid(); }
function resetNav() { currentPath = { event: null, year: null, month: null }; renderGrid(); }
