document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('subscribeForm');
    const emailInput = document.getElementById('email_input');
    const messageBox = document.getElementById('subscribeMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();

        // Clear previous message
        messageBox.textContent = '';
        messageBox.style.display = 'none';
        messageBox.classList.remove('error');

        if (!email) {
            messageBox.textContent = 'Please enter a valid email address.';
            messageBox.classList.add('error');
            messageBox.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                messageBox.textContent = 'Thank you for subscribing!';
                emailInput.value = '';
            } else {
                const errorData = await response.json();
                messageBox.textContent = errorData.message || 'Subscription failed. Please try again.';
                messageBox.classList.add('error');
            }
        } catch (err) {
            messageBox.textContent = 'Network error. Please try again later.';
            messageBox.classList.add('error');
        }

        messageBox.style.display = 'block';
    });
});