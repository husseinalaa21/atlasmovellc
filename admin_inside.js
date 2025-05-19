
const isTestMode = ["localhost", "127.0.0.1"].includes(location.hostname);
const serverURL = isTestMode ? "http://localhost:5000" : "https://server.atlasmovellc.com";
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
}
const username = getCookie('username');
const password = getCookie('password');

function openMain(id) {
    const el = document.getElementById(id);
    if (!el) {
        return;
    }
    if (el.style.display === "none" || el.style.display === "") {
        el.style.display = "block";
    } else {
        el.style.display = "none";
    }

    // Update the URL param 'child' with the current id
    const url = new URL(window.location);
    url.searchParams.set('child', id);
    window.history.replaceState(null, '', url.toString());
};

let locations = [];
let currentPayload = null;

async function loadLocations() {
    try {
        const response = await fetch('locations_.json');
        if (!response.ok) throw new Error('Failed to load locations_.json');
        locations = await response.json();
    } catch (error) {
        alert('Error loading locations data: ' + error.message);
    }
}

loadLocations();

function haversineDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) {
        return x * Math.PI / 180;
    }
    const R = 3958.8; // Earth radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

document.getElementById('loadForm').addEventListener('submit', function (event) {
    event.preventDefault();

    if (locations.length === 0) {
        alert('Locations data not loaded yet. Please wait.');
        return;
    }

    const pickupZip = parseInt(document.getElementById("pickup_zip").value);
    const dropoffZip = parseInt(document.getElementById("dropoff_zip").value);

    const pickupLocation = locations.find(loc => loc.zip_code === pickupZip);
    const dropoffLocation = locations.find(loc => loc.zip_code === dropoffZip);

    if (!pickupLocation) {
        alert("Pickup zip code not found in locations data.");
        return;
    }
    if (!dropoffLocation) {
        alert("Dropoff zip code not found in locations data.");
        return;
    }

    // Calculate loaded miles automatically
    const loadedMiles = Math.round(haversineDistance(
        pickupLocation.latitude, pickupLocation.longitude,
        dropoffLocation.latitude, dropoffLocation.longitude
    ));

    const pickupTimeInput = document.getElementById("pickup_time").value;
    const dropoffTimeInput = document.getElementById("dropoff_time").value;

    const pickupTime = pickupTimeInput ? pickupTimeInput : "ASAP";
    const dropoffTime = dropoffTimeInput ? dropoffTimeInput : "Direct";

    currentPayload = {
        pickup: {
            city: document.getElementById("pickup_city").value,
            state: document.getElementById("pickup_state").value.toUpperCase(),
            zip_code: pickupZip,
            lat: pickupLocation.latitude,
            lng: pickupLocation.longitude
        },
        dropoff: {
            city: document.getElementById("dropoff_city").value,
            state: document.getElementById("dropoff_state").value.toUpperCase(),
            zip_code: dropoffZip,
            lat: dropoffLocation.latitude,
            lng: dropoffLocation.longitude
        },
        loaded_miles: loadedMiles,
        pickup_date: {
            date: document.getElementById("pickup_date").value,
            time: pickupTime
        },
        drop_off_date: {
            date: document.getElementById("dropoff_date").value,
            time: dropoffTime
        },
        price: document.getElementById("price").value || "N/A",
        details: {
            distance: document.getElementById("distance").value,
            weight: document.getElementById("weight").value,
            pieces: parseInt(document.getElementById("pieces").value),
            size: document.getElementById("size").value
        }
    };

    const reviewDiv = document.getElementById('review_load');
    reviewDiv.style.display = 'block';
    reviewDiv.innerHTML = `
    <h3>Review Load Details</h3>
    <p><strong>Pickup:</strong> ${currentPayload.pickup.city}, ${currentPayload.pickup.state} ${currentPayload.pickup.zip_code} (Lat: ${currentPayload.pickup.lat}, Lng: ${currentPayload.pickup.lng})</p>
    <p><strong>Dropoff:</strong> ${currentPayload.dropoff.city}, ${currentPayload.dropoff.state} ${currentPayload.dropoff.zip_code} (Lat: ${currentPayload.dropoff.lat}, Lng: ${currentPayload.dropoff.lng})</p>
    <p><strong>Loaded Miles (calculated):</strong> ${loadedMiles} miles</p>
    <p><strong>Pickup Date & Time:</strong> ${currentPayload.pickup_date.date} ${currentPayload.pickup_date.time}</p>
    <p><strong>Dropoff Date & Time:</strong> ${currentPayload.drop_off_date.date} ${currentPayload.drop_off_date.time}</p>
    <p><strong>Price:</strong> ${currentPayload.price}</p>
    <p><strong>Distance:</strong> ${currentPayload.details.distance}</p>
    <p><strong>Weight:</strong> ${currentPayload.details.weight}</p>
    <p><strong>Pieces:</strong> ${currentPayload.details.pieces}</p>
    <p><strong>Size:</strong> ${currentPayload.details.size}</p>
    <button id="confirmBtn" onclick="confirmLoad()">Confirm</button>
  `;
});

async function confirmLoad() {
    if (!currentPayload) {
        alert('No load data to submit.');
        return;
    }

    try {
        const response = await fetch(`${serverURL}/new_load`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password,
                newLoad: currentPayload
            })
        });
        if (response.ok) {
            alert('Load submitted successfully!');
            document.getElementById('loadForm').reset();
            document.getElementById('review_load').style.display = 'none';
            currentPayload = null;
        } else {
            alert('Failed to submit load. Server responded with ' + response.status);
        }
    } catch (error) {
        alert('Error submitting load: ' + error.message);
    }
}

document.addEventListener("DOMContentLoaded", async function () {
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
            window.location.href = '/admin_login.html';
            return;
        }

        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
        const update_yourname = document.getElementById("update_yourname")
        update_yourname.innerText = `${greeting}, ${result.name || 'Admin'}`;
        // Populate users list
        const usersList = document.getElementById('usersList');
        if (usersList && Array.isArray(result.users)) {
            usersList.innerHTML = '';
            result.users.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.classList.add('user-section');
                userDiv.className = "driver_con"
                userDiv.innerHTML = `
                    <h2 onclick="openMain('${user.username + "_main"}')" > ${user.name}</h2><br/>
                    <div id="${user.username + "_main"}" style="display:none;">
                    <div class="username_con">
                    <strong>Email:</strong> ${user.email || 'N/A'}<br/>
                    <strong>Phone:</strong> ${user.phone || 'N/A'}<br/>
                    <strong>Zip Code:</strong> ${user.zip_code || 'N/A'}<br/>
                    <strong>User ID:</strong> ${user._id}<br/><br/>
                    <h3>Bids:</h3><br/>
                    ${Array.isArray(user.bids) && user.bids.length > 0
                        ? user.bids.map(bid => {
                            const load = bid.loadDetails || {};
                            const userid = user._id || '';          // replace with actual user ID variable if different
                            const userbidid = bid._id || bid.loadId; // replace with actual bid ID variable if different

                            // Escape quotes in onclick handlers by using single quotes outside, double quotes inside
                            return `
        <div class="load-entry">
            <strong>Load ID:</strong> ${bid.loadId}<br/>
            <strong>Price per Mile:</strong> $${bid.pricePerMile}<br/>
            <strong>Pending:</strong> ${bid.pending}<br/>
            <strong>Got:</strong> ${bid.got}<br/>
            <strong>Created At:</strong> ${bid.createdAt ? new Date(bid.createdAt).toLocaleString() : 'N/A'}<br/>
            <strong>Pickup Location:</strong> ${load.pickupLoc || 'N/A'}<br/>
            <strong>Pickup Date:</strong> ${load.pickupDate || 'N/A'}<br/>
            <strong>Delivery Location:</strong> ${load.deliveryLoc || 'N/A'}<br/>
            <strong>Drop-off Date:</strong> ${load.dropOffDate || 'N/A'}<br/>
            <strong>Miles:</strong> ${load.miles || 'N/A'}<br/>
            <strong>Price:</strong> $${load.price || 'N/A'}<br/>
            <strong>Weight:</strong> ${load.weight || 'N/A'}<br/>
            <strong>Pieces:</strong> ${load.pieces || 'N/A'}<br/>
            <strong>Size:</strong> ${load.size || 'N/A'}<br/>

            <div class="admin_action">
<div
  id="${user.username + "_" + userbidid + "_pen"}"
  style="background: ${bid.pending ? 'green' : '#ccc'};"
  onclick='thisUserBidPending({ userid: "${user.username}", userbid_id: "${userbidid}" })'
>
  Pending
</div>

<div
  id="${user.username + "_" + userbidid + "_con"}"
  style="background: ${bid.got ? 'green' : '#ccc'};"
  onclick='thisUserBidConfirm({ userid: "${user.username}", userbid_id: "${userbidid}" })'
>
  Confirm
</div>

            </div>
        </div>
        <div id="${user.username + "_m_" + userbidid}"></div>
      `;
                        }).join('')
                        : '<i>No loads found</i><br/><hr/>'}

<br/>
                    <strong>Messages:</strong><br/>
${Array.isArray(user.messages) && user.messages.length > 0
                        ? user.messages.map(msg => {
                            const messageText = typeof msg === 'object' ? (msg.message || msg.text || JSON.stringify(msg)) : msg;
                            const messageDate = msg.createdAt || msg.date;
                            return `
        <div class="message-entry">
            ${messageDate ? new Date(messageDate).toLocaleString() : 'N/A'} - ${messageText}<br/>
        </div>
      `;
                        }).join('')
                        : '<i>No messages</i><br/>'}
<hr/>

<!-- Message input section -->
<div class="send-message-section" style="margin-top: 10px;">
  <input type="text" id="message_input_${user.username}" placeholder="Write a message..." style="width: 70%;" />
  <button onclick="sendMessageToUser('${user.username}')" style="padding: 5px 10px;">Send</button>
</div>
<br/><hr/>
</div>
</div>
                `;
                usersList.appendChild(userDiv);

            });
        }


        const urlParams = new URLSearchParams(window.location.search);
        const childId = urlParams.get('child');
        if (childId) {
            const el = document.getElementById(childId);
            if (el) {
                el.style.display = "block";
                console.log(`Displayed element with id=${childId} from URL param`);
            } else {
                console.log(`No element found with id=${childId}`);
            }
        }

    } catch (err) {
        alert(err)
        // Network or other error: clear cookies and redirect to login
        document.cookie = 'username=; path=/; max-age=0';
        document.cookie = 'password=; path=/; max-age=0';
        window.location.href = '/admin_login.html';
    }
});


async function sendMessageToUser(username) {
    const inputId = `message_input_${username}`;
    const message = document.getElementById(inputId).value.trim();
    if (!message) {
        console.log("Message cannot be empty.");
        return;
    }

    const adminUsername = getCookie('username');
    const adminPassword = getCookie('password');

    if (!adminUsername || !adminPassword) {
        console.log("Not authenticated.");
        return;
    }

    try {
        const response = await fetch(`${serverURL}/admin_send_message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: adminUsername,
                password: adminPassword,
                toUser: username,
                message
            })
        });

        const result = await response.json();
        if (response.ok) {
            console.log(`Message sent: ${result.message}`);
            location.reload(); // Optional: Refresh to show new message
        } else {
            console.log(`Failed to send message: ${result.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}


async function thisUserBidPending({ userid, userbid_id }) {
    const username = getCookie('username');
    const password = getCookie('password');
    if (!username || !password) {
        document.getElementById(userid + "_m_" + userbid_id).innerText = 'Not authenticated.';
        return;
    }

    try {
        const response = await fetch(`${serverURL}/admin_toggle_pending`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userid, userbid_id, username, password }),
        });
        const result = await response.json();
        if (response.ok) {
            const el = document.getElementById(userid + "_" + userbid_id + "_pen");
            if (el) el.style.background = result.status ? "green" : "#ccc";

            document.getElementById(userid + "_m_" + userbid_id).innerText = `Pending status updated: ${result.message || 'Success'}`;
            // Optionally reload or update UI dynamically here
            // location.reload();
        } else {
            document.getElementById(userid + "_m_" + userbid_id).innerText = `Failed to update pending status: ${result.error || 'Unknown error'}`;
        }
    } catch (error) {
        document.getElementById(userid + "_m_" + userbid_id).innerText = 'Error toggling pending:' + error;
        document.getElementById(userid + "_m_" + userbid_id).innerText = 'Network error toggling pending status.';
    }
}

async function thisUserBidConfirm({ userid, userbid_id }) {
    const username = getCookie('username');
    const password = getCookie('password');
    if (!username || !password) {
        document.getElementById(userid + "_m_" + userbid_id).innerText = 'Not authenticated.';
        return;
    }

    try {
        const response = await fetch(`${serverURL}/admin_toggle_confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userid, userbid_id, username, password }),
        });
        const result = await response.json();
        if (response.ok) {
            const el = document.getElementById(userid + "_" + userbid_id + "_con");
            if (el) el.style.background = result.status ? "green" : "#ccc";

            document.getElementById(userid + "_m_" + userbid_id).innerText = `Confirm status updated: ${result.message || 'Success'}`;;
            // Optionally reload or update UI dynamically here
            // location.reload();
        } else {
            document.getElementById(userid + "_m_" + userbid_id).innerText = `Failed to update confirm status: ${result.error || 'Unknown error'}`;
        }
    } catch (error) {
        document.getElementById(userid + "_m_" + userbid_id).innerText = 'Error toggling confirm:' + error;
        document.getElementById(userid + "_m_" + userbid_id).innerText = 'Network error toggling confirm status.';
    }
}


function logout() {
    // Delete the cookies by setting max-age to 0
    document.cookie = 'username=; path=/; max-age=0';
    document.cookie = 'password=; path=/; max-age=0';

    // Redirect to login page
    window.location.href = '/login.html';
}