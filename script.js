// --- 1. CONFIGURATION & ASSETS ---
const IMAGES = {
    dawn: "momsjointdawn.jpg",
    day: "momsjointday.jpg",
    sunset: "momsjointsunset.jpg",
    night: "momsjointnight.jpg"
};
const API_KEY = "88f3e35af62ba59bad38a3d346e0ca84";
let currentAudio = null;

// --- 2. DATA MANAGEMENT (Crash-Proof) ---
let appData = JSON.parse(localStorage.getItem('moonshearthData')) || {};
if (!appData.market) appData.market = [];
if (!appData.vault) appData.vault = 0.00;
if (!appData.events) appData.events = {};

function save() {
    localStorage.setItem('moonshearthData', JSON.stringify(appData));
    const vaultDisplay = document.getElementById('vault-balance');
    if (vaultDisplay) vaultDisplay.innerText = parseFloat(appData.vault).toFixed(2);
}

// --- 3. SYSTEM IGNITION ---
window.onload = function() {
    updateEnvironment();
    fetchWeatherOrb();
    renderAlmanac();
    fetchHolyWise();
    save(); 
    renderList('market');
    
    setInterval(updateEnvironment, 60000); // Check sky every minute
    setInterval(fetchWeatherOrb, 900000); // Check weather every 15 mins
};

// --- 4. LIVING BACKGROUND & ORB ---
function updateEnvironment() {
    const h = new Date().getHours();
    const bg = document.getElementById('bg-image');
    if (!bg) return;

    if (h >= 5 && h < 7) bg.src = IMAGES.dawn;
    else if (h >= 7 && h < 17) bg.src = IMAGES.day;
    else if (h >= 17 && h < 20) bg.src = IMAGES.sunset;
    else bg.src = IMAGES.night;
}

async function fetchWeatherOrb() {
    const tempDisp = document.getElementById('orb-temp');
    const descDisp = document.getElementById('orb-desc');
    const locDisp = document.getElementById('orb-loc');
    if (!tempDisp) return;

    try {
        // Fetches Farmington (38834)
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=38834,us&units=imperial&appid=${API_KEY}`);
        const data = await res.json();
        
        if (data.main) {
            tempDisp.innerText = `${Math.round(data.main.temp)}°`;
            descDisp.innerText = data.weather[0].main;
            locDisp.innerText = "Farmington, MS";
        }
    } catch(e) {
        tempDisp.innerText = "--°";
        descDisp.innerText = "Clouded";
    }
}

// --- 5. THE ALMANAC ---
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
        
        if (i === new Date().getDate() && m === new Date().getMonth() && y === new Date().getFullYear()) {
            d.classList.add('today');
        }
        if (appData.events[dateKey]) d.classList.add('has-event');
        
        d.innerText = i;
        d.onclick = () => {
            let info = appData.events[dateKey] ? `Record: ${appData.events[dateKey]}` : "No records inscribed.";
            document.getElementById('almanac-info').innerHTML = info;
            
            let note = prompt(`Inscribe record for ${m+1}/${i}/${y}:`, appData.events[dateKey] || "");
            if (note !== null) { 
                if(note.trim() === "") delete appData.events[dateKey];
                else appData.events[dateKey] = note; 
                save(); renderAlmanac(); 
            }
        };
        grid.appendChild(d);
    }
}
function changeMonth(dir) { curDate.setMonth(curDate.getMonth() + dir); renderAlmanac(); }

// --- 6. UI & MODALS ---
function togglePanel(id) { document.getElementById(id).classList.toggle('hidden'); }
function toggleSection(id) { document.getElementById(id).classList.toggle('hidden'); }
function closeModal() { document.getElementById('app-modal').classList.add('hidden'); }

function openApp(appId) {
    document.getElementById('toc-modal').classList.add('hidden');
    const m = document.getElementById('app-modal');
    m.setAttribute('data-app', appId);
    document.getElementById('modal-title').innerText = appId.replace('-', ' ').toUpperCase();
    
    let inst = "Hit Enter to add a timestamped log. Use #hashtags.";
    if (appId === 'budget-ledger') inst = "Ledger Engine: Start a new line with + or - and a number to auto-update Vault Balance (e.g., +50 Payday).";
    document.getElementById('modal-instructions').innerText = inst;
    
    const ta = document.getElementById('app-input');
    ta.value = appData[appId] || "";
    
    // Smart Logger
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
    
    // Ledger Math Engine
    if (appId === 'budget-ledger') {
        let newBalance = 0;
        const lines = text.split('\n');
        lines.forEach(line => {
            const match = line.trim().match(/^([+-])\s*\$?(\d+(\.\d{1,2})?)/);
            if (match) {
                const val = parseFloat(match[2]);
                newBalance += match[1] === '+' ? val : -val;
            }
        });
        appData.vault = newBalance;
    }
    
    save(); closeModal();
}

// --- 7. MARKET LIST ---
function handleLog(e, listName) {
    if (e.key === "Enter") {
        const input = document.getElementById(`${listName}-input`);
        if (input.value.trim()) {
            const now = new Date();
            const entry = `[${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}] ${input.value.trim()}`;
            appData[listName].push(entry);
            save(); renderList(listName);
            input.value = "";
        }
    }
}
function renderList(listName) {
    const ul = document.getElementById(`${listName}-list`);
    if (!ul) return;
    ul.innerHTML = "";
    appData[listName].forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = item.replace(/(#\w+)/g, '<span style="color:var(--eso-gold)">$1</span>');
        ul.appendChild(li);
    });
}
function filterList(listName) {
    const term = document.getElementById(`${listName}-search`).value.toLowerCase();
    const items = document.getElementById(`${listName}-list`).getElementsByTagName('li');
    for (let li of items) { li.style.display = li.innerText.toLowerCase().includes(term) ? "" : "none"; }
}
function clearList(listName) { if(confirm("Purge all items?")) { appData[listName] = []; save(); renderList(listName); } }

// --- 8. AUDIO ENGINE ---
function playAudio(filename) {
    if (currentAudio) currentAudio.pause();
    currentAudio = new Audio(filename);
    currentAudio.loop = true;
    currentAudio.play().catch(e => console.warn("Audio blocked by browser:", e));
}
function stopAudio() { if (currentAudio) currentAudio.pause(); }

// --- 9. AI GOBLIN ---
const goblinQuotes = ["The ledger demands attention, Keeper.", "A storm approaches.", "Do not forget to log your daily records.", "I checked the market list. We need salt."];
function pokeGoblin() {
    const d = document.getElementById('goblin-dialogue');
    d.innerText = goblinQuotes[Math.floor(Math.random() * goblinQuotes.length)];
    d.classList.remove('hidden');
    setTimeout(() => d.classList.add('hidden'), 5000);
}

// --- 10. HOLY & WISE API ---
async function fetchHolyWise() {
    try {
        const vRes = await fetch('https://bible-api.com/?random=verse');
        const vData = await vRes.json();
        if(vData.verses) document.getElementById('daily-verse').innerText = `"${vData.verses[0].text.trim()}" - ${vData.reference}`;
    } catch(e) { document.getElementById('daily-verse').innerText = "The connection is silent."; }
    
    const affirmations = ["You are the anchor of this hearth.", "Wisdom grows in quiet moments.", "Your strength protects the lineage.", "Breathe. The storm will pass."];
    document.getElementById('daily-affirmation').innerText = affirmations[Math.floor(Math.random() * affirmations.length)];
}

// --- 11. EXPORT/IMPORT ---
function exportData() {
    const blob = new Blob([JSON.stringify(appData)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Moonshearth_Ledger.json`;
    a.click();
}
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try { appData = JSON.parse(evt.target.result); save(); location.reload(); }
        catch(err) { alert("The scroll is corrupted."); }
    };
    reader.readAsText(file);
}
