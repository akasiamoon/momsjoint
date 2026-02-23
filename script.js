// --- 1. TIME OF DAY BACKGROUND SWITCHING (The Room) ---
function updateEnvironment() {
    const hour = new Date().getHours();
    const bgImage = document.getElementById('bg-image');

    // Put your 3 EXACT image file names inside the quotes below!
    if (hour >= 6 && hour < 17) {
        bgImage.src = "YOUR_DAY_IMAGE.jpg";      
    } else if (hour >= 17 && hour < 20) {
        bgImage.src = "YOUR_SUNSET_IMAGE.jpg";   
    } else {
        bgImage.src = "YOUR_NIGHT_IMAGE.jpg";    
    }
}
// Run immediately, then check every hour
updateEnvironment();
setInterval(updateEnvironment, 3600000); 


// --- 2. LIVE WEATHER API (The Window Only) ---
const WEATHER_API_KEY = "YOUR_API_KEY_HERE"; 
const ZIP_CODE = "YOUR_ZIP_CODE"; 

async function updateWeatherWindow() {
    if (WEATHER_API_KEY === "YOUR_API_KEY_HERE") return; 

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${ZIP_CODE},US&appid=${WEATHER_API_KEY}&units=imperial`);
        const data = await response.json();
        const weatherCondition = data.weather[0].main; 

        const windowZone = document.getElementById('window-zone');
        
        // Strip away any old weather effects first
        windowZone.className = ''; 

        // Add the specific CSS class for the window animation
        if (weatherCondition === "Rain" || weatherCondition === "Drizzle" || weatherCondition === "Thunderstorm") {
            windowZone.classList.add("weather-rain");
        } else if (weatherCondition === "Snow") {
            windowZone.classList.add("weather-snow");
        } 
        // If it's "Clear" or "Clouds", the glass just stays empty and transparent!

    } catch (error) {
        console.error("Failed to fetch weather from the skies above Nirn:", error);
    }
}
// Run immediately, then check every 15 minutes
updateWeatherWindow();
setInterval(updateWeatherWindow, 900000);

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
