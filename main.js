const video = document.getElementById('bgVideo');
const toggleBtn_s = document.getElementById('toggleBtn_s');

// Rest of the code remains the same as previous version
let allLoads = [];
let allLoads_ = []
let currentIndex = 0;
const batchSize = 4;

toggleBtn_s.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        toggleBtn_s.innerHTML = '<img src="./pause-solid.svg" class="bar_top" width="8px" alt=""> &nbsp; Pause';
    } else {
        video.pause();
        toggleBtn_s.innerHTML = '<img src="./play-solid.svg" class="bar_top" width="8px" alt=""> &nbsp; Play';
    }
});

document.addEventListener("DOMContentLoaded", async function () {
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
        const isTestMode = ["localhost", "127.0.0.1"].includes(location.hostname);
        const serverURL = isTestMode ? "http://localhost:5000/demo" : "https://server.atlasmovellc.com/demo";
        const response = await fetch(serverURL);
        const data = await response.json(); // Parse once

        allLoads = data.loads;

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

function renderLoads(loadBatch) {
    const container = document.getElementById("load-container");

    loadBatch.forEach(load => {
        const pickupLocation = `${load.pickup.city} ${load.pickup.zip_code}`;
        const deliveryLocation = `${load.dropoff.city} ${load.dropoff.zip_code}`;
        const pickupDate = `${load.pickup_date.date} ${load.pickup_date.time}`;
        const drop_off_date = `${load.drop_off_date.date} ${load.drop_off_date.time}`;
        const weight = load.details?.weight || "N/A";
        const pieces = load.details?.pieces || "N/A";
        const size = load.details?.size || "N/A";
        const price = load.price ? `$${load.price}` : "Price not listed";

        const loadItem = document.createElement("div");
        loadItem.className = "load-item_2";
        loadItem.innerHTML = `
            <div class="load-main_2">
                <div class="pickup_2">
                    <strong>${pickupLocation}</strong><br>${pickupDate}
                </div>
                <div class="loaded-miles_2">${load.loaded_miles} miles</div>
                <div class="delivery_2">
                    <strong>${deliveryLocation}</strong><br>${drop_off_date}
                </div>
            </div>
            <div class="load-details_2">
                <div>${weight}, ${pieces} pieces | ${size}<br>${price} or make offer</div>
                <div><button class="book-btn_2" onclick="openlogin()">Book</button></div>
            </div>
        `;
        container.appendChild(loadItem);
    });

    document.getElementById("fade-out").classList.add("hidden");
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

function learnmore(){
    window.open('about_us.html', '_blank');
}