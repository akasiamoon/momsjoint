let appData = JSON.parse(localStorage.getItem('cozyKitchenSave')) || {};
if (!appData.marketList) appData.marketList = [];
if (!appData.notesList) appData.notesList = [];
if (!appData.appointments) appData.appointments = {};

const appTitles = {
    'contingency-ledger': 'Contingency Ledger', 'todo': 'To Do List', 'weekly-meal-plan': 'Weekly Meal Plan',
    'bible-verse': 'Bible Verse', 'recipes': 'Recipes', 'dev-ideas': 'Dev Ideas', 'mood-log': 'Mood Log',
    'budget-ledger': 'Budget Ledger', 'sleep-log': 'Sleep Log', 'meal-log': 'Meal Log', 'phoebe': 'Phoebe', 'tripp': 'Tripp', 'cory': 'Cory'
};

window.onload = function() {
    updateClock();
    renderAlmanac();
    renderList('market');
    renderList('notes');
};

function updateClock() {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    document.getElementById('sink-clock').innerText = `${h}:${m} ${ampm}`;
}
setInterval(updateClock, 1000);

function toggleBookshelf() { document.getElementById('bookshelf-panel').classList.toggle('hidden'); }
function toggleAvatarMenu() { document.getElementById('avatar-stats-box').classList.toggle('hidden'); }
function toggleAudioMenu() { document.getElementById('audio-menu').classList.toggle('hidden'); }
function toggleSection(id) { document.getElementById(id).classList.toggle('hidden'); }
function toggleTOC() { document.getElementById('toc-modal').classList.toggle('hidden'); }

// ALMANAC
let currentAlmanacDate = new Date();
const staticHolidays = { "1-1": "New Year", "5-26": "My Birthday", "10-31": "Halloween", "12-25": "Christmas" };

function getMoonPhase(y, m, d) {
    let c = 365.25 * (m < 3 ? y - 1 : y), e = 30.6 * (m < 3 ? m + 13 : m + 1);
    let jd = (c + e + d - 694039.09) / 29.5305882;
    let b = Math.round((jd - Math.floor(jd)) * 8);
    return ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'][b % 8];
}

function renderAlmanac() {
    const y = currentAlmanacDate.getFullYear(), m = currentAlmanacDate.getMonth();
    document.getElementById('almanac-month-year').innerText = currentAlmanacDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const grid = document.getElementById('almanac-grid'), today = new Date();
    grid.innerHTML = '';
    for (let x = 0; x < new Date(y, m, 1).getDay(); x++) grid.appendChild(document.createElement('div'));
    for (let i = 1; i <= new Date(y, m + 1, 0).getDate(); i++) {
        const d = document.createElement('div');
        d.className = 'almanac-day' + (i === today.getDate() && m === today.getMonth() ? ' today' : '');
        const fK = `${y}-${m + 1}-${i}`, sK = `${m + 1}-${i}`;
        if (staticHolidays[sK] || appData.appointments[fK]) d.classList.add('has-event');
        d.innerText = i;
        d.onclick = () => {
            let h = `<span class="highlight">${m + 1}/${i}/${y}</span>Phase: ${getMoonPhase(y, m + 1, i)}`;
            if (staticHolidays[sK]) h += `<br><span class="highlight">${staticHolidays[sK]}</span>`;
            if (appData.appointments[fK]) h += `<br>Record: ${appData.appointments[fK]}`;
            document.getElementById('almanac-info').innerHTML = h;
            let n = prompt("Inscribe record:", appData.appointments[fK] || "");
            if (n !== null) { appData.appointments[fK] = n; saveCoreData(); renderAlmanac(); }
        };
        grid.appendChild(d);
    }
}
function changeMonth(d) { currentAlmanacDate.setMonth(currentAlmanacDate.getMonth() + d); renderAlmanac(); }

// LISTS
function handleEnter(e, t) {
    if (e.key === 'Enter') {
        const i = document.getElementById(`${t}-input`);
        if (i.value.trim()) { appData[t === 'market' ? 'marketList' : 'notesList'].push(i.value.trim()); saveCoreData(); renderList(t); i.value = ''; }
    }
}
function renderList(t) {
    const l = document.getElementById(`${t}-list`), d = appData[t === 'market' ? 'marketList' : 'notesList'];
    l.innerHTML = ''; d.forEach(x => { let li = document.createElement('li'); li.innerText = x; l.appendChild(li); });
}
function clearList(t) { appData[t === 'market' ? 'marketList' : 'notesList'] = []; saveCoreData(); renderList(t); }

// APP MODAL
function openApp(n) {
    const m = document.getElementById('app-modal');
    document.getElementById('modal-title').innerText = appTitles[n];
    m.setAttribute('data-app', n);
    document.getElementById('modal-body').innerHTML = `<textarea id="app-input">${appData[n] || ""}</textarea>`;
    m.classList.remove('hidden');
    document.getElementById('toc-modal').classList.add('hidden');
}
function closeModal() { document.getElementById('app-modal').classList.add('hidden'); }
function saveModalData() {
    const n = document.getElementById('app-modal').getAttribute('data-app');
    appData[n] = document.getElementById('app-input').value;
    saveCoreData(); closeModal();
}

function saveCoreData() { localStorage.setItem('cozyKitchenSave', JSON.stringify(appData)); }
function exportData() {
    const b = new Blob([JSON.stringify(appData, null, 2)], { type: "application/json" });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = "save.json"; a.click();
}
function importData(e) {
    const r = new FileReader();
    r.onload = (x) => { appData = JSON.parse(x.target.result); saveCoreData(); location.reload(); };
    r.readAsText(e.target.files[0]);
}

// WEATHER & BACKGROUND
function updateEnv() {
    const h = new Date().getHours(), img = document.getElementById('bg-image');
    img.src = h >= 6 && h < 17 ? "YOUR_DAY.jpg" : h >= 17 && h < 20 ? "YOUR_SUNSET.jpg" : "YOUR_NIGHT.jpg";
}
updateEnv();
const API = "YOUR_API_KEY", ZIP = "YOUR_ZIP";
async function upWeather() {
    if (API === "YOUR_API_KEY") return;
    const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${ZIP},US&appid=${API}`);
    const d = await r.json(), w = d.weather[0].main, z = document.getElementById('window-zone');
    z.className = w === "Rain" ? "weather-rain" : w === "Snow" ? "weather-snow" : "";
}
upWeather();
