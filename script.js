// --- 1. THE SECURITY GATE ---
(function() {
    const isAuth = sessionStorage.getItem('isAuth');
    const path = window.location.pathname;
    // Redirect if not logged in (unless already on login page)
    if (!path.endsWith('index.html') && path !== '/' && isAuth !== 'true') {
        window.location.href = 'index.html';
    }
})();

// --- 2. LOGIN LOGIC ---
function handleLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('password').value;
    if (pass === "jesus christ superstar") {
        sessionStorage.setItem('isAuth', 'true');
        window.location.href = 'dashboard.html';
    } else {
        document.getElementById('errorMessage').style.display = 'block';
    }
}

// --- 3. DASHBOARD: Load from list_index.txt ---
async function loadMasterLists() {
    try {
        const res = await fetch('data/list_index.txt');
        const text = await res.text();
        const container = document.getElementById('lists-container');
        
        const lines = text.trim().split('\n');
        container.innerHTML = lines.map(line => {
            const [id, name, modified] = line.split('|').map(s => s.trim());
            return `
                <div class="list-card" onclick="location.href='list.html?id=${id}'">
                    <h3>${name}</h3>
                    <p>Modified ${modified}</p>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error("Error loading dashboard manifest:", e);
    }
}

// --- 4. LIST ITEMS: Load from [id].txt ---
async function loadListItems() {
    const id = new URLSearchParams(window.location.search).get('id');
    const titleEl = document.getElementById('list-title');
    const container = document.getElementById('items-container');

    if (!id) return;

    try {
        const res = await fetch(`data/${id}.txt`);
        if (!res.ok) throw new Error("File not found");
        const text = await res.text();
        
        // Use the ID as a placeholder title until data loads
        titleEl.textContent = id.toUpperCase();

        const lines = text.trim().split('\n');
        container.innerHTML = lines.map(line => {
            const [name, url, date] = line.split('|').map(s => s.trim());
            return `
                <div class="item-card">
                    <a href="${url}" target="_blank">${name}</a>
                    <span class="date">${date}</span>
                </div>
            `;
        }).join('');
    } catch (e) {
        titleEl.textContent = "List not found";
        console.error(e);
    }
}

// --- 5. LOGOUT ---
function logout() {
    sessionStorage.removeItem('isAuth');
    window.location.href = 'index.html';
}
