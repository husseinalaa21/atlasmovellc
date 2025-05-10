document.getElementById('loginForm_011').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('errorMsg_011');
    const successMsg = document.getElementById('successMsg_011');

    errorMsg.textContent = '';
    successMsg.textContent = '';

    try {
        const response = await fetch('/api/driver-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            successMsg.textContent = 'Login successful! Redirecting...';
            setTimeout(() => {
                window.location.href = '/driver-dashboard';
            }, 1500);
        } else {
            errorMsg.textContent = result.message || 'Invalid login credentials.';
        }
    } catch (err) {
        errorMsg.textContent = 'Network error. Please try again later.';
    }
});