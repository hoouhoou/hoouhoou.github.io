// 1. SECURITY GATE
(function() {
    const isAuth = sessionStorage.getItem('isAuth');
    const path = window.location.pathname;
    if (!path.endsWith('index.html') && path !== '/' && isAuth !== 'true') {
        window.location.href = 'index.html';
    }
})();

// 2. DASHBOARD LOADER
async function loadMasterLists() {
    try {
        const res = await fetch('data/list_index.txt');
        const text = await res.text();
        const container = document.getElementById('lists-container');
        if(!container) return;

        const lines = text.trim().split('\n');
        container.innerHTML = lines.map(line => {
            const [id, name, modified] = line.split('|').map(s => s.trim());
            return `
                <div class="list-card" onclick="location.href='list.html?id=${id}'">
                    <h3>${name}</h3>
                    <p>Modified: ${modified}</p>
                </div>
            `;
        }).join('');
    } catch (e) { console.error("Error loading index:", e); }
}

// 3. GENERATOR LOGIC
function toggleGenerator() {
    const panel = document.getElementById('generator-section');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function processAndDownload() {
    const raw = document.getElementById('rawInput').value;
    const date = document.getElementById('globalDate').value.trim();
    let name = document.getElementById('fileName').value.trim();

    if (!raw || !date) return alert("Please paste data and enter a date.");

    const formattedContent = raw.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `${line.toUpperCase()} | # | ${date}`)
        .join('\n');

    const blob = new Blob([formattedContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (name || "new_list") + ".txt";
    a.click();
}

// 4. ITEM LOADER (For list.html)
async function loadListItems() {
    const id = new URLSearchParams(window.location.search).get('id');
    const titleEl = document.getElementById('list-title');
    const container = document.getElementById('items-container');
    if (!id) return;

    try {
        const res = await fetch(`data/${id}.txt`);
        const text = await res.text();
        titleEl.textContent = id.toUpperCase().replace('_', ' ');
        const lines = text.trim().split('\n');
        container.innerHTML = lines.map(line => {
            const [name, url, date] = line.split('|').map(s => s.trim());
            return `<div class="item-card"><a href="${url}" target="_blank">${name}</a><span class="date">${date}</span></div>`;
        }).join('');
    } catch (e) { titleEl.textContent = "List Not Found"; }
}

// 5. LOGIN/LOGOUT
function handleLogin(e) {
    e.preventDefault();
    if (document.getElementById('password').value === "jesus christ superstar") {
        sessionStorage.setItem('isAuth', 'true');
        window.location.href = 'dashboard.html';
    } else { document.getElementById('errorMessage').style.display = 'block'; }
}

function logout() {
    sessionStorage.removeItem('isAuth');
    window.location.href = 'index.html';
}
