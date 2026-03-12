document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Hardcoded credentials
    const validEmail = 'RJTV';
    const validPassword = 'admin123';

    if (email === validEmail && password === validPassword) {
        alert('Login successful! Redirecting...');
        // You can redirect to another page, e.g.:
        // window.location.href = 'dashboard.html';
    } else {
        alert('Invalid email or password');
    }
});
