// --- CONFIG ---
const IMAGES = { day: "momsjointday.jpg", sunset: "momsjointsunset.jpg", night: "momsjointnight.jpg" };
const API_KEY = "88f3e35af62ba59bad38a3d346e0ca84";
const ZIP = "38834";

let appData = JSON.parse(localStorage.getItem('cozyKitchenSave')) || {};
const lists = ['marketList', 'notesList', 'todoList'];
lists.forEach(l => { if (!appData[l]) appData[l] = []; });
if (!appData.appointments) appData.appointments = {};

const appTitles = { 'contingency-ledger': 'Contingency Ledger', 'todo': 'To Do', 'weekly-meal-plan': 'Meal Plan', 'budget-ledger': 'Budget' };

window.onload = function() {
    updateEnv();
    updateClock();
    renderAlmanac();
    renderList('market');
};

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

let curDate = new Date();
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
        let d = document.createElement('div'); d.className = 'almanac-day'; d.innerText = i;
        d.onclick = () => {
            let n = prompt("Note:", appData.appointments[`${y}-${m+1}-${i}`] || "");
            if(n !== null) { appData.appointments[`${y}-${m+1}-${i}`] = n; save(); renderAlmanac(); }
        };
        grid.appendChild(d);
    }
}
function changeMonth(dir) { curDate.setMonth(curDate.getMonth() + dir); renderAlmanac(); }

function handleEnter(e, t) {
    if(e.key === 'Enter') {
        const i = document.getElementById(t + '-input');
        appData[t + 'List'].push(i.value); save(); renderList(t); i.value = '';
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
