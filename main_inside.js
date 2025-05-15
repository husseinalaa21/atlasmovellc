// On page load, validate user credentials from cookies
var update_yourname = document.getElementById("yourname_09")

// Rest of the code remains the same as previous version
let allLoads = [];
let allbids = []
let allLoads_ = []
let currentIndex = 0;
const batchSize = 4;

const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
};

const isTestMode = ["localhost", "127.0.0.1"].includes(location.hostname);
const serverURL = isTestMode ? "http://localhost:5000" : "https://server.atlasmovellc.com";


async function load_update(params) {

    flatpickr("#pickupDate", {
        minDate: "today",
        maxDate: new Date().fp_incr(14), // 14 days from today
        dateFormat: "Y-m-d",
        defaultDate: "today", // Set today's date as default
        disableMobile: true
    });


    await fetchLoadsFromServer();
    renderNextLoads();

    document.getElementById("load-more-btn").addEventListener("click", () => {
        renderNextLoads();
    });

    document.getElementById("search-form").addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const locationInput = formData.get("location").trim();
        const pickupDateInput = formData.get("pickupDate");
        const radiusInput = parseInt(formData.get("radius"));
        const container = document.getElementById("load-container");

        if (locationInput.length < 1) {
            // Reset to default loads and UI state
            container.innerHTML = "";
            currentIndex = 0;
            renderNextLoads();
            document.getElementById("load-more-btn").style.display = "block";
            return;
        }

        const userCoords = await geocodeLocation(locationInput);
        if (!userCoords) {
            container.innerHTML = 'Please enter a valid location:<br>- City, State (e.g., "Los Angeles, CA")<br>- ZIP Code (e.g., "10001")<br>- City Name (e.g., "Chicago")<br>- State Abbreviation (e.g., "TX")';
            return;
        }

        const filtered = allLoads
            .map(load => {
                const distance = haversineDistance(
                    userCoords.lat,
                    userCoords.lon,
                    load.pickup.lat,
                    load.pickup.lng
                );
                return {
                    ...load,
                    _distance: distance
                };
            })
            .filter(load => load._distance <= radiusInput && load.pickup_date.date === pickupDateInput)
            .sort((a, b) => a._distance - b._distance);

        container.innerHTML = filtered.length > 0 ? "" :
            '<div class="no-results">No loads found matching your criteria</div>';

        if (filtered.length > 0) {
            currentIndex = 0;
            renderLoads(filtered);
        }

        document.getElementById("load-more-btn").style.display = "none";
    });
}


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
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`${serverURL}/user_login`, {
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

        update_yourname.innerText = `${greeting}, ${result.name || 'Driver'}`;

        // If success, you can continue showing the page or initialize user-specific stuff here
    } catch (err) {
        // Network or other error: clear cookies and redirect to login
        document.cookie = 'username=; path=/; max-age=0';
        document.cookie = 'password=; path=/; max-age=0';
        window.location.href = '/login.html';
    }
    await load_update()

});

async function geocodeLocation(input) {
    try {
        const states = {
            'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
            'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
            'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
            'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
            'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
            'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
            'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
            'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
            'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
            'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
            'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
            'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
            'WI': 'Wisconsin', 'WY': 'Wyoming'
        };

        const queryParams = new URLSearchParams({
            format: 'json',
            countrycodes: 'us',
            addressdetails: 1,
            limit: 1
        });

        // Handle ZIP codes
        if (/^\d{5}(-\d{4})?$/.test(input)) {
            queryParams.set('postalcode', input);
        }
        // Handle City, State format
        else if (/,/.test(input)) {
            const [city, state] = input.split(',').map(s => s.trim());
            if (states[state.toUpperCase()]) {
                queryParams.set('city', city);
                queryParams.set('state', states[state.toUpperCase()]);
            }
        }
        // Handle state abbreviations
        else if (states[input.toUpperCase()]) {
            queryParams.set('state', states[input.toUpperCase()]);
        }
        // General search
        else {
            queryParams.set('q', input);
        }

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?${queryParams}`
        );
        const data = await response.json();

        if (data.length === 0) return null;

        const result = data[0];
        return {
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon)
        };

    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}

async function fetchLoadsFromServer() {
    try {
        const response = await fetch(`${serverURL}/realloads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json(); // Parse once

        allLoads = data.loads;
        allbids = data.bids; // get bids from


    } catch (error) {
        console.error("Failed to fetch loads:", error);
    }
}

function renderNextLoads() {
    const nextBatch = allLoads.slice(currentIndex, currentIndex + batchSize);
    renderLoads(nextBatch);
    currentIndex += batchSize;
    toggleLoadMore(allLoads);

}

var bids_showing = [] // if bids shows in the rednderloads add it here

function renderLoads(loadBatch) {
    const container = document.getElementById("load-container");
    loadBatch.forEach(load => {
        const pickupLocation = `${load.pickup.city} ${load.pickup.zip_code}`;
        const deliveryLocation = `${load.dropoff.city} ${load.dropoff.zip_code}`;
        const pickupDate = `${load.pickup_date.date} ${load.pickup_date.time}`;
        const dropOffDate = `${load.drop_off_date.date} ${load.drop_off_date.time}`;
        const weight = load.details?.weight || "N/A";
        const pieces = load.details?.pieces || "N/A";
        const size = load.details?.size || "N/A";
        const price = load.price || 0;
        const priceFormatted = load.price ? `$${load.price}` : "Price not listed";
        const load_id = `${load.pickup.zip_code}_${load.dropoff.zip_code}`;
        const loadedMiles = load.loaded_miles || 0;

        // ✅ Check if load was already bid on
        const alreadyBid = Array.isArray(allbids) && allbids.some(b => b.loadId === load_id);
        if (alreadyBid) {
            // Don't render again, just track it
            if (!bids_showing.includes(load_id)) {
                bids_showing.push(load_id);
            }
            return; // ❌ Skip rendering this load again
        }

        // ✅ CONTINUE rendering only if NOT already bid on
        const loadItem = document.createElement("div");
        loadItem.className = "load-item_2";
        loadItem.id = load_id;

        // Store all load info as JSON string in data-loadinfo attribute
        loadItem.dataset.loadinfo = JSON.stringify({
            loadId: load_id,
            pickup: load.pickup,
            dropoff: load.dropoff,
            pickup_date: load.pickup_date,
            drop_off_date: load.drop_off_date,
            details: load.details,
            price,
            loadedMiles
        });

        loadItem.innerHTML = `
        <div class="load-main_2">
            <div class="pickup_2">
                <strong>${pickupLocation}</strong><br>${pickupDate}
            </div>
            <div class="loaded-miles_2">${loadedMiles} miles</div>
            <div class="delivery_2">
                <strong>${deliveryLocation}</strong><br>${dropOffDate}
            </div>
        </div>
        <div class="load-details_2">
            <div>${weight}, ${pieces} pieces | ${size}<br>${priceFormatted}</div>
            <div id="${load_id}_bid_">
                  <button class="book-btn_2" 
            onclick="bid(
              '${load_id}', 
              ${loadedMiles}, 
              ${price || 0},
              '${pickupLocation.replace(/'/g, "\\'")}', 
              '${pickupDate.replace(/'/g, "\\'")}',
              '${deliveryLocation.replace(/'/g, "\\'")}', 
              '${dropOffDate.replace(/'/g, "\\'")}',
              '${weight}', 
              '${pieces}', 
              '${size}', 
              '${priceFormatted}'
            )">Bid</button>
            </div>
        </div>
        <div style="display:none;" id="${load_id}_confirm_ask">
            <div class="confirmationletter">
                <p><strong>Pickup:</strong> ${pickupLocation} on ${pickupDate}</p>
                <p><strong>Dropoff:</strong> ${deliveryLocation} on ${dropOffDate}</p>
                <p><strong>Distance:</strong> ${loadedMiles} miles</p>
                <p><strong>Enter your price per mile:</strong></p>
                <input type="number" id="${load_id}_price_input" placeholder="e.g. 2.50" oninput="calculateTotal('${load_id}', ${loadedMiles})" style="width: 100px; padding: 4px;" />
                <div id="${load_id}_calculated_price" style="margin: 5px 0; font-weight: bold;"></div>
                <button onclick="bid_final('${load_id}')">Confirm</button>
                <button onclick="document.getElementById('${load_id}_confirm_ask').style.display='none'">Cancel</button>
            </div>
        </div>
        `;

        container.appendChild(loadItem);
    });
    // FUNCTION HERE RUN THRO THE BIDS IN bids_showing IF YOU FIND IT DON'T DLETE IT FROM THE SYSTEM OTHERWISE DELTE IT FROM THE SYSTEM 

    // CHECK IS IT pending IF YES JUST KEEP IT UP
    // CHEK IF GOT IT IF YEST MAKE IT STYLE 3 GREEN
    cleanupExpiredBids();
    async function cleanupExpiredBids() {
        if (!Array.isArray(allbids)) return;

        const bidContainer = document.getElementById("load-container_bids");
        bidContainer.innerHTML = ""; // Clear before re-rendering

        for (const bid of allbids) {
            if (bid.got == true) {
                console.log(`✅ Bid still active: ${bid.loadId}`);

                const d = bid.loadDetails || {};
                const pickupLoc = d.pickupLoc || "Unknown";
                const pickupDate = d.pickupDate || "";
                const deliveryLoc = d.deliveryLoc || "Unknown";
                const dropOffDate = d.dropOffDate || "";
                const weight = d.weight || "?";
                const pieces = d.pieces || "?";
                const size = d.size || "?";
                const miles = d.miles || 0;
                const price = d.price || 0;
                const pricePerMile = bid.pricePerMile || 0;

                const total = (miles * pricePerMile).toFixed(2);
                const priceFormatted = `$${price}`;

                const bidElement = document.createElement("div");
                bidElement.className = "load-item_3";

                bidElement.innerHTML = `
            <div class="load-main_2">
                <div class="pickup_2"><strong>${pickupLoc}</strong><br>${pickupDate}</div>
                <div class="loaded-miles_2">${miles} miles</div>
                <div class="delivery_2"><strong>${deliveryLoc}</strong><br>${dropOffDate}</div>
            </div>
            <div class="load-details_2">
                <div>${weight}, ${pieces} pieces | ${size}<br>${priceFormatted}</div>
                <div><strong>You got it:</strong> $${total} (${pricePerMile}$/mile)</div>
            </div>
            <div class="note_gotit">Congratulations! You’ve been awarded load #${bid.loadId}. Please inform dispatch of your estimated arrival time for pickup and drop-off. Thank you!</div>
        `;

                bidContainer.appendChild(bidElement);
                continue;
            } else if (bid.pending == true) {
                console.log(`✅ Bid still active: ${bid.loadId}`);

                const d = bid.loadDetails || {};
                const pickupLoc = d.pickupLoc || "Unknown";
                const pickupDate = d.pickupDate || "";
                const deliveryLoc = d.deliveryLoc || "Unknown";
                const dropOffDate = d.dropOffDate || "";
                const weight = d.weight || "?";
                const pieces = d.pieces || "?";
                const size = d.size || "?";
                const miles = d.miles || 0;
                const price = d.price || 0;
                const pricePerMile = bid.pricePerMile || 0;

                const total = (miles * pricePerMile).toFixed(2);
                const priceFormatted = `$${price}`;

                const bidElement = document.createElement("div");
                bidElement.className = "load-item_4";

                bidElement.innerHTML = `
            <div class="load-main_2">
                <div class="pickup_2"><strong>${pickupLoc}</strong><br>${pickupDate}</div>
                <div class="loaded-miles_2">${miles} miles</div>
                <div class="delivery_2"><strong>${deliveryLoc}</strong><br>${dropOffDate}</div>
            </div>
            <div class="load-details_2">
                <div>${weight}, ${pieces} pieces | ${size}<br>${priceFormatted}</div>
                <div><strong>Checking:</strong> $${total} (${pricePerMile}$/mile)</div>
            </div>
            <div class="note_gotit">Hold tight! Dispatch is currently working to secure load #${bid.loadId} for you. We’ll notify you once it’s confirmed. Thank you for your patience!</div>

        `;

                bidContainer.appendChild(bidElement);
                continue;
            } else {
                if (bids_showing.includes(bid.loadId)) {
                    console.log(`✅ Bid still active: ${bid.loadId}`);

                    const d = bid.loadDetails || {};
                    const pickupLoc = d.pickupLoc || "Unknown";
                    const pickupDate = d.pickupDate || "";
                    const deliveryLoc = d.deliveryLoc || "Unknown";
                    const dropOffDate = d.dropOffDate || "";
                    const weight = d.weight || "?";
                    const pieces = d.pieces || "?";
                    const size = d.size || "?";
                    const miles = d.miles || 0;
                    const price = d.price || 0;
                    const pricePerMile = bid.pricePerMile || 0;

                    const total = (miles * pricePerMile).toFixed(2);
                    const priceFormatted = `$${price}`;

                    const bidElement = document.createElement("div");
                    bidElement.className = "load-item_1";

                    bidElement.innerHTML = `
            <div class="load-main_2">
                <div class="pickup_2"><strong>${pickupLoc}</strong><br>${pickupDate}</div>
                <div class="loaded-miles_2">${miles} miles</div>
                <div class="delivery_2"><strong>${deliveryLoc}</strong><br>${dropOffDate}</div>
            </div>
            <div class="load-details_2">
                <div>${weight}, ${pieces} pieces | ${size}<br>${priceFormatted}</div>
                <div><strong>Your Bid:</strong> $${total} (${pricePerMile}$/mile)</div>
            </div>
        `;

                    bidContainer.appendChild(bidElement);
                    continue;
                }

                // Unbid expired ones
                try {
                    const res = await fetch(`${serverURL}/unbid`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: username,
                            password: password,
                            loadId: bid.loadId
                        })
                    });

                    const result = await res.json();
                    console.log(`❌ Unbid result for ${bid.loadId}:`, result.message || result);
                } catch (error) {
                    console.error(`⚠️ Failed to unbid ${bid.loadId}:`, error);
                }

            }
        }
    }


    // IF NONE OF BIDS SHOWING MEANS EXPERIRED SO RENDER THE BIDS AND SEND THEM TO THE unbid server request to delete
    document.getElementById("fade-out").classList.add("hidden");
}

function bid(loadId, miles, price, pickupLoc, pickupDate, deliveryLoc, dropOffDate, weight, pieces, size, priceFormatted) {
    const confirmBox = document.getElementById(`${loadId}_confirm_ask`);
    if (!confirmBox) return;

    // Show confirmation box
    confirmBox.style.display = 'block';

    // Fill confirmation box with info and input fields
    confirmBox.innerHTML = `
  <div class="confirmationletter">
      <p><strong>Pickup:</strong> ${pickupLoc} on ${pickupDate}</p>
      <p><strong>Dropoff:</strong> ${deliveryLoc} on ${dropOffDate}</p>
      <p><strong>Distance:</strong> ${miles} miles</p>
      <p><strong>Details:</strong> ${weight}, ${pieces} pieces | ${size}</p>
      <p><strong>Price:</strong> ${priceFormatted}</p>
      <p><strong>Enter your price per mile:</strong></p>
      <input type="number" id="${loadId}_price_input" placeholder="e.g. 2.50" oninput="calculateTotal('${loadId}', ${miles})" style="width: 100px; padding: 4px;" />
      <div id="${loadId}_calculated_price" style="margin: 5px 0; font-weight: bold;"></div>

      <button 
        onclick="bid_final(
          '${loadId}', 
          ${miles}, 
          ${price || 0}, 
          '${pickupLoc.replace(/'/g, "\\'")}', 
          '${pickupDate.replace(/'/g, "\\'")}', 
          '${deliveryLoc.replace(/'/g, "\\'")}', 
          '${dropOffDate.replace(/'/g, "\\'")}', 
          '${weight}', 
          '${pieces}', 
          '${size}', 
          '${priceFormatted.replace(/'/g, "\\'")}'
        )"
      >
        Confirm
      </button>

      <button onclick="document.getElementById('${loadId}_confirm_ask').style.display='none'">Cancel</button>
  </div>
`;

}


function calculateTotal(loadId, miles) {
    const input = document.getElementById(`${loadId}_price_input`);
    const output = document.getElementById(`${loadId}_calculated_price`);
    let rate = parseFloat(input.value);

    if (!isNaN(rate)) {
        const total = (rate * miles).toFixed(2);
        output.textContent = `Total: $${total}`;

        if (rate < 0.7 || rate > 2.0) {
            output.style.color = "red";
            output.textContent += " ⚠️ (outside recommended range, please bid bettwen $0.7 to $2)";
        } else {
            output.style.color = "black";
        }
    } else {
        output.textContent = "";
        output.style.color = "black";
    }
}


function bid_final(loadId, miles, price, pickupLoc, pickupDate, deliveryLoc, dropOffDate, weight, pieces, size, priceFormatted) {
    const input = document.getElementById(`${loadId}_price_input`);
    const pricePerMile = parseFloat(input.value);

    if (isNaN(pricePerMile) || pricePerMile < 0.7 || pricePerMile > 2) {
        alert("Please enter a valid price per mile between 0.7 and 2.");
        return;
    }

    // Prepare data to send to server
    const bidData = {
        loadId,
        miles,
        price,
        pickupLoc,
        pickupDate,
        deliveryLoc,
        dropOffDate,
        weight,
        pieces,
        size,
        priceFormatted,
        pricePerMile
    };

    const username = getCookie('username');
    const password = getCookie('password');

    fetch(serverURL + '/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: username,  // Set your user data here
            password: password,
            loadId: loadId,
            miles: miles,
            price: price,
            pickupLoc: pickupLoc,
            pickupDate: pickupDate,
            deliveryLoc: deliveryLoc,
            dropOffDate: dropOffDate,
            weight: weight,
            pieces: pieces,
            size: size,
            priceFormatted: priceFormatted,
            pricePerMile: pricePerMile
        }),
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert("Error submitting bid: " + data.error);
            } else {
                alert(data.message || "Bid submitted successfully!");

                // Hide bid button
                const bidBox = document.getElementById(`${loadId}_bid_`);
                if (bidBox) bidBox.style.display = 'none';

                // Hide confirmation box
                const confirmBox = document.getElementById(`${loadId}_confirm_ask`);
                if (confirmBox) confirmBox.style.display = 'none';

                // Update load item style
                const loadDiv = document.getElementById(loadId);
                if (loadDiv) loadDiv.className = "load-item_1";

                // Optionally update status text somewhere
                const statusDiv = document.getElementById(`${loadId}status`);
                if (statusDiv) statusDiv.innerText = `Your bid was submitted at rate of $${pricePerMile}/mile`;
            }
        })
        .catch(err => {
            alert("An error occurred while submitting your bid. " + err.message);
        });
}



function toggleLoadMore(loads) {
    const btn = document.getElementById("load-more-btn");
    btn.style.display = currentIndex >= loads.length ? "none" : "block";
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 0.621371 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function openlogin() {
    window.open('login.html', '_blank');
}

function register() {
    window.open('apply.html', '_blank');
}

function learnmore() {
    window.open('about_us.html', '_blank');
}


function logout() {
    // Delete the cookies by setting max-age to 0
    document.cookie = 'username=; path=/; max-age=0';
    document.cookie = 'password=; path=/; max-age=0';

    // Redirect to login page
    window.location.href = '/login.html';
}



// MAIN FUNCTIONS FOR USER 
const username = getCookie('username');
const password = getCookie('password');

const container = document.querySelector('.messaegs_container');
const input = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendMsgBtn');

const title = document.querySelector('.messages_title');
const containerWrapper = document.querySelector('.messaegs_container_wrapper');

let isVisible = false;

title.addEventListener('click', () => {
    isVisible = !isVisible;
    containerWrapper.style.display = isVisible ? 'block' : 'none';
    title.innerHTML = `           <div><i class="fas fa-envelope"></i> &nbsp; Mail Box ${isVisible ? '▲' : '▼'}</div>`;
    if (isVisible) loadMessages();
});


async function loadMessages() {
    try {
        const res = await fetch(serverURL + '/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) throw new Error('Failed to load messages');

        const data = await res.json();
        const msgs = data.messages || [];

        container.innerHTML = '';

        msgs.reverse().forEach(msg => {
            const msgDiv = document.createElement('div');

            const time = new Date(msg.createdAt).toLocaleString();
            msgDiv.textContent = `[${time}] ${msg.text || msg.message || ''}`;

            container.appendChild(msgDiv);
        });

        container.scrollTop = container.scrollHeight;

    } catch (err) {
        container.innerHTML = 'Error loading messages.';
        console.error(err);
    }
}

async function refresh() {

    // Refresh messages
    await loadMessages();
}

async function sendMessage(text) {
    if (!text.trim()) return;

    try {
        const res = await fetch(serverURL + '/new_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, message: text }),
        });

        const result = await res.json();

        if (!res.ok) {
            alert(result.error || 'Failed to send message');
            return;
        }

        input.value = '';
        await refresh();  // Refresh messages and loads
    } catch (err) {
        alert('Network error');
        console.error(err);
    }
}

sendBtn.addEventListener('click', () => sendMessage(input.value));
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage(input.value);
});

// Initial load and 60-sec interval refresh
refresh();
setInterval(refresh, 1000)