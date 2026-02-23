// --- 1. SINK CLOCK ---
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    document.getElementById('sink-clock').innerText = hours + ':' + minutes + ' ' + ampm;
}
setInterval(updateClock, 1000);
updateClock(); // Initial call

// --- 2. HEARTH SOUNDSCAPE ---
const hearthAudio = document.getElementById('hearth-audio');
let isPlaying = false;

function toggleFireplaceAudio() {
    if (isPlaying) {
        hearthAudio.pause();
    } else {
        hearthAudio.play();
    }
    isPlaying = !isPlaying;
}

// --- 3. WEATHER & TIME OF DAY (Framework) ---
// Note: To make this live, you'll need to sign up for a free OpenWeatherMap API key.
async function updateEnvironment() {
    // 1. Get current hour to determine day/sunset/night
    const hour = new Date().getHours();
    const bgImage = document.getElementById('bg-image');

    // Example logic for swapping your static images based on time:
    if (hour >= 6 && hour < 16) {
        bgImage.src = "image_8cf21b.jpg"; // Day image
    } else if (hour >= 16 && hour < 19) {
        bgImage.src = "image_8d759c.jpg"; // Sunset image
    } else {
        bgImage.src = "image_8d75d6.jpg"; // Night image
    }

    // 2. Fetch Weather (Placeholder for your future API implementation)
    // navigator.geolocation.getCurrentPosition() -> fetch OpenWeatherMap API -> trigger rain/snow CSS in #window-zone
}

updateEnvironment();
// Check environment every hour
setInterval(updateEnvironment, 3600000);

// --- 4. HIDDEN LINKS MODAL SYSTEM ---
function openModal(id) {
    // This is where we will eventually code the pop-up blogs/ledgers.
    console.log("Opening interface for: " + id);
    alert("You clicked " + id + "! (We will build the data interface for this next)");
}
