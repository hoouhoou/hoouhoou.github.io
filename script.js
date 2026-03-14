let archiveData = {};
let currentPath = { event: null, year: null, month: null };

async function loadMasterLists() {
    try {
        const res = await fetch('data/list_index.txt?t=' + new Date().getTime());
        const text = await res.text();
        const lines = text.trim().split('\n').filter(l => l.length > 0);

        // Build the data object
        lines.forEach(line => {
            const [event, year, month, id, title] = line.split('|').map(s => s.trim());
            if (!archiveData[event]) archiveData[event] = {};
            if (!archiveData[event][year]) archiveData[event][year] = {};
            if (!archiveData[event][year][month]) archiveData[event][year][month] = [];
            archiveData[event][year][month].push({ id, title });
        });

        renderGrid();
    } catch (e) { console.error("Archive Load Error", e); }
}

function renderGrid() {
    const container = document.getElementById('lists-container');
    const breadcrumb = document.getElementById('breadcrumb-nav');
    let html = '';

    // Step 1: Handle Home View (Events)
    if (!currentPath.event) {
        breadcrumb.innerHTML = "Main Archive";
        Object.keys(archiveData).forEach(event => {
            html += `<div class="dir-button" onclick="navigate('${event}', null, null)">
                        <h3>${event}</h3><p>Browse Event</p>
                     </div>`;
        });
    } 
    // Step 2: Handle Year View
    else if (currentPath.event && !currentPath.year) {
        breadcrumb.innerHTML = `<span onclick="resetNav()">Main Archive</span> > ${currentPath.event}`;
        Object.keys(archiveData[currentPath.event]).forEach(year => {
            html += `<div class="dir-button" onclick="navigate('${currentPath.event}', '${year}', null)">
                        <h3>${year}</h3><p>Archive Year</p>
                     </div>`;
        });
    }
    // Step 3: Handle Month View
    else if (currentPath.year && !currentPath.month) {
        breadcrumb.innerHTML = `<span onclick="resetNav()">Main Archive</span> > <span onclick="navigate('${currentPath.event}', null, null)">${currentPath.event}</span> > ${currentPath.year}`;
        Object.keys(archiveData[currentPath.event][currentPath.year]).forEach(month => {
            html += `<div class="dir-button" onclick="navigate('${currentPath.event}', '${currentPath.year}', '${month}')">
                        <h3>${month}</h3><p>Month Archive</p>
                     </div>`;
        });
    }
    // Step 4: Handle Episode View
    else {
        breadcrumb.innerHTML = `<span onclick="resetNav()">Main Archive</span> > <span onclick="navigate('${currentPath.event}', null, null)">${currentPath.event}</span> > <span onclick="navigate('${currentPath.event}', '${currentPath.year}', null)">${currentPath.year}</span> > ${currentPath.month}`;
        archiveData[currentPath.event][currentPath.year][currentPath.month].forEach(item => {
            html += `<div class="dir-button" onclick="location.href='list.html?id=${item.id}'">
                        <h3>${item.title}</h3><p>View Episode</p>
                     </div>`;
        });
    }

    container.innerHTML = html;
}

function navigate(ev, yr, mo) {
    currentPath = { event: ev, year: yr, month: mo };
    renderGrid();
}

function resetNav() {
    currentPath = { event: null, year: null, month: null };
    renderGrid();
}

// Keep your processAndDownload and handleLogin functions below...
