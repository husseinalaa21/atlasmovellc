document.getElementById('applicationForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const isTestMode = ["localhost", "127.0.0.1"].includes(location.hostname);
    const serverURL = isTestMode ? "http://localhost:5000/apply" : "https://server.atlasmovellc.com/apply";
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(serverURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        var applications = document.getElementById("applications")
        var faild_app = document.getElementById("faild_app")
        if (response.ok) {
            applications.innerHTML = `<div class="submit_succ">
            Application submitted! Your Application ID is:  ${result.applicationId},
            Our team will contact you regarding the next steps within 24 hours.
            </div>`
        } else {
            faild_app.innerHTML = `<div class="faild_app"> Submission failed: ${result.message}. Please contact us at +1 (586) 782-6223. </div> `;
        }
    } catch (error) {
        console.error(error);
        alert("An error occurred while submitting the application.");
    }
});