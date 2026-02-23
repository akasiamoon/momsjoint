// --- CONFIG (Update these!) ---
const IMAGES = { day: "momsjointday.jpg", sunset: "momsjointsunset.jpg", night: "momsjointnight.jpg" };
const API_KEY = "88f3e35af62ba59bad38a3d346e0ca84";
const ZIP = "38834";

let appData = JSON.parse(localStorage.getItem('cozyKitchenSave')) || {};
const lists = ['marketList', 'notesList', 'todoList'];
lists.forEach(l => { if (!appData[l]) appData[l] = []; });
if (!appData.appointments) appData.appointments = {};

const staticHolidays = {
    "1-1": "New Year", "2-2": "Imbolc", "2-14": "Valentine's", "3-17": "St. Paddy's",
    "3-20": "Spring Equinox", "5-1": "Beltane", "5-26": "Amber's Birthday", "6-20": "Summer Solstice",
    "10-31": "Halloween", "12-21": "Winter Solstice", "12-25": "Christmas"
};

const appTitles = { 'todo': 'To Do List', 'weekly-meal-plan': 'Weekly Meal Plan', 'budget-ledger': 'Budget Ledger' };

window.onload = function() {
    updateEnv();
    updateClock();
    renderAlmanac();
    renderList('market');
};

// --- ALMANAC, MOON & HOLIDAYS ---
let curDate = new Date();

function getMoonPhase(y, m, d) {
    let c = 365.25 * (m < 3 ? y - 1 : y), e = 30.6 * (m < 3 ? m + 13 : m + 1);
    let jd = (c + e + d - 694039.09) / 29.5305882;
    let b = Math.round((jd - Math.floor(jd)) * 8);
    return ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'][b % 8];
}

function renderAlmanac() {
    const grid = document.getElementById('almanac-grid');
    if(!grid) return;
    grid.innerHTML = '';
    const y = curDate.getFullYear(), m = curDate.getMonth();
    document.getElementById('almanac-month-year').innerText = curDate.toLocaleString('default', {month:'long', year:'numeric'});
    
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();

    for(let x=0; x<first; x++) grid.appendChild(document.createElement('div'));

    for(let i=1; i<=days; i++) {
        let d = document.createElement('div');
        d.className = 'almanac-day';
        const dateKey = `${m + 1}-${i}`;
        const fullKey = `${y}-${m + 1}-${i}`;

        if(i === new Date().getDate() && m === new Date().getMonth()) d.classList.add('today');
        if(staticHolidays[dateKey] || appData.appointments[fullKey]) d.classList.add('has-event');
        
        d.innerText = i;
        d.onclick = () => {
            const phase = getMoonPhase(y, m + 1, i);
            let h = `<span class="highlight">${curDate.toLocaleString('default',{month:'long'})} ${i}</span>Moon: ${phase}`;
            if(staticHolidays[dateKey]) h += `<br><span class="highlight">${staticHolidays[dateKey]}</span>`;
            if(appData.appointments[fullKey]) h += `<br>Record: ${appData.appointments[fullKey]}`;
            document.getElementById('almanac-info').innerHTML = h;

            let n = prompt("Inscribe Record:", appData.appointments[fullKey] || "");
            if(n !== null) { appData.appointments[fullKey] = n; save(); renderAlmanac(); }
        };
        grid.appendChild(d);
    }
}

// --- CORE UTILITIES ---
function updateClock() {
    const clock = document.getElementById('sink-clock');
    const now = new Date();
    let h = now.getHours(), m = now.getMinutes();
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    m = m < 10 ? '0' + m : m;
    if(clock) clock.innerText = h + ":" + m + " " + ampm;
}
setInterval(updateClock, 1000);

function toggleBookshelf() { document.getElementById('bookshelf-panel').classList.toggle('hidden'); }
function toggleAvatarMenu() { document.getElementById('avatar-stats-box').classList.toggle('hidden'); }
function toggleTOC() { document.getElementById('toc-modal').classList.toggle('hidden'); }
function toggleSection(id) { document.getElementById(id).classList.toggle('hidden'); }
function changeMonth(dir) { curDate.setMonth(curDate.getMonth() + dir); renderAlmanac(); }

function handleEnter(e, t) {
    if(e.key === 'Enter') {
        const i = document.getElementById(t + '-input');
        if(i.value.trim()) { appData[t + 'List'].push(i.value.trim()); save(); renderList(t); i.value = ''; }
    }
}
function renderList(t) {
    const l = document.getElementById(t + '-list');
    if(l) { l.innerHTML = ''; appData[t + 'List'].forEach(x => { let li = document.createElement('li'); li.innerText = x; l.appendChild(li); }); }
}
function clearList(t) { appData[t + 'List'] = []; save(); renderList(t); }

function openApp(n) {
    const m = document.getElementById('app-modal');
    document.getElementById('modal-title').innerText = appTitles[n] || n;
    m.setAttribute('data-app', n);
    document.getElementById('modal-body').innerHTML = `<textarea id="app-input">${appData[n]||''}</textarea>`;
    m.classList.remove('hidden');
    document.getElementById('toc-modal').classList.add('hidden');
}
function closeModal() { document.getElementById('app-modal').classList.add('hidden'); }
function saveModalData() {
    const n = document.getElementById('app-modal').getAttribute('data-app');
    appData[n] = document.getElementById('app-input').value;
    save(); closeModal();
}
function save() { localStorage.setItem('cozyKitchenSave', JSON.stringify(appData)); }

function updateEnv() {
    const h = new Date().getHours(), img = document.getElementById('bg-image');
    if(!img) return;
    img.src = (h >= 6 && h < 17) ? IMAGES.day : (h >= 17 && h < 20) ? IMAGES.sunset : IMAGES.night;
}
