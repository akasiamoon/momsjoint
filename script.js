// --- 1. CONFIGURATION ---
const IMAGES = {
    dawn: "momsjointdawn.jpg",
    day: "momsjointday.jpg",
    sunset: "momsjointsunset.jpg",
    night: "momsjointnight.jpg"
};
const API_KEY = "88f3e35af62ba59bad38a3d346e0ca84"; 
const ZIP_CODE = "38834"; // Farmington, MS
let currentAudio = null;

// --- 2. DATA HANDLING ---
let appData = JSON.parse(localStorage.getItem('moonshearthData')) || {};
if (!appData.market) appData.market = [];
if (!appData.vault) appData.vault = 0.00;
if (!appData.events) appData.events = {};
// Ensure dynamic app data exists
const dynamicApps = ['tea-log', 'cat-log', 'phoebe-journal', 'tripp-journal', 'cory-journal', 'personal-journal', 'objectives', 'provisions', 'budget-ledger', 'important-numbers', 'master-journal'];
dynamicApps.forEach(app => { if(!appData[app]) appData[app] = ""; });

function save() {
    localStorage.setItem('moonshearthData', JSON.stringify(appData));
    const v = document.getElementById('vault-balance');
    if (v) v.innerText = parseFloat(appData.vault).toFixed(2);
}

// --- 3. STARTUP ---
window.onload = function() {
    updateEnvironment();
    fetchWeather();
    renderAlmanac();
    fetchHolyWise();
    save();
    renderList('market');
    
    setInterval(updateEnvironment, 60000); 
    setInterval(fetchWeather, 300000);
};

// --- 4. ENVIRONMENT & WEATHER ---
function updateEnvironment() {
    const h = new Date().getHours();
    const bg = document.getElementById('bg-image');
    if (!bg) return;
    if (h >= 5 && h < 7) bg.src = IMAGES.dawn;
    else if (h >= 7 && h < 17) bg.src = IMAGES.day;
    else if (h >= 17 && h < 20) bg.src = IMAGES.sunset;
    else bg.src = IMAGES.night;
}

async function fetchWeather() {
    const tDisp = document.getElementById('orb-temp');
    if (!tDisp) return;
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?zip=${ZIP_CODE},us&units=imperial&appid=${API_KEY}`;
        const r = await fetch(url);
        const d = await r.json();
        if (d.main) tDisp.innerText = `${Math.round(d.main.temp)}°`;
        else tDisp.innerText = "--°";
    } catch(e) { 
        console.warn("Weather Error:", e); 
        tDisp.innerText = "--°"; 
    }
}

// --- 5. ALMANAC ---
let curDate = new Date();
function renderAlmanac() {
    const grid = document.getElementById('almanac-grid');
    if (!grid) return;
    grid.innerHTML = "";
    
    const y = curDate.getFullYear();
    const m = curDate.getMonth();
    document.getElementById('almanac-month-year').innerText = curDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const days = new Date(y, m + 1, 0).getDate();
    const start = new Date(y, m, 1).getDay();

    for (let x = 0; x < start; x++) grid.appendChild(document.createElement('div'));
    
    for (let i = 1; i <= days; i++) {
        const d = document.createElement('div');
        d.className = 'almanac-day';
        const dateKey = `${y}-${m+1}-${i}`;
        
        if (i === new Date().getDate() && m === new Date().getMonth()) d.classList.add('today');
        if (appData.events[dateKey]) d.classList.add('has-event');
        
        d.innerText = i;
        d.onclick = () => {
            let note = prompt(`Log for ${m+1}/${i}:`, appData.events[dateKey] || "");
            if (note !== null) { 
                if (note.trim() === "") delete appData.events[dateKey];
                else appData.events[dateKey] = note;
                save(); renderAlmanac();
            }
        };
        grid.appendChild(d);
    }
}
function changeMonth(dir) { curDate.setMonth(curDate.getMonth() + dir); renderAlmanac(); }

// --- 6. UI & APPS ---
function togglePanel(id) { document.getElementById(id).classList.toggle('hidden'); }
function toggleSection(id) { document.getElementById(id).classList.toggle('hidden'); }
function closeModal() { document.getElementById('app-modal').classList.add('hidden'); }

function openApp(appId) {
    document.getElementById('toc-modal').classList.add('hidden');
    document.getElementById('avatar-stats-box').classList.add('hidden'); // Close menu
    
    const m = document.getElementById('app-modal');
    m.setAttribute('data-app', appId);
    document.getElementById('modal-title').innerText = appId.replace(/-/g, ' ').toUpperCase();
    
    let inst = "Hit Enter to add a timestamped log.";
    if (appId === 'budget-ledger') inst = "Ledger Mode: Start line with +50 or -20 to update Vault.";
    document.getElementById('modal-instructions').innerText = inst;
    
    const ta = document.getElementById('app-input');
    ta.value = appData[appId] || "";
    
    ta.onkeydown = function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const now = new Date();
            const ts = `\n[${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}] `;
            const pos = this.selectionStart;
            this.value = this.value.substring(0, pos) + ts + this.value.substring(pos);
            this.selectionStart = this.selectionEnd = pos + ts.length;
        }
    };
    m.classList.remove('hidden');
}

function saveModal() {
    const appId = document.getElementById('app-modal').getAttribute('data-app');
    const text = document.getElementById('app-input').value;
    appData[appId] = text;
    
    if (appId === 'budget-ledger') {
        let bal = 0;
        text.split('\n').forEach(line => {
            const m = line.trim().match(/^([+-])\s*\$?(\d+(\.\d{1,2})?)/);
            if (m) bal += (m[1] === '+' ? parseFloat(m[2]) : -parseFloat(m[2]));
        });
        appData.vault = bal;
    }
    save(); closeModal();
}

// --- 7. MARKET LIST ---
function handleLog(e, list) {
    if (e.key === "Enter") {
        const inp = document.getElementById(`${list}-input`);
        if (inp.value.trim()) {
            const now = new Date();
            const entry = `[${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}] ${inp.value.trim()}`;
            appData[list].push(entry);
            save(); renderList(list);
            inp.value = "";
        }
    }
}
function renderList(list) {
    const ul = document.getElementById(`${list}-list`);
    if (!ul) return;
    ul.innerHTML = "";
    appData[list].forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = item.replace(/(#\w+)/g, '<span style="color:var(--eso-gold)">$1</span>');
        ul.appendChild(li);
    });
}
function filterList(list) {
    const term = document.getElementById(`${list}-search`).value.toLowerCase();
    const items = document.getElementById(`${list}-list`).getElementsByTagName('li');
    for (let li of items) { li.style.display = li.innerText.toLowerCase().includes(term) ? "" : "none"; }
}
function clearList(list) { if(confirm("Clear list?")) { appData[list] = []; save(); renderList(list); } }

// --- 8. AUDIO & EXTRAS ---
function playAudio(f) {
    if (currentAudio) currentAudio.pause();
    currentAudio = new Audio(f);
    currentAudio.loop = true;
    currentAudio.play().catch(e => console.log("Audio block:", e));
}
function stopAudio() { if (currentAudio) currentAudio.pause(); }

function pokeGoblin() {
    const d = document.getElementById('goblin-dialogue');
    const q = ["Checked the ledger yet?", "I smell rain coming.", "Do we have tea?", "Phoebe's journal is updating."];
    d.innerText = q[Math.floor(Math.random()*q.length)];
    d.classList.remove('hidden');
    setTimeout(() => d.classList.add('hidden'), 4000);
}

async function fetchHolyWise() {
    try {
        const r = await fetch('https://bible-api.com/?random=verse');
        const d = await r.json();
        if(d.verses) document.getElementById('daily-verse').innerText = `"${d.verses[0].text.trim()}" - ${d.reference}`;
    } catch(e) {}
    
    const aff = ["You are the anchor.", "Wisdom in silence.", "Strength in patience."];
    document.getElementById('daily-affirmation').innerText = aff[Math.floor(Math.random()*aff.length)];
}

function exportData() {
    const blob = new Blob([JSON.stringify(appData)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Moonshearth.json`;
    a.click();
}
function importData(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = function(evt) { try { appData = JSON.parse(evt.target.result); save(); location.reload(); } catch(e){ alert("Corrupt file."); } };
    r.readAsText(f);
}
