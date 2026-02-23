// --- STATE & SAVE DATA ---
let appData = JSON.parse(localStorage.getItem('cozyKitchenSave')) || {};

// Initialize lists if they don't exist yet
if (!appData.marketList) appData.marketList = [];
if (!appData.notesList) appData.notesList = [];
if (!appData.appointments) appData.appointments = {}; 

const appTitles = {
    'contingency-ledger': 'Contingency Ledger',
    'todo': 'To Do List', 'weekly-meal-plan': 'Weekly Meal Plan', 'bible-verse': 'Bible Verse of the Day',
    'recipes': 'Recipes', 'dev-ideas': 'Web App & Gaming Dev Ideas', 'mood-log': 'Mood Log',
    'budget-ledger': 'Budget Ledger', 'sleep-log': 'Sleep Log', 'meal-log': 'Meal Log',
    'water-log': 'Water Log', 'self-care-log': 'Self Care Log', 'phoebe': 'Phoebe', 'tripp': 'Tripp', 'cory': 'Cory'
};

window.onload = function() {
    updateClock();
    renderCalendar();
    renderList('market');
    renderList('notes');
};

// --- WIDGETS: SINK & AVATAR ---
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12; hours = hours ? hours : 12; 
    document.getElementById('sink-clock').innerText = hours + ':' + minutes + ' ' + ampm;
}
setInterval(updateClock, 1000);

function toggleAvatarMenu() {
    document.getElementById('avatar-stats-box').classList.toggle('hidden');
}

// --- BOOKSHELF: CALENDAR ---
function renderCalendar() {
    const now = new Date();
    const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    document.getElementById('month-year-display').innerText = monthYear;

    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = ''; // Clear existing
    
    // Simplistic calendar math for the current month
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const today = now.getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'cal-day';
        dayDiv.innerText = i;

        if (i < today) {
            dayDiv.classList.add('past-day');
        } else if (i === today) {
            dayDiv.classList.add('current-day');
        }

        // Check if there is a saved appointment for this day
        const dateKey = `${now.getFullYear()}-${now.getMonth()+1}-${i}`;
        if (appData.appointments[dateKey]) {
            dayDiv.classList.add('has-appt');
            dayDiv.title = appData.appointments[dateKey]; // Hover to see appt
        }

        // Allow clicking future/current days to add an appointment
        if (i >= today) {
            dayDiv.onclick = () => setAppointment(dateKey, i);
        }

        grid.appendChild(dayDiv);
    }
}

function setAppointment(dateKey, day) {
    const currentAppt = appData.appointments[dateKey] || '';
    const newAppt = prompt(`Enter appointment for day ${day}:`, currentAppt);
    
    if (newAppt !== null) {
        if (newAppt.trim() === '') {
            delete appData.appointments[dateKey]; // Clear it if empty
        } else {
            appData.appointments[dateKey] = newAppt;
        }
        saveCoreData();
        renderCalendar(); // Re-draw to show the gold glow!
    }
}

// --- BOOKSHELF: LISTS (Market & Notes) ---
function toggleSection(id) {
    document.getElementById(id).classList.toggle('hidden');
}

function handleEnter(event, listType) {
    if (event.key === 'Enter') {
        const inputElement = document.getElementById(`${listType}-input`);
        const val = inputElement.value.trim();
        if (val) {
            // Determine which array to save to
            const dataKey = listType === 'market' ? 'marketList' : 'notesList';
            appData[dataKey].push(val);
            saveCoreData();
            renderList(listType);
            inputElement.value = ''; // Clear input box
        }
    }
}

function renderList(listType) {
    const dataKey = listType === 'market' ? 'marketList' : 'notesList';
    const ul = document.getElementById(`${listType}-list`);
    ul.innerHTML = '';
    
    appData[dataKey].forEach(item => {
        const li = document.createElement('li');
        li.innerText = item;
        ul.appendChild(li);
    });
}

function clearList(listType) {
    const dataKey = listType === 'market' ? 'marketList' : 'notesList';
    appData[dataKey] = [];
    saveCoreData();
    renderList(listType);
}

function saveCoreData() {
    localStorage.setItem('cozyKitchenSave', JSON.stringify(appData));
}

// --- WAX SEAL / MODALS ---
function toggleTOC() {
    document.getElementById('toc-modal').classList.toggle('hidden');
}

function openApp(appName) {
    // Hide TOC if it was open
    document.getElementById('toc-modal').classList.add('hidden');

    const modal = document.getElementById('app-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    title.innerText = appTitles[appName];
    modal.setAttribute('data-current-app', appName);

    let savedText = appData[appName] || '';
    body.innerHTML = `<textarea id="app-input" placeholder="Start typing...">${savedText}</textarea>`;

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('app-modal').classList.add('hidden');
}

function saveModalData() {
    const currentApp = document.getElementById('app-modal').getAttribute('data-current-app');
    appData[currentApp] = document.getElementById('app-input').value;
    saveCoreData();
    closeModal();
}

// --- CROSS-SAVE EXPORT/IMPORT ---
function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "cozy_kitchen_save.json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            appData = JSON.parse(e.target.result);
            saveCoreData();
            // Re-render everything with the imported data
            renderCalendar(); renderList('market'); renderList('notes');
            alert("Save data loaded!");
        } catch (error) { alert("Error loading save file."); }
    };
    reader.readAsText(file);
    event.target.value = ''; 
}
