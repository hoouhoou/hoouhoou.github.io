document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Hardcoded credentials (for demo only)
    const validEmail = 'RJTV';
    const validPassword = 'admin123';

    if (email === validEmail && password === validPassword) {
        // Redirect to the dashboard page
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid email or password');
    }
});
