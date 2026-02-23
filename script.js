// --- 1. CONFIGURATION & ASSETS ---
const IMAGES = {
    dawn: "momsjointdawn.jpg",
    day: "momsjointday.jpg",
    sunset: "momsjointsunset.jpg",
    night: "momsjointnight.jpg"
};
const API_KEY = "88f3e35af62ba59bad38a3d346e0ca84";
const LOCATIONS = [ { zip: "38834", name: "Farmington", id: "sink-temp-ms" }, { zip: "38310", name: "Adamsville", id: "sink-temp-tn" } ];
let currentAudio = null;

// --- 2. DATA MANAGEMENT ---
let appData = JSON.parse(localStorage.getItem('moonshearthData')) || { market: [], vault: 0.00, events: {} };

function save() {
    localStorage.setItem('moonshearthData', JSON.stringify(appData));
    document.getElementById('vault-balance').innerText = parseFloat(appData.vault).toFixed(2);
}

// --- 3. SYSTEM IGNITION ---
window.onload = function() {
    updateEnvironment();
    fetchWeather();
    renderAlmanac();
    fetchHolyWise();
    save(); // Init vault display
    renderList('market');
    
    setInterval(updateEnvironment, 60000); // Check time every minute
    setInterval(fetchWeather, 900000); // Check weather every 15 mins
};

// --- 4. THE LIVING BACKGROUND & CHRONOS ---
function updateEnvironment() {
    const now = new Date();
    const h = now.getHours();
    const clock = document.getElementById('sink-clock');
    const bg = document.getElementById('bg-image');

    // Time Formatting
    let hh = h % 12 || 12;
    let mm = now.getMinutes().toString().padStart(2, '0');
    if(clock) clock.innerText = `${hh}:${mm} ${h >= 12 ? 'PM' : 'AM'}`;

    // Sky Swapping
    if (h >= 5 && h < 7) bg.src = IMAGES.dawn;
    else if (h >= 7 && h < 17) bg.src = IMAGES.day;
    else if (h >= 17 && h < 20) bg.src = IMAGES.sunset;
    else bg.src = IMAGES.night;
}

async function fetchWeather() {
    for (let loc of LOCATIONS) {
        try {
            const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${loc.zip},us&units=imperial&appid=${API_KEY}`);
            const d = await r.json();
            if (d.main) {
                document.getElementById(loc.id).innerText = `${loc.name}: ${Math.round(d.main.temp)}°F | ${d.weather[0].main}`;
            }
        } catch(e) { document.getElementById(loc.id).innerText = `${loc.name}: Skies Obscured`; }
    }
}

// --- 5. THE ALMANAC & EVENTS ---
let curDate = new Date();

function getMoonPhase(y, m, d) {
    let c = 365.25 * (m < 3 ? y - 1 : y), e = 30.6 * (m < 3 ? m + 13 : m + 1);
    let jd = (c + e + d - 694039.09) / 29.5305882;
    let b = Math.round((jd - Math.floor(jd)) * 8);
    return ['New', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'][b % 8];
}

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
        const dateKey = `${m + 1}-${i}`;
        
        if (i === new Date().getDate() && m === new Date().getMonth()) d.classList.add('today');
        if (dateKey === "5-26" || appData.events[`${y}-${m+1}-${i}`]) d.classList.add('has-event');
        
        d.innerText = i;
        d.onclick = () => {
            let info = `Moon: ${getMoonPhase(y, m+1, i)}`;
            if (dateKey === "5-26") info += `<br><span style="color:#cda24b">Amber's Birthday</span>`;
            if (appData.events[`${y}-${m+1}-${i}`]) info += `<br>Record: ${appData.events[`${y}-${m+1}-${i}`]}`;
            
            document.getElementById('almanac-info').innerHTML = info;
            
            let note = prompt("Inscribe Day Record:", appData.events[`${y}-${m+1}-${i}`] || "");
            if (note !== null) { appData.events[`${y}-${m+1}-${i}`] = note; save(); renderAlmanac(); }
        };
        grid.appendChild(d);
    }
}
function changeMonth(dir) { curDate.setMonth(curDate.getMonth() + dir); renderAlmanac(); }

// --- 6. UI & MODAL HANDLING ---
function togglePanel(id) { document.getElementById(id).classList.toggle('hidden'); }
function toggleSection(id) { document.getElementById(id).classList.toggle('hidden'); }
function closeModal() { document.getElementById('app-modal').classList.add('hidden'); }

function openApp(appId) {
    document.getElementById('toc-modal').classList.add('hidden');
    const m = document.getElementById('app-modal');
    m.setAttribute('data-app', appId);
    document.getElementById('modal-title').innerText = appId.replace('-', ' ').toUpperCase();
    
    let instructions = "Hit Enter to add a timestamped log. Use #hashtags.";
    if (appId === 'budget-ledger') instructions = "Ledger Engine active. Start a new line with + or - and a number to auto-update your Vault Balance (e.g., +50 Payday, -20 Groceries).";
    document.getElementById('modal-instructions').innerText = instructions;
    
    const ta = document.getElementById('app-input');
    ta.value = appData[appId] || "";
    
    // The Smart Logger (Timestamping on Enter)
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
    
    // The Ledger Engine
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
    
    save();
    closeModal();
}

// --- 7. LISTS & HASHTAGS ---
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
        // Highlight hashtags
        li.innerHTML = item.replace(/(#\w+)/g, '<span style="color:var(--eso-gold)">$1</span>');
        ul.appendChild(li);
    });
}
function filterList(listName) {
    const term = document.getElementById(`${listName}-search`).value.toLowerCase();
    const items = document.getElementById(`${listName}-list`).getElementsByTagName('li');
    for (let li of items) {
        li.style.display = li.innerText.toLowerCase().includes(term) ? "" : "none";
    }
}
function clearList(listName) { if(confirm("Purge all items?")) { appData[listName] = []; save(); renderList(listName); } }

// --- 8. HOLY & WISE API ---
async function fetchHolyWise() {
    try {
        const vRes = await fetch('https://bible-api.com/?random=verse');
        const vData = await vRes.json();
        if(vData.verses) document.getElementById('daily-verse').innerText = `"${vData.verses[0].text.trim()}" - ${vData.reference}`;
    } catch(e) { document.getElementById('daily-verse').innerText = "The connection to the archives is silent."; }
    
    // Fallback array in case CORS blocks the external affirmation API
    const affirmations = ["You are the anchor of this hearth.", "Wisdom grows in quiet moments.", "Your strength protects the lineage.", "Breathe. The storm will pass."];
    document.getElementById('daily-affirmation').innerText = affirmations[Math.floor(Math.random() * affirmations.length)];
}

// --- 9. AUDIO ENGINE ---
function playAudio(filename) {
    if (currentAudio) currentAudio.pause();
    currentAudio = new Audio(filename);
    currentAudio.loop = true;
    currentAudio.play().catch(e => console.warn("Audio unlinked:", e));
}
function stopAudio() { if (currentAudio) currentAudio.pause(); }

// --- 10. AI GOBLIN FAMILIAR ---
const goblinQuotes = [
    "I checked the market list. We need more salt.",
    "The ledger demands your attention, Keeper.",
    "Should I stoke the hearth fire?",
    "Phoebe left a book on the table.",
    "Do not forget to log your daily records."
];
function pokeGoblin() {
    const d = document.getElementById('goblin-dialogue');
    d.innerText = goblinQuotes[Math.floor(Math.random() * goblinQuotes.length)];
    d.classList.remove('hidden');
    setTimeout(() => d.classList.add('hidden'), 5000);
}

// --- 11. EXPORT / IMPORT ---
function exportData() {
    const blob = new Blob([JSON.stringify(appData)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Moonshearth_Ledger_${new Date().toLocaleDateString().replace(/\//g,'-')}.json`;
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
