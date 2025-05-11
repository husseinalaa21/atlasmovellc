
const video = document.getElementById('bgVideo');
const toggleBtn_s = document.getElementById('toggleBtn_s');

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
        maxDate: new Date().fp_incr(14),
        dateFormat: "Y-m-d",
        theme: "material_blue",
        disableMobile: true
    });

    await fetchLoadsFromServer();
    renderNextLoads();

    document.getElementById("load-more-btn").addEventListener("click", () => {
        renderNextLoads();
    });

    document.getElementById("search-form").addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const locationInput = formData.get("location").toLowerCase().trim();
        const pickupDateInput = formData.get("pickupDate");
        const radiusInput = parseInt(formData.get("radius"));

        const filtered = allLoads.filter(load => {
            const pickup = load.pickup;
            const locationMatch =
                pickup.city.toLowerCase().includes(locationInput) ||
                pickup.zip_code.includes(locationInput);
            const dateMatch = load.pickup_date.date === pickupDateInput;
            const withinRadius = calculateDistance(pickup.zip_code) <= radiusInput;

            return locationMatch && dateMatch && withinRadius;
        });

        currentIndex = 0;
        document.getElementById("load-container").innerHTML = "";
        renderFilteredLoads(filtered);
    });
});

let allLoads = [];
let currentIndex = 0;
const batchSize = 4;

async function fetchLoadsFromServer() {
    try {
        const isTestMode = location.hostname === "127.0.0.1";
        const serverURL = isTestMode ? "http://localhost:5000/demo" : "https://server.atlasmovellc.com/demo";

        const response = await fetch(serverURL);
        const data = await response.json();

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

function renderFilteredLoads(loads) {
    const nextBatch = loads.slice(currentIndex, currentIndex + batchSize);
    renderLoads(nextBatch);
    currentIndex += batchSize;

    toggleLoadMore(loads, () => renderFilteredLoads(loads));
}

function renderLoads(loadBatch) {
    const container = document.getElementById("load-container");

    loadBatch.forEach(load => {
        const pickupLocation = `${load.pickup.city} ${load.pickup.zip_code}`;
        const deliveryLocation = `${load.dropoff.city} ${load.dropoff.zip_code}`;
        const pickupDate = `${load.pickup_date.date} ${load.pickup_date.time}`;
        const drop_off_date = `${load.drop_off_date.date} ${load.drop_off_date.time}`
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

function toggleLoadMore(loads, onClick = renderNextLoads) {
    const btn = document.getElementById("load-more-btn");
    if (currentIndex >= loads.length) {
        btn.style.display = "none";
    } else {
        btn.style.display = "block";
        btn.onclick = onClick;
    }
}

// Placeholder distance calculator (replace with real ZIP-based logic)
function calculateDistance(zip) {
    return Math.floor(Math.random() * 250);
}

function register() {
    window.open('apply.html', '_blank');
}
function learnmore() {
    window.open('about_us.html', '_blank');
}