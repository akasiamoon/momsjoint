let appData = JSON.parse(localStorage.getItem('cozyKitchenSave')) || {};
const lists = ['marketList', 'notesList', 'todoList'];
lists.forEach(list => { if (!appData[list]) appData[list] = []; });
if (!appData.appointments) appData.appointments = {};

const appTitles = {
    'contingency-ledger': 'Contingency Ledger', 'todo': 'To Do List', 
    'weekly-meal-plan': 'Weekly Meal Plan', 'bible-verse': 'Bible Verse', 
    'recipes': 'Recipes', 'dev-ideas': 'Dev Ideas', 'mood-log': 'Mood Log',
    'budget-ledger': 'Budget Ledger', 'sleep-log': 'Sleep Log', 
    'meal-log': 'Meal Log', 'phoebe': 'Phoebe', 'tripp': 'Tripp', 'cory': 'Cory'
};

window.onload = function() {
    updateClock();
    renderAlmanac();
    renderList('market');
    renderList('notes');
};

function updateClock() {
    const clock = document.getElementById('sink-clock');
    if (!clock) return;
    const now = new Date();
    let h = now.getHours(), m = now.getMinutes();
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    m = m < 10 ? '0' + m : m;
    clock.innerText = `${h}:${m} ${ampm}`;
}
setInterval(updateClock, 1000);

function toggleBookshelf() { document.getElementById('bookshelf-panel').classList.toggle('hidden'); }
function toggleAvatarMenu() { document.getElementById('avatar-stats-box').classList.toggle('hidden'); }
function toggleAudioMenu() { document.getElementById('audio-menu').classList.toggle('hidden'); }
function toggleTOC() { document.getElementById('toc-modal').classList.toggle('hidden'); }
function toggleSection(id) { document.getElementById(id).classList.toggle('hidden'); }

function changeAudio(type) {
    const amb = document.getElementById('ambient-select');
    const pri = document.getElementById('primary-select');
    const ambP = document.getElementById('ambient-player');
    const priP = document.getElementById('primary-player');
    if (type === 'ambient') { ambP.src = amb.value; ambP.load(); ambP.play(); }
    else { priP.src = pri.value; priP.load(); priP.play(); }
}

let currentAlmanacDate = new Date();
function renderAlmanac() {
    const grid = document.getElementById('almanac-grid');
    if (!grid) return;
    const y = currentAlmanacDate.getFullYear(), m = currentAlmanacDate.getMonth();
    document.getElementById('almanac-month-year').innerText = currentAlmanacDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    grid.innerHTML = '';
    const firstDay = new Date(y, m, 1).getDay();
    for (let x = 0; x < firstDay; x++) grid.appendChild(document.createElement('div'));
    for (let i = 1; i <= new Date(y, m + 1, 0).getDate(); i++) {
        const d = document.createElement('div');
        d.className = 'almanac-day';
        if (i === new Date().getDate() && m === new Date().getMonth()) d.classList.add('today');
        d.innerText = i;
        d.onclick = () => {
            let note = prompt("Inscribe a record:", appData.appointments[`${y}-${m+1}-${i}`] || "");
            if (note !== null) {
                appData.appointments[`${y}-${m+1}-${i}`] = note;
                saveCoreData();
                renderAlmanac();
            }
        };
        grid.appendChild(d);
    }
}
function changeMonth(d) { currentAlmanacDate.setMonth(currentAlmanacDate.getMonth() + d); renderAlmanac(); }

function handleEnter(e, t) {
    if (e.key === 'Enter') {
        const i = document.getElementById(`${t}-input`);
        if (i && i.value.trim()) {
            appData[t === 'market' ? 'marketList' : 'notesList'].push(i.value.trim());
            saveCoreData();
            renderList(t);
            i.value = '';
        }
    }
}
function renderList(t) {
    const l = document.getElementById(`${t}-list`), d = appData[t === 'market' ? 'marketList' : 'notesList'];
    if (!l) return;
    l.innerHTML = '';
    d.forEach(x => { let li = document.createElement('li'); li.innerText = x; l.appendChild(li); });
}
function clearList(t) { 
    appData[t === 'market' ? 'marketList' : 'notesList'] = []; 
    saveCoreData();
    renderList(t); 
}

function openApp(n) {
    const m = document.getElementById('app-modal');
    document.getElementById('modal-title').innerText = appTitles[n];
    m.setAttribute('data-app', n);
    document.getElementById('modal-body').innerHTML = `<textarea id="app-input" style="width:100%; height:200px; background:#111; color:white; border:1px solid #cda24b;">${appData[n] || ""}</textarea>`;
    m.classList.remove('hidden');
    document.getElementById('toc-modal').classList.add('hidden');
}

function closeModal() { document.getElementById('app-modal').classList.add('hidden'); }

function saveModalData() {
    const n = document.getElementById('app-modal').getAttribute('data-app');
    const input = document.getElementById('app-input');
    if (input) appData[n] = input.value;
    saveCoreData();
    closeModal();
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
