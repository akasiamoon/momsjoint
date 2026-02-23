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
updateClock();

// --- 2. ENVIRONMENT & BACKGROUND SWITCHING ---
function updateEnvironment() {
    const hour = new Date().getHours();
    const bgImage = document.getElementById('bg-image');

    // Make sure your filenames exactly match the ones in your folder!
    if (hour >= 6 && hour < 17) {
        bgImage.src = "image_8cf21b.jpg"; // Day 
    } else if (hour >= 17 && hour < 20) {
        bgImage.src = "image_8d759c.jpg"; // Sunset 
    } else {
        bgImage.src = "image_8d75d6.jpg"; // Night 
    }
}
updateEnvironment();
setInterval(updateEnvironment, 3600000); // Check every hour

// --- 3. DUAL AUDIO HEARTH SYSTEM ---
function toggleAudioMenu() {
    const menu = document.getElementById('audio-menu');
    // Toggles the 'hidden' CSS class on and off
    menu.classList.toggle('hidden'); 
}

function changeAudio(type) {
    if (type === 'ambient') {
        const select = document.getElementById('ambient-select');
        const player = document.getElementById('ambient-player');
        player.src = select.value;
        player.play(); // Auto-play when switched
    } else if (type === 'primary') {
        const select = document.getElementById('primary-select');
        const player = document.getElementById('primary-player');
        player.src = select.value;
        player.play();
    }
}

// --- 4. HIDDEN LINKS INTERFACE ---
function openApp(appName) {
    // We will replace this alert with the actual blog/modal interface later!
    console.log("Opening: " + appName);
    alert("Opening the interface for: " + appName);
}
