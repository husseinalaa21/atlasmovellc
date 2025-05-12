function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

const accessId = getQueryParam('id');
const isTestMode = ["localhost", "127.0.0.1"].includes(location.hostname);
const serverURL = isTestMode ? "http://localhost:5000/" : "https://server.atlasmovellc.com/";

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.style.display = (section.style.display === 'block') ? 'none' : 'block';
}

async function loadApplications() {
    if (!accessId) return;

    const applicationsList = document.getElementById('applicationsList');
    applicationsList.innerHTML = '<p>Loading applications...</p>';

    try {
        const response = await fetch(serverURL + 'applications_request?id=' + accessId);
        const result = await response.json();

        if (response.ok && result.applications) {
            // ✅ Show page
            document.getElementById('securedContent').style.display = 'block';

            applicationsList.innerHTML = '';
            applications__1.innerHTML = `You have ${result.applications.length} drivers`;
            result.applications.forEach(applicant => {
                applicant.applications.forEach(application => {
                    const appDiv = document.createElement('div');
                    appDiv.classList.add('application-item');
                    appDiv.innerHTML = `
                <strong>Name:</strong> ${application.firstName} ${application.lastName}<br/>
                <strong>Email:</strong> ${application.email}<br/>
                <strong>Phone:</strong> ${application.phone}<br/>
                <strong>City:</strong> ${application.city}<br/>
                <strong>State:</strong> ${application.state}<br/>
                <strong>ZIP:</strong> ${application.zip}<br/>
                <strong>Driver Type:</strong> ${application.driverType}<br/>
                <strong>Vehicle Model:</strong> ${application.vehicleModel}<br/>
                <strong>Vehicle Type:</strong> ${application.vehicleType}<br/>
                <strong>Application ID:</strong> ${application.applicationId}<br/>
                <strong>Date:</strong> ${new Date(application.applicationDate).toLocaleString()}
              `;
                    applicationsList.appendChild(appDiv);
                });
            });
        } else {
            applicationsList.innerHTML = '<p>❌ Error loading applications.</p>';
        }
    } catch (error) {
        console.error('Error fetching applications:', error);
        applicationsList.innerHTML = '<p>❌ Error loading applications.</p>';
    }
}

document.getElementById('applicationForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!accessId) return;

    const status = document.getElementById('statusMessage');
    status.textContent = 'Submitting...';

    const data = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value,
        phone: document.getElementById('phone').value,
        driverType: document.getElementById('driverType').value,
        vehicleModel: document.getElementById('vehicleModel').value,
        vehicleType: document.getElementById('vehicleType').value,
        sendEmail: document.getElementById('sendEmail').checked
    };

    try {
        const response = await fetch(serverURL + 'applications_add?id=' + accessId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            status.textContent = `✅ Application submitted! ID: ${result.applicationId}`;
            status.style.color = 'green';
            document.getElementById('applicationForm').reset();
            loadApplications();
        } else {
            status.textContent = `❌ ${result.message || 'Submission failed'}`;
            status.style.color = 'red';
        }
    } catch (error) {
        console.error('Submit Error:', error);
        status.textContent = `❌ Error submitting application.`;
        status.style.color = 'red';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    if (accessId) {
        loadApplications();
    } else {
        document.getElementById('applicationsList').innerHTML = '<p>❌ Access denied. Missing ID.</p>';
    }
});