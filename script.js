// 1. SECURITY GATE
(function() {
    const isAuth = sessionStorage.getItem('isAuth');
    const path = window.location.pathname;
    const isIndex = path.endsWith('index.html') || path === '/' || path.endsWith('') || path.includes('index');
    
    if (!isIndex && isAuth !== 'true') {
        window.location.href = 'index.html';
    }
})();

// 2. LOGIN LOGIC
function handleLogin(e) {
    if (e) e.preventDefault();
    const passwordField = document.getElementById('password');
    const errorMsg = document.getElementById('errorMessage');
    
    if (!passwordField) return;

    if (passwordField.value === "jesus christ superstar") {
        sessionStorage.setItem('isAuth', 'true');
        window.location.href = 'dashboard.html';
    } else {
        if (errorMsg) errorMsg.style.display = 'block';
        passwordField.value = '';
    }
}

// 3. DASHBOARD LOADER
async function loadMasterLists() {
    try {
        const res = await fetch('data/list_index.txt');
        if (!res.ok) throw new Error("Index not found");
        const text = await res.text();
        const container = document.getElementById('lists-container');
        if(!container) return;

        const lines = text.trim().split('\n').filter(l => l.length > 0);
        container.innerHTML = lines.map(line => {
            const parts = line.split('|').map(s => s.trim());
            if (parts.length < 3) return '';
            const [id, name, modified] = parts;
            return `
                <div class="list-card" onclick="location.href='list.html?id=${id}'">
                    <h3>${name}</h3>
                    <p>Modified: ${modified}</p>
                </div>
            `;
        }).join('');
    } catch (e) { 
        console.error("Error loading index:", e); 
        const container = document.getElementById('lists-container');
        if(container) container.innerHTML = "<p style='color:red'>Error: Make sure data/list_index.txt exists.</p>";
    }
}

// 4. GENERATOR LOGIC
function toggleGenerator() {
    const panel = document.getElementById('generator-section');
    if (panel) {
        // Switches between 'none' and 'block'
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    } else {
        console.error("Generator section not found in HTML");
    }
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 5. ITEM LOADER (For list.html)
async function loadListItems() {
    const id = new URLSearchParams(window.location.search).get('id');
    const titleEl = document.getElementById('list-title');
    const container = document.getElementById('items-container');
    if (!id || !container) return;

    try {
        const res = await fetch(`data/${id}.txt`);
        if (!res.ok) throw new Error("File not found");
        const text = await res.text();
        titleEl.textContent = id.toUpperCase().replace('_', ' ');
        const lines = text.trim().split('\n').filter(l => l.length > 0);
        container.innerHTML = lines.map(line => {
            const parts = line.split('|').map(s => s.trim());
            if (parts.length < 3) return '';
            const [name, url, date] = parts;
            return `<div class="item-card"><a href="${url}" target="_blank">${name}</a><span class="date">${date}</span></div>`;
        }).join('');
    } catch (e) { 
        titleEl.textContent = "List Not Found"; 
        container.innerHTML = `<p>File data/${id}.txt not found.</p>`;
    }
}

// 6. LOGOUT
function logout() {
    sessionStorage.removeItem('isAuth');
    window.location.href = 'index.html';
}
