// 1. SECURITY GATE
(function() {
    const isAuth = sessionStorage.getItem('isAuth');
    const path = window.location.pathname;
    const isIndex = path.endsWith('index.html') || path === '/' || path.endsWith('');
    if (!isIndex && isAuth !== 'true') window.location.href = 'index.html';
})();

// 2. LOGIN
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

// 3. DASHBOARD & SEARCH
async function loadMasterLists() {
    const container = document.getElementById('lists-container');
    if(!container) return;
    try {
        const res = await fetch('data/list_index.txt?t=' + new Date().getTime());
        if (!res.ok) throw new Error("Index not found");
        const text = await res.text();
        const lines = text.trim().split('\n').filter(l => l.length > 0);
        container.innerHTML = lines.map(line => {
            const [id, name, modified] = line.split('|').map(s => s.trim());
            return `
                <div class="list-card" data-title="${name.toLowerCase()}" onclick="location.href='list.html?id=${id}'">
                    <h3>${name}</h3>
                    <p>Last Update: ${modified}</p>
                </div>`;
        }).join('');
    } catch (e) { container.innerHTML = `<p style="color:red; text-align:center;">Please ensure data/list_index.txt exists.</p>`; }
}

function filterLists() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.list-card');
    cards.forEach(card => {
        const title = card.getAttribute('data-title');
        card.style.display = title.includes(input) ? "block" : "none";
    });
}

// 4. GENERATOR
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

// 5. VIEW LIST (list.html)
async function loadListItems() {
    const id = new URLSearchParams(window.location.search).get('id');
    const container = document.getElementById('items-container');
    if (!id || !container) return;
    try {
        const res = await fetch(`data/${id}.txt?t=` + new Date().getTime());
        if (!res.ok) throw new Error(`Setlist ${id} not found.`);
        const text = await res.text();
        document.getElementById('list-title').textContent = id.toUpperCase().replace(/_/g, ' ');
        const lines = text.trim().split('\n').filter(l => l.length > 0);
        
        container.innerHTML = lines.map(line => {
            const [name, url, date] = line.split('|').map(s => s.trim());
            const isClickable = (url && url !== '#');
            const content = isClickable 
                ? `<a href="${url}" target="_blank">${name}</a>` 
                : `<span style="font-weight:700; color:#2d3436;">${name}</span>`;

            return `
                <div class="item-card">
                    ${content}
                    <span class="date">${date}</span>
                </div>`;
        }).join('');
    } catch (e) { container.innerHTML = `<p style="color:red; text-align:center;">${e.message}</p>`; }
}

function logout() { sessionStorage.removeItem('isAuth'); window.location.href = 'index.html'; }
