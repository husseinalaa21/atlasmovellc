/*var show_time = false
var sideMenu = document.getElementById("sideMenu")
var smart = document.getElementById("smart")
var offerBanner = document.getElementById("offerBanner")
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

function menu_togg() {
    if (show_time == false) {
        show_time = true
        sideMenu.style.display = "block"
        smart.style.overflow = "hidden"
        // SHOW 
    } else {
        show_time = false
        sideMenu.style.display = "none"
        smart.style.overflow = "auto"
        // HIDE
    }
}
function openlogin() {
    window.open('login.html', '_blank');
}
function logomain() {
    window.open('/', '_self');
}
function register() {
    window.open('/apply.html', '_self');
}// Helper: Set cookie with expiration (defaults to 365 days)

function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
    console.log('Cookie set:', document.cookie); // Debugging line
}

function getCookie(name) {
    // ... existing code ...
    console.log('Cookie lookup for', name, 'found:', result); // Debugging line
    return result;
}

function acceptPrivacy() {
    console.log('Accept button clicked'); // Debugging line
    setCookie("privacyAccepted", "true");
    document.getElementById("privacyModal").classList.add("hidden");
}
document.addEventListener('DOMContentLoaded', function () {
    getCookie("privacyAccepted")
    // Show modal only if cookie not set
    if (getCookie("privacyAccepted")) {
        document.getElementById("privacyModal").classList.remove("hidden");
    }
    /*
    setTimeout(() => {
        const offerBanner = document.getElementById('offerBanner');

        // Only continue if #offerBanner exists
        if (!offerBanner) return;

        offerBanner.innerHTML = `
        <div class="top-offer-banner">
            <div class="offer-content">
                <div class="offer_text">
                    <span class="pulsate">🚚 Drivers Wanted:</span> Join Now and Get a <strong>$100 Bonus</strong> After Your First 10 Deliveries!
                </div>
                <div class="offer_controls">
                    <div class="promo-badge">
                        <span>Promo Code:</span>
                        <strong>43cR</strong>
                    </div>
                    <button class="close-btn" aria-label="Close banner">
                        <img src="./xmark-solid.svg" class="blue_x" width="18" height="18" alt="">
                    </button>
                </div>
            </div>
        </div>`;

        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .top-offer-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #007BFF;
                color: white;
                padding: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
                animation: slideDown 0.5s ease-out;
            }

            .offer-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                max-width: 1200px;
                width: 100%;
                gap: 1rem;
            }

            .offer_controls {
                display: flex;
                align-items: center;
                gap: 1.5rem;
            }

            .promo-badge {
                background: rgba(255,255,255,0.15);
                padding: 0.5rem 1rem;
                border-radius: 25px;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9em;
            }

            .close-btn {
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 50%;
                transition: background 0.2s;
            }

            .close-btn:hover {
                background: rgba(255,255,255,0.1);
            }

            .pulsate {
                animation: pulse 1.5s infinite;
            }

            @keyframes slideDown {
                from { transform: translateY(-100%); }
                to { transform: translateY(0); }
            }

            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.6; }
                100% { opacity: 1; }
            }

            @media (max-width: 768px) {
                .offer-content {
                    flex-direction: column;
                    text-align: center;
                }

                .offer_controls {
                    flex-direction: column;
                    gap: 1rem;
                }

                .promo-badge {
                    order: 1;
                }

                .close-btn {
                    order: 2;
                }
            }`;
        document.head.appendChild(style);

        // Add close functionality
        document.querySelector('.close-btn').addEventListener('click', () => {
            offerBanner.style.display = 'none';
        });

    }, 10000);
});*/
