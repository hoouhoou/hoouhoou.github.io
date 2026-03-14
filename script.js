let archiveData = {};
let currentPath = { event: null, year: null, month: null };

async function loadMasterLists() {
    try {
        const res = await fetch('data/list_index.txt?t=' + new Date().getTime());
        const text = await res.text();
        const lines = text.trim().split('\n').filter(l => l.length > 0);

        archiveData = {}; // Clear old data
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
    } catch (e) { document.getElementById('lists-container').innerHTML = "Error loading index."; }
}

function renderGrid() {
    const container = document.getElementById('lists-container');
    const breadcrumb = document.getElementById('breadcrumb-nav');
    container.innerHTML = ""; // Clear current view

    let items = [];
    let label = "";

    if (!currentPath.event) {
        breadcrumb.innerHTML = "Dashboard";
        Object.keys(archiveData).forEach(ev => items.push({ title: ev, sub: "Explore Category", action: () => navigate(ev, null, null) }));
    } else if (!currentPath.year) {
        breadcrumb.innerHTML = `<span onclick="resetNav()">Dashboard</span> / ${currentPath.event}`;
        Object.keys(archiveData[currentPath.event]).forEach(yr => items.push({ title: yr, sub: "Explore Year", action: () => navigate(currentPath.event, yr, null) }));
    } else if (!currentPath.month) {
        breadcrumb.innerHTML = `<span onclick="resetNav()">Dashboard</span> / <span onclick="navigate('${currentPath.event}',null,null)">${currentPath.event}</span> / ${currentPath.year}`;
        Object.keys(archiveData[currentPath.event][currentPath.year]).forEach(mo => items.push({ title: mo, sub: "Explore Month", action: () => navigate(currentPath.event, currentPath.year, mo) }));
    } else {
        breadcrumb.innerHTML = `<span onclick="resetNav()">Dashboard</span> / <span onclick="navigate('${currentPath.event}',null,null)">${currentPath.event}</span> / <span onclick="navigate('${currentPath.event}','${currentPath.year}',null)">${currentPath.year}</span> / ${currentPath.month}`;
        archiveData[currentPath.event][currentPath.year][currentPath.month].forEach(ep => items.push({ title: ep.title, sub: "View Setlist", action: () => location.href=`list.html?id=${ep.id}` }));
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card-button';
        div.onclick = item.action;
        div.innerHTML = `<div class="card-top"><h3>${item.title}</h3></div><div class="card-bottom"><span>${item.sub}</span><span>→</span></div>`;
        container.appendChild(div);
    });
}

function navigate(ev, yr, mo) { currentPath = { event: ev, year: yr, month: mo }; renderGrid(); }
function resetNav() { currentPath = { event: null, year: null, month: null }; renderGrid(); }
function logout() { sessionStorage.removeItem('isAuth'); window.location.href = 'index.html'; }
