// --- STATE & SAVE DATA ---
let appData = JSON.parse(localStorage.getItem('cozyKitchenSave')) || {};

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

// --- INITIALIZE ON LOAD ---
window.onload = function() {
    updateClock();
    renderAlmanac(); 
    renderList('market');
    renderList('notes');
};

// --- SINK CLOCK ---
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12; hours = hours ? hours : 12; 
    document.getElementById('sink-clock').innerText = hours + ':' + minutes + ' ' + ampm;
}
setInterval(updateClock, 1000);

// --- AVATAR & AUDIO TOGGLES ---
function toggleAvatarMenu() {
    document.getElementById('avatar-stats-box').classList.toggle('hidden');
}

function toggleAudioMenu() {
    document.getElementById('audio-menu').classList.toggle('hidden');
}

function changeAudio(type) {
    if (type === 'ambient') {
        const select = document.getElementById('ambient-select');
        const player = document.getElementById('ambient-player');
        player.src = select.value;
        player.play();
    } else if (type === 'primary') {
        const select = document.getElementById('primary-select');
        const player = document.getElementById('primary-player');
        player.src = select.value;
        player.play();
    }
}

// --- ALMANAC ENGINE ---
let currentAlmanacDate = new Date();

const staticHolidays = {
    "1-1": "New Year's Day", "2-2": "Imbolc", "2-14": "Valentine's Day", "3-17": "St. Patrick's Day",
    "3-20": "Vernal Equinox", "5-1": "Beltane", "5-26": "My Birthday", "6-20": "Summer Solstice",
    "7-4": "Independence Day", "8-1": "Lughnasadh", "9-22": "Autumnal Equinox", "10-31": "Halloween / Samhain",
    "11-11": "Veterans Day", "12-21": "Winter Solstice", "12-25": "Christmas Day", "12-31": "New Year's Eve"
};

function getMoonPhase(year, month, day) {
    let c = 0, e = 0, jd = 0, b = 0;
    if (month < 3) { year--; month += 12; }
    ++month;
    c = 365.25 * year; e = 30.6 * month;
    jd = c + e + day - 694039.09; jd /= 29.5305882; b = parseInt(jd); jd -= b; b = Math.round(jd * 8); 
    if (b >= 8) b = 0;
    const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    return phases[b];
}

function renderAlmanac() {
    const year = currentAlmanacDate.getFullYear();
    const month = currentAlmanacDate.getMonth();
    
    document.getElementById('almanac-month-year').innerText = currentAlmanacDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const grid = document.getElementById('almanac-grid');
    grid.innerHTML = ''; 
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const today = new Date();

    for (let x = 0; x < firstDayIndex; x++) {
        const emptyDiv = document.createElement('div');
        grid.appendChild(emptyDiv);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'almanac-day';
        dayDiv.innerText = i;

        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today');
        }

        const dateKey = `${month + 1}-${i}`; 
        const fullDateKey = `${year}-${month + 1}-${i}`; 
        
        let hasEvent = staticHolidays[dateKey] || appData.appointments[fullDateKey];
        if (hasEvent) dayDiv.classList.add('has-event');

        dayDiv.onclick = () => {
            const phase = getMoonPhase(year, month, i);
            let displayHTML = `<span class="highlight">${currentAlmanacDate.toLocaleString('default', { month: 'long' })} ${i}, ${year}</span>`;
            displayHTML += `Moon Phase: ${phase}<br>`;
            
            if (staticHolidays[dateKey]) displayHTML += `<br><span class="highlight">${staticHolidays[dateKey]}</span>`;
            if (appData.appointments[fullDateKey]) displayHTML += `<br>Record: ${appData.appointments[fullDateKey]}`;

            document.getElementById('almanac-info').innerHTML = displayHTML;
            
            if (i >= today.getDate() || month > today.getMonth() || year > today.getFullYear()) {
                setTimeout(() => setAppointment(fullDateKey, i, month), 100); 
            }
        };
        grid.appendChild(dayDiv);
    }
}

function changeMonth(direction) {
    currentAlmanacDate.setMonth(currentAlmanacDate.getMonth() + direction);
    renderAlmanac();
}

function setAppointment(fullDateKey, day, month) {
    const currentAppt = appData.appointments[fullDateKey] || '';
    const newAppt = prompt(`Inscribe a record for ${month + 1}/${day}:`, currentAppt);
    
    if (newAppt !== null) {
        if (newAppt.trim() === '') {
            delete appData.appointments[fullDateKey]; 
        } else {
            appData.appointments[fullDateKey] = newAppt;
        }
        saveCoreData();
        renderAlmanac(); 
    }
}

// --- COLLAPSIBLE LISTS ---
function toggleSection(id) { document.getElementById(id).classList.toggle('hidden'); }

function handleEnter(event, listType) {
    if (event.key === 'Enter') {
        const inputElement = document.getElementById(`${listType}-input`);
        const val = inputElement.value.trim();
        if (val) {
            const dataKey = listType === 'market' ? 'marketList' : 'notesList';
            appData[dataKey].push(val);
            saveCoreData();
            renderList(listType);
            inputElement.value = ''; 
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

function saveCoreData() { localStorage.setItem('cozyKitchenSave', JSON.stringify(appData)); }

// --- MODALS & TOC ---
function toggleTOC() { document.getElementById('toc-modal').classList.toggle('hidden'); }

function openApp(appName) {
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

function closeModal() { document.getElementById('app-modal').classList.add('hidden'); }

function saveModalData() {
    const currentApp = document.getElementById('app-modal').getAttribute('data-current-app');
    appData[currentApp] = document.getElementById('app-input').value;
    saveCoreData();
    closeModal();
}

// --- EXPORT & IMPORT ---
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
            renderAlmanac(); renderList('market'); renderList('notes');
            alert("Save data loaded!");
        } catch (error) { alert("Error loading save file."); }
    };
    reader.readAsText(file);
    event.target.value = ''; 
}

// --- ENVIRONMENT & WEATHER ENGINES ---
function updateEnvironment() {
    const hour = new Date().getHours();
    const bgImage = document.getElementById('bg-image');
    // EDIT THESE IMAGE NAMES
    if (hour >= 6 && hour < 17) bgImage.src = "momsjointday.jpg";      
    else if (hour >= 17 && hour < 20) bgImage.src = "momsjointsunset.jpg";   
    else bgImage.src = "momsjointnight.jpg";    
}
updateEnvironment();
setInterval(updateEnvironment, 3600000); 

const WEATHER_API_KEY = "YOUR_API_KEY_HERE"; 
const ZIP_CODE = "38834"; 

async function updateWeatherWindow() {
    if (WEATHER_API_KEY === "YOUR_API_KEY_HERE") return; 
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${ZIP_CODE},US&appid=${WEATHER_API_KEY}&units=imperial`);
        const data = await response.json();
        const weatherCondition = data.weather[0].main; 
        const windowZone = document.getElementById('window-zone');
        
        windowZone.className = ''; 
        if (weatherCondition === "Rain" || weatherCondition === "Drizzle" || weatherCondition === "Thunderstorm") {
            windowZone.classList.add("weather-rain");
        } else if (weatherCondition === "Snow") {
            windowZone.classList.add("weather-snow");
        } 
    } catch (error) { console.error("Weather failed:", error); }
}
updateWeatherWindow();
setInterval(updateWeatherWindow, 900000);
