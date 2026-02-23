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
        bgImage.src = "momsjointday.jpg"; // Day 
    } else if (hour >= 17 && hour < 20) {
        bgImage.src = "momsjointsunset.jpg"; // Sunset 
    } else {
        bgImage.src = "momsjointnight.jpg"; // Night 
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
// --- 5. AVATAR MENU TOGGLE ---
function toggleAvatarMenu() {
    const menu = document.getElementById('avatar-stats-box');
    menu.classList.toggle('hidden');
}
// --- 4. HIDDEN LINKS INTERFACE & DATA MANAGEMENT ---

const appTitles = {
    'todo': 'To Do List',
    'weekly-meal-plan': 'Weekly Meal Plan',
    'calendar': 'Calendar',
    'market-list': 'Market List',
    'bible-verse': 'Bible Verse of the Day',
    'contingency-ledger': 'Contingency Ledger',
    'recipes': 'Recipes',
    'dev-ideas': 'Web App & Gaming Dev Ideas',
    'mood-log': 'Mood Log',
    'budget-ledger': 'Budget Ledger',
    'notes': 'Notes',
    'sleep-log': 'Sleep Log',
    'meal-log': 'Meal Log',
    'water-log': 'Water Log',
    'self-care-log': 'Self Care Log',
    'phoebe': 'Phoebe',
    'tripp': 'Tripp',
    'cory': 'Cory'
};

// 1. Initialize Memory from Local Storage (Auto-load on refresh)
// If there's no save file yet, it defaults to an empty object {}
let appData = JSON.parse(localStorage.getItem('cozyKitchenSave')) || {};

function openApp(appName) {
    const modal = document.getElementById('app-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    title.innerText = appTitles[appName];
    modal.setAttribute('data-current-app', appName);

    // Pull the saved text from memory
    let savedText = appData[appName] || '';
    
    body.innerHTML = `
        <textarea id="app-input" placeholder="Start typing your ${appTitles[appName].toLowerCase()} here...">${savedText}</textarea>
    `;

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('app-modal').classList.add('hidden');
}

function saveModalData() {
    const modal = document.getElementById('app-modal');
    const currentApp = modal.getAttribute('data-current-app');
    const inputData = document.getElementById('app-input').value;

    // 2. Save to local memory AND browser's Local Storage
    appData[currentApp] = inputData;
    localStorage.setItem('cozyKitchenSave', JSON.stringify(appData)); 
    
    closeModal();
}

// --- CROSS-SAVE SYSTEM (MMO-STYLE) ---

// 3. Export Data (Creates a downloadable JSON file)
function exportData() {
    // Convert our data object into a neatly formatted JSON string
    const dataStr = JSON.stringify(appData, null, 2);
    // Create a temporary "file" in the browser
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Create an invisible link, click it to trigger download, then destroy it
    const a = document.createElement('a');
    a.href = url;
    a.download = "cozy_kitchen_save.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 4. Import Data (Reads the uploaded JSON file and overwrites local storage)
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            appData = importedData; // Update live memory
            localStorage.setItem('cozyKitchenSave', JSON.stringify(appData)); // Update browser memory
            alert("Save data loaded successfully! Welcome back.");
        } catch (error) {
            alert("Error loading save file. Make sure it is a valid cozy_kitchen_save.json file.");
        }
    };
    reader.readAsText(file);
    
    // Reset the file input so you can upload the same file again later if needed
    event.target.value = ''; 
}
