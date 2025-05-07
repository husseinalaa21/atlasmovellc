const video = document.getElementById('bgVideo');
const toggleBtn = document.getElementById('toggleBtn');

toggleBtn.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        toggleBtn.textContent = '⏸ Pause';
    } else {
        video.pause();
        toggleBtn.textContent = '▶ Start';
    }
});

const demoLoads = [
    {
        pickup: { location: "Brooklyn, NY 11231", date: "05/07/2025 00:00 EST" },
        delivery: { location: "Chicago, IL 60644", date: "05/10/2025 08:00 EST" },
        details: { distance: "810 miles", weight: "500 lbs", pieces: "1", size: "120x12x12 in." }
    },
    {
        pickup: { location: "North Bergen, NJ 07047", date: "05/07/2025 07:00 EST" },
        delivery: { location: "Torrance, CA 90501", date: "05/11/2025 02:00 EST" },
        details: { distance: "2800 miles", weight: "133 lbs", pieces: "1", size: "68x25x29 in." }
    },
    {
        pickup: { location: "Newark, NJ 07114", date: "05/06/2025 23:00 EST" },
        delivery: { location: "Richmond, VA 23224", date: "05/10/2025 04:00 EST" },
        details: { distance: "334 miles", weight: "1083 lbs", pieces: "0", size: "NO DIMENSIONS SPECIFIED" }
    },
    // Add more demo loads as needed
];

document.addEventListener("DOMContentLoaded", function () {
    flatpickr("#pickupDate", {
        minDate: "today",
        maxDate: new Date().fp_incr(14), // 14 days from today
        dateFormat: "Y-m-d",
        theme: "material_blue",
        disableMobile: true // force desktop-style calendar on mobile
    });
});


function loadDemoData() {
    const container = document.getElementById("load-container");

    demoLoads.forEach(load => {
        const loadItem = document.createElement("div");
        loadItem.className = "load-item";

        loadItem.innerHTML = `
        <div>
          <strong>${load.pickup.location}</strong><br>
          ${load.pickup.date}
        </div>
        <div>
          <strong>${load.delivery.location}</strong><br>
          ${load.delivery.date}
        </div>
        <div>
          ${load.details.distance}<br>
          ${load.details.weight}, ${load.details.pieces} pieces<br>
          ${load.details.size}
        </div>
      `;

        container.appendChild(loadItem);
    });
}

// Run after DOM loads
document.addEventListener("DOMContentLoaded", loadDemoData);


document.getElementById("search-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const location = formData.get("location");
    const pickupDate = formData.get("pickupDate");
    const radius = formData.get("radius");

    console.log("Search:", { location, pickupDate, radius });

    // Later: Use this to filter or fetch loads from API
});
