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

// --- 4. HIDDEN LINKS INTERFACE (MODAL) ---

// Map your IDs to clean, readable titles
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

// Temporary storage memory so your text doesn't disappear immediately
const appData = {};

function openApp(appName) {
    const modal = document.getElementById('app-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    // 1. Set the correct title
    title.innerText = appTitles[appName];

    // 2. Tell the modal which app is currently open (so the save button knows)
    modal.setAttribute('data-current-app', appName);

    // 3. Load previously typed data if it exists
    let savedText = appData[appName] || '';
    
    // 4. Inject a text area for logging
    body.innerHTML = `
        <textarea id="app-input" placeholder="Start typing your ${appTitles[appName].toLowerCase()} here...">${savedText}</textarea>
    `;

    // 5. Unhide the modal
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('app-modal').classList.add('hidden');
}

function saveModalData() {
    const modal = document.getElementById('app-modal');
    const currentApp = modal.getAttribute('data-current-app');
    const inputData = document.getElementById('app-input').value;

    // Save the typed text to our memory object
    appData[currentApp] = inputData;
    
    alert(appTitles[currentApp] + ' saved successfully!');
    closeModal();
}
