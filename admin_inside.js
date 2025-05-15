document.addEventListener("DOMContentLoaded", async function () {
    const username = getCookie('username');
    const password = getCookie('password');


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

    const proInsideElem = document.querySelector('.pro_inside');
    if (proInsideElem) {
        proInsideElem.style.backgroundImage = `url('${chosenBackground}')`;
    }

    if (!username || !password) {
        // No login info, redirect to login page immediately
        window.location.href = '/admin_login.html';
        return;
    }

    try {
        const response = await fetch(`${serverURL}/admin_login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (!response.ok) {
            // Login failed: clear cookies and redirect to login page
            document.cookie = 'username=; path=/; max-age=0';
            document.cookie = 'password=; path=/; max-age=0';
            window.location.href = '/login.html';
        }
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

        update_yourname.innerText = `${greeting}, ${result.name || 'Admin'}`;

        // If success, you can continue showing the page or initialize user-specific stuff here
    } catch (err) {
        // Network or other error: clear cookies and redirect to login
        document.cookie = 'username=; path=/; max-age=0';
        document.cookie = 'password=; path=/; max-age=0';
        window.location.href = '/login.html';
    }

});