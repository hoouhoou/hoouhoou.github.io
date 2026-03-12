// script.js
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent actual form submission

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Basic validation
    if (email === '' || password === '') {
        alert('Please fill in all fields');
        return;
    }

    // Simple email format check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // If validation passes, you can proceed with actual authentication
    alert('Login successful! (This is a demo — no data is sent)');
    // Here you would normally send the data to your server
});
