let appData = JSON.parse(localStorage.getItem('cozyKitchenSave')) || {};
const lists = ['marketList', 'notesList', 'todoList'];
lists.forEach(l => { if (!appData[l]) appData[l] = []; });

window.onload = function() {
    updateClock();
    renderAlmanac();
    renderList('market');
};

function updateClock() {
    const now = new Date();
    let h = now.getHours(), m = now.getMinutes();
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    m = m < 10 ? '0' + m : m;
    const clock = document.getElementById('sink-clock');
    if(clock) clock.innerText = h + ":" + m + " " + ampm;
}
setInterval(updateClock, 1000);

function toggleBookshelf() { document.getElementById('bookshelf-panel').classList.toggle('hidden'); }
function toggleTOC() { document.getElementById('toc-modal').classList.toggle('hidden'); }
function toggleSection(id) { document.getElementById(id).classList.toggle('hidden'); }

// Almanac
let curDate = new Date();
function renderAlmanac() {
    const grid = document.getElementById('almanac-grid');
    if(!grid) return;
    grid.innerHTML = '';
    const y = curDate.getFullYear(), m = curDate.getMonth();
    document.getElementById('almanac-month-year').innerText = curDate.toLocaleString('default', {month:'long', year:'numeric'});
    const days = new Date(y, m + 1, 0).getDate();
    for(let i=1; i<=days; i++) {
        let d = document.createElement('div');
        d.className = 'almanac-day'; d.innerText = i;
        d.onclick = () => { alert("Selected: " + i); };
        grid.appendChild(d);
    }
}
function changeMonth(dir) { curDate.setMonth(curDate.getMonth() + dir); renderAlmanac(); }

// Lists
function handleEnter(e, t) {
    if(e.key === 'Enter') {
        const i = document.getElementById(t + '-input');
        appData[t + 'List'].push(i.value);
        save(); renderList(t); i.value = '';
    }
}
function renderList(t) {
    const l = document.getElementById(t + '-list');
    if(!l) return;
    l.innerHTML = '';
    appData[t + 'List'].forEach(x => { let li = document.createElement('li'); li.innerText = x; l.appendChild(li); });
}

// Modal System
function openApp(n) {
    const m = document.getElementById('app-modal');
    document.getElementById('modal-title').innerText = n.toUpperCase();
    m.setAttribute('data-app', n);
    const body = document.getElementById('modal-body');
    if(n === 'todo') {
        body.innerHTML = '<p>To Do items with checkboxes go here.</p>';
    } else {
        body.innerHTML = `<textarea id="app-input" style="width:100%;height:150px;">${appData[n]||''}</textarea>`;
    }
    m.classList.remove('hidden');
}
function closeModal() { document.getElementById('app-modal').classList.add('hidden'); }
function saveModalData() {
    const n = document.getElementById('app-modal').getAttribute('data-app');
    const input = document.getElementById('app-input');
    if(input) appData[n] = input.value;
    save(); closeModal();
}
function save() { localStorage.setItem('cozyKitchenSave', JSON.stringify(appData)); }
