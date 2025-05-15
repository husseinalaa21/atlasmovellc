const isTestMode = ["localhost", "127.0.0.1"].includes(location.hostname);
const serverURL = isTestMode ? "http://localhost:5000" : "https://server.atlasmovellc.com";

// Auto-login if cookies exist
async function autoLoginIfCookiesExist() {
    // FOR BACKGROUND STYLE 
    const backgrounds = [
        './inside_2-min.jpg',
        './inside_3-min.jpg',
        './inside_4-min.jpg',
        './inside_5-min.jpg',
        './inside_6-min.jpg',
        './inside-min.jpg',
    ];

    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    const chosenBackground = backgrounds[randomIndex];

    const proInsideElem = document.querySelector('.pro_login');
    if (proInsideElem) {
        proInsideElem.style.backgroundImage = `url('${chosenBackground}')`;
    }
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return null;
    }

    const username = getCookie('username');
    const password = getCookie('password');

    if (username && password) {
        try {
            const response = await fetch(`${serverURL}/user_login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                window.location.href = '/driver_inside.html';
            } else {
                // Clear invalid cookies
                document.cookie = 'username=; path=/; max-age=0';
                document.cookie = 'password=; path=/; max-age=0';
            }
        } catch (error) {
            console.error('Auto-login failed:', error);
        }
    }
}

window.addEventListener('DOMContentLoaded', autoLoginIfCookiesExist);

document.getElementById('loginForm_011').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('errorMsg_011');
    const successMsg = document.getElementById('successMsg_011');

    errorMsg.textContent = '';
    successMsg.textContent = '';

    try {
        const response = await fetch(`${serverURL}/user_login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json(); if (response.ok) {
            successMsg.textContent = 'Login successful! Redirecting...';

            document.cookie = `username=${encodeURIComponent(username)}; path=/; max-age=${7 * 24 * 60 * 60}`;
            document.cookie = `password=${encodeURIComponent(password)}; path=/; max-age=${7 * 24 * 60 * 60}`;

            setTimeout(() => {
                window.location.href = '/driver_inside.html';
            }, 1500);
        } else {
            // Delete cookies if login failed
            document.cookie = 'username=; path=/; max-age=0';
            document.cookie = 'password=; path=/; max-age=0';

            errorMsg.textContent = result.error || result.message || 'Invalid login credentials.';
        }

    } catch (err) {
        errorMsg.textContent = 'Network error. Please try again later.';
        // Delete cookies if login failed
        document.cookie = 'username=; path=/; max-age=0';
        document.cookie = 'password=; path=/; max-age=0';

        errorMsg.textContent = result.error || result.message || 'Invalid login credentials.';
    }
});