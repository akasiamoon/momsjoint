const IMAGES = {
    day: "momsjointday.jpg", // Using your confirmed filename
    sunset: "momsjointsunset.jpg", // Update these when you have the files!
    night: "momsjointnight.jpg"
};

let appData = JSON.parse(localStorage.getItem('cozyKitchenSave')) || {
    vault: "0.00",
    appointments: {}
};

window.onload = function() {
    updateEnv();
    updateClock();
    renderAlmanac();
    if(document.getElementById('account-balance')) {
        document.getElementById('account-balance').innerText = appData.vault || "0.00";
    }
};

function updateClock() {
    const clock = document.getElementById('sink-clock');
    const now = new Date();
    let h = now.getHours(), m = now.getMinutes();
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    m = m < 10 ? '0' + m : m;
    if(clock) clock.innerText = `${h}:${m} ${ampm}`;
}
setInterval(updateClock, 1000);

// UI Logic
function toggleBookshelf() { document.getElementById('bookshelf-panel').classList.toggle('hidden'); }
function toggleAvatarMenu() { document.getElementById('avatar-stats-box').classList.toggle('hidden'); }
function toggleTOC() { document.getElementById('toc-modal').classList.toggle('hidden'); }

function openApp(n) {
    const m = document.getElementById('app-modal');
    document.getElementById('modal-title').innerText = n.replace('-', ' ').toUpperCase();
    document.getElementById('modal-body').innerHTML = `<textarea id="app-input">${appData[n] || ""}</textarea>`;
    m.classList.remove('hidden');
}

function saveModalData() {
    const n = document.getElementById('app-modal').getAttribute('data-app');
    appData[n] = document.getElementById('app-input').value;
    localStorage.setItem('cozyKitchenSave', JSON.stringify(appData));
    document.getElementById('app-modal').classList.add('hidden');
}

function updateEnv() {
    const h = new Date().getHours();
    const bg = document.getElementById('bg-image');
    if(!bg) return;
    // Simple check: default to Day image if others aren't set
    bg.src = (h >= 17 && h < 20) ? IMAGES.sunset : (h >= 20 || h < 6) ? IMAGES.night : IMAGES.day;
}
