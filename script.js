let archiveData = {};
let currentPath = { event: null, year: null, month: null };

async function loadMasterLists() {
    try {
        const res = await fetch('data/list_index.txt?t=' + Date.now());
        const text = await res.text();
        const lines = text.trim().split('\n').filter(l => l.length > 0);
        
        archiveData = {}; 
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
    } catch (e) { console.error("Data Load Error", e); }
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
        breadcrumb.innerHTML = `ROOT / <span onclick="resetNav()" style="cursor:pointer; color:#8b5cf6;">DASHBOARD</span> / ${currentPath.event}`;
        Object.keys(archiveData[currentPath.event]).forEach(yr => items.push({ title: yr, sub: "YEAR", action: () => navigate(currentPath.event, yr, null) }));
    } else if (!currentPath.month) {
        breadcrumb.innerHTML = `ROOT / <span onclick="resetNav()" style="cursor:pointer; color:#8b5cf6;">DASHBOARD</span> / <span onclick="navigate('${currentPath.event}',null,null)" style="cursor:pointer; color:#8b5cf6;">${currentPath.event}</span> / ${currentPath.year}`;
        Object.keys(archiveData[currentPath.event][currentPath.year]).forEach(mo => items.push({ title: mo, sub: "MONTH", action: () => navigate(currentPath.event, currentPath.year, mo) }));
    } else {
        breadcrumb.innerHTML = `ROOT / <span onclick="resetNav()" style="cursor:pointer; color:#8b5cf6;">DASHBOARD</span> / <span onclick="navigate('${currentPath.event}',null,null)" style="cursor:pointer; color:#8b5cf6;">${currentPath.event}</span> / <span onclick="navigate('${currentPath.event}','${currentPath.year}',null)" style="cursor:pointer; color:#8b5cf6;">${currentPath.year}</span> / ${currentPath.month}`;
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

function processAndDownload() {
    const date = document.getElementById('globalDate').value.trim();
    const input = document.getElementById('rawInput').value.trim();
    
    if(!date || !input) {
        alert("Please provide both a date and raw data.");
        return;
    }

    const formatted = input.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `${line.toUpperCase()} | | ${date}`)
        .join('\n');

    const blob = new Blob([formatted], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `new_setlist.txt`;
    a.click();
}
