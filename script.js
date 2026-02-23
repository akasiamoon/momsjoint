// --- CONFIGURATION ---
const WEATHER_API_KEY = "88f3e35af62ba59bad38a3d346e0ca84"; 
const ZIP_CODE = "38834"; 

// --- IMAGE FILENAMES ---
const IMAGES = {
    day: "momsjointday.jpg",
    sunset: "momsjointsunset.jpg",
    night: "momsjointnight.jpg"
};let appData = JSON.parse(localStorage.getItem('cozyKitchenSave')) || {};
const lists = ['marketList', 'notesList', 'todoList'];
lists.forEach(l => { if (!appData[l]) appData[l] = []; });
if (!appData.appointments) appData.appointments = {};

const appTitles = {
    'contingency-ledger': 'Contingency Ledger', 'todo': 'To Do List', 
    'weekly-meal-plan': 'Weekly Meal Plan', 'bible-verse': 'Bible Verse', 
    'phoebe': 'Phoebe', 'tripp': 'Tripp', 'cory': 'Cory', 'budget-ledger': 'Budget Ledger'
};

window.onload = function() {
    updateClock();
    renderAlmanac();
    renderList('market');
    console.log("Hearth Lighted. Dashboard Ready.");
};

function updateClock() {
    const now = new Date();
    let h = now.getHours(), m = now.getMinutes();
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    m = m < 10 ? '0' + m : m;
    const clock = document.getElementById('sink-clock');
    if(clock) clock.innerText = `${h}:${m} ${ampm}`;
}
setInterval(updateClock, 1000);

// --- TOGGLES & UI ---
function toggleBookshelf() { document.getElementById('bookshelf-panel').classList.toggle('hidden'); }
function toggleAvatarMenu() { document.getElementById('avatar-stats-box').classList.toggle('hidden'); }
function toggleTOC() { document.getElementById('toc-modal').classList.toggle('hidden'); }
function toggleSection(id) { document.getElementById(id).classList.toggle('hidden'); }

function toggleAudioMenu() {
    // We'll reuse the TOC modal for audio for now or you can make a separate one
    alert("Audio Menu Triggered (Hearth)");
}

// --- ALMANAC (Restored Moon Math) ---
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
    
    const startDay = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();

    for(let x=0; x<startDay; x++) grid.appendChild(document.createElement('div'));

    for(let i=1; i<=days; i++) {
        let d = document.createElement('div');
        d.className = 'almanac-day';
        if(i === new Date().getDate() && m === new Date().getMonth()) d.classList.add('today');
        d.innerText = i;
        d.onclick = () => {
            const phase = getMoonPhase(y, m + 1, i);
            document.getElementById('almanac-info').innerHTML = `<span class="highlight">Phase: ${phase}</span>`;
            let note = prompt("Inscribe Record:", appData.appointments[`${y}-${m+1}-${i}`] || "");
            if(note !== null) {
                appData.appointments[`${y}-${m+1}-${i}`] = note;
                save(); renderAlmanac();
            }
        };
        grid.appendChild(d);
    }
}
function changeMonth(dir) { curDate.setMonth(curDate.getMonth() + dir); renderAlmanac(); }

// --- LISTS & MODALS ---
function handleEnter(e, t) {
    if(e.key === 'Enter') {
        const i = document.getElementById(t + '-input');
        if(i.value.trim()) { appData[t + 'List'].push(i.value.trim()); save(); renderList(t); i.value = ''; }
    }
}
function renderList(t) {
    const l = document.getElementById(t + '-list');
    if(!l) return;
    l.innerHTML = '';
    appData[t + 'List'].forEach(x => { let li = document.createElement('li'); li.innerText = x; l.appendChild(li); });
}

function openApp(n) {
    const m = document.getElementById('app-modal');
    document.getElementById('modal-title').innerText = appTitles[n];
    m.setAttribute('data-app', n);
    const body = document.getElementById('modal-body');
    body.innerHTML = `<textarea id="app-input" style="width:100%;height:200px;background:#111;color:#e0d8c8;border:1px solid #cda24b;font-family:inherit;">${appData[n]||''}</textarea>`;
    m.classList.remove('hidden');
    document.getElementById('toc-modal').classList.add('hidden');
}

function closeModal() { document.getElementById('app-modal').classList.add('hidden'); }
function saveModalData() {
    const n = document.getElementById('app-modal').getAttribute('data-app');
    const input = document.getElementById('app-input');
    if(input) appData[n] = input.value;
    save(); closeModal();
}
function save() { localStorage.setItem('cozyKitchenSave', JSON.stringify(appData)); }
