// 1. SECURITY GATE
(function() {
    const isAuth = sessionStorage.getItem('isAuth');
    const path = window.location.pathname;
    const isIndex = path.endsWith('index.html') || path === '/' || path.endsWith('');
    if (!isIndex && isAuth !== 'true') window.location.href = 'index.html';
})();

// 2. LOGIN LOGIC
function handleLogin(e) {
    if (e) e.preventDefault();
    const passwordField = document.getElementById('password');
    if (passwordField && passwordField.value === "jesus christ superstar") {
        sessionStorage.setItem('isAuth', 'true');
        window.location.href = 'dashboard.html';
    } else {
        const err = document.getElementById('errorMessage');
        if(err) err.style.display = 'block';
    }
}

// 3. ARCHIVE DIRECTORY LOADER (Dashboard)
async function loadMasterLists() {
    const container = document.getElementById('lists-container');
    if(!container) return;

    try {
        const res = await fetch('data/list_index.txt?t=' + new Date().getTime());
        if (!res.ok) throw new Error("Index not found");
        
        const text = await res.text();
        const lines = text.trim().split('\n').filter(l => l.length > 0);

        // Organize data: Event -> Year -> Month
        const archive = {};

        lines.forEach(line => {
            const parts = line.split('|').map(s => s.trim());
            if (parts.length < 5) return; // Skip lines that don't match the new format

            const [event, year, month, id, title] = parts;
            
            if (!archive[event]) archive[event] = {};
            if (!archive[event][year]) archive[event][year] = {};
            if (!archive[event][year][month]) archive[event][year][month] = [];
            
            archive[event][year][month].push({ id, title });
        });

        // Build HTML
        let html = '';
        for (const event in archive) {
            html += `<div class="archive-section"><span class="event-header">${event}</span>`;
            
            for (const year in archive[event]) {
                html += `<div class="year-block"><span class="year-label">${year}</span>`;
                
                for (const month in archive[event][year]) {
                    html += `<div class="month-group">`;
                    archive[event][year][month].forEach(item => {
                        html += `
                            <a href="list.html?id=${item.id}" class="directory-item">
                                <span class="item-name">${item.title}</span>
                                <span class="item-meta">${month}</span>
                            </a>`;
                    });
                    html += `</div>`;
                }
                html += `</div>`;
            }
            html += `</div>`;
        }
        container.innerHTML = html || "<p>No archives found. Update data/list_index.txt.</p>";

    } catch (e) {
        container.innerHTML = `<p style="color:red; text-align:center;">Error: ${e.message}. Please check data/list_index.txt format.</p>`;
    }
}

// 4. SEARCH FILTER
function filterLists() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.directory-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(input) ? "flex" : "none";
    });
}

// 5. DATA GENERATOR
function toggleGenerator() {
    const panel = document.getElementById('generator-section');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function processAndDownload() {
    const raw = document.getElementById('rawInput').value;
    const date = document.getElementById('globalDate').value.trim();
    const name = document.getElementById('fileName').value.trim() || "new_list";
    if (!raw || !date) return alert("Please fill in the date and paste your data.");

    const formatted = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0)
        .map(l => `${l.toUpperCase()} | # | ${date}`).join('\n');

    const blob = new Blob([formatted], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + ".txt";
    a.click();
}

// 6. ITEM LOADER (For list.html)
async function loadListItems() {
    const id = new URLSearchParams(window.location.search).get('id');
    const container = document.getElementById('items-container');
    if (!id || !container) return;
    try {
        const res = await fetch(`data/${id}.txt?t=` + new Date().getTime());
        if (!res.ok) throw new Error(`File data/${id}.txt not found.`);
        const text = await res.text();
        document.getElementById('list-title').textContent = id.toUpperCase().replace(/_/g, ' ');
        const lines = text.trim().split('\n').filter(l => l.length > 0);
        
        container.innerHTML = lines.map(line => {
            const [name, url, date] = line.split('|').map(s => s.trim());
            const isClickable = (url && url !== '#');
            const content = isClickable 
                ? `<a href="${url}" target="_blank">${name}</a>` 
                : `<span style="font-weight:700; color:#2d3436;">${name}</span>`;

            return `<div class="item-card">${content}<span class="date">${date}</span></div>`;
        }).join('');
    } catch (e) { container.innerHTML = `<p style="color:red; text-align:center;">${e.message}</p>`; }
}

function logout() { sessionStorage.removeItem('isAuth'); window.location.href = 'index.html'; }
