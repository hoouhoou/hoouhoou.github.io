let archiveData = {};
let currentPath = { event: null, year: null, month: null };

async function loadMasterLists() {
    try {
        const res = await fetch('data/list_index.txt?t=' + new Date().getTime());
        const text = await res.text();
        const lines = text.trim().split('\n').filter(l => l.length > 0);

        archiveData = {}; 
        lines.forEach(line => {
            const [event, year, month, id, title] = line.split('|').map(s => s.trim());
            if (!archiveData[event]) archiveData[event] = {};
            if (!archiveData[event][year]) archiveData[event][year] = {};
            if (!archiveData[event][year][month]) archiveData[event][year][month] = [];
            archiveData[event][year][month].push({ id, title });
        });
        renderGrid();
    } catch (e) { document.getElementById('lists-container').innerHTML = "Ensure data/list_index.txt exists."; }
}

function renderGrid() {
    const container = document.getElementById('lists-container');
    const breadcrumb = document.getElementById('breadcrumb-nav');
    container.innerHTML = ""; 

    let items = [];
    if (!currentPath.event) {
        breadcrumb.innerHTML = "Main Dashboard";
        Object.keys(archiveData).forEach(ev => items.push({ title: ev, sub: "PLATFORM", action: () => navigate(ev, null, null) }));
    } else if (!currentPath.year) {
        breadcrumb.innerHTML = `<span onclick="resetNav()">Dashboard</span> / ${currentPath.event}`;
        Object.keys(archiveData[currentPath.event]).forEach(yr => items.push({ title: yr, sub: "YEAR", action: () => navigate(currentPath.event, yr, null) }));
    } else if (!currentPath.month) {
        breadcrumb.innerHTML = `<span onclick="resetNav()">Dashboard</span> / <span onclick="navigate('${currentPath.event}',null,null)">${currentPath.event}</span> / ${currentPath.year}`;
        Object.keys(archiveData[currentPath.event][currentPath.year]).forEach(mo => items.push({ title: mo, sub: "MONTH", action: () => navigate(currentPath.event, currentPath.year, mo) }));
    } else {
        breadcrumb.innerHTML = `<span onclick="resetNav()">Dashboard</span> / <span onclick="navigate('${currentPath.event}',null,null)">${currentPath.event}</span> / <span onclick="navigate('${currentPath.event}','${currentPath.year}',null)">${currentPath.year}</span> / ${currentPath.month}`;
        archiveData[currentPath.event][currentPath.year][currentPath.month].forEach(ep => items.push({ title: ep.title, sub: "EPISODE", action: () => location.href=`list.html?id=${ep.id}` }));
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.onclick = item.action;
        div.innerHTML = `<div class="card-header"><h3>${item.title}</h3></div><div class="card-footer">EXPLORE ${item.sub} →</div>`;
        container.appendChild(div);
    });
}

function navigate(ev, yr, mo) { currentPath = { event: ev, year: yr, month: mo }; renderGrid(); }
function resetNav() { currentPath = { event: null, year: null, month: null }; renderGrid(); }
function toggleGen() { const p = document.getElementById('generator-panel'); p.style.display = p.style.display === 'none' ? 'block' : 'none'; }

function processAndDownload() {
    const raw = document.getElementById('rawInput').value;
    const date = document.getElementById('globalDate').value.trim();
    const name = document.getElementById('fileName').value.trim() || "new_list";
    if (!raw || !date) return alert("Missing info!");
    const formatted = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0)
        .map(l => `${l.toUpperCase()} | # | ${date}`).join('\n');
    const blob = new Blob([formatted], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + ".txt";
    a.click();
}
