
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
                    <h2> ${user.name}</h2><br/>
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
  style="background: ${bid.pending ? 'green': '#ccc' };"
  onclick='thisUserBidPending({ userid: "${user.username}", userbid_id: "${userbidid}" })'
>
  Pending
</div>

<div
  id="${user.username + "_" + userbidid + "_con"}"
  style="background: ${bid.got ? 'green': '#ccc' };"
  onclick='thisUserBidConfirm({ userid: "${user.username}", userbid_id: "${userbidid}" })'
>
  Confirm
</div>

            </div>
        </div>
        <div id="${user.username+"_m_"+userbidid}"></div>
      `;
                        }).join('')
                        : '<i>No loads found</i><br/><hr/>'}

<br/>
                    <strong>Messages:</strong><br/>
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
                `;
                usersList.appendChild(userDiv);
            });
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
        document.getElementById(userid + "_m_" + userbid_id).innerText ='Not authenticated.';
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
        document.getElementById(userid + "_m_" + userbid_id).innerText = 'Error toggling pending:'+ error;
        document.getElementById(userid + "_m_" + userbid_id).innerText ='Network error toggling pending status.';
    }
}

async function thisUserBidConfirm({ userid, userbid_id }) {
    const username = getCookie('username');
    const password = getCookie('password');
    if (!username || !password) {
        document.getElementById(userid + "_m_" + userbid_id).innerText ='Not authenticated.';
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
        document.getElementById(userid + "_m_" + userbid_id).innerText = 'Error toggling confirm:'+ error;
        document.getElementById(userid + "_m_" + userbid_id).innerText ='Network error toggling confirm status.';
    }
}