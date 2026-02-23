const IMAGES = {
    day: "momsjointday.jpg", // Using your confirmed filename
    sunset: "momsjointsunset.jpg", // Update these when you have the files!
    night: "momsjointnight.jpg"
}
    ;window.onload = function() {
    updateClock();
    renderAlmanac();
    // Force set the background to ensure it exists
    const bg = document.getElementById('bg-image');
    if (bg) bg.src = "momsjointday.jpg"; 
};

function updateClock() {
    const clock = document.getElementById('sink-clock');
    const now = new Date();
    let h = now.getHours(), m = now.getMinutes();
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    m = m < 10 ? '0' + m : m;
    if(clock) clock.innerText = `${h}:${m} ${ampm}`;
}
setInterval(updateClock, 1000);

function renderAlmanac() {
    const grid = document.getElementById('almanac-grid');
    if (!grid) return;
    grid.innerHTML = "";
    const now = new Date();
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

    for (let x = 0; x < firstDay; x++) grid.appendChild(document.createElement('div'));
    for (let i = 1; i <= totalDays; i++) {
        const d = document.createElement('div');
        d.className = 'almanac-day';
        if (i === now.getDate()) d.classList.add('today');
        d.innerText = i;
        grid.appendChild(d);
    }
}

function toggleAvatarMenu() {
    document.getElementById('avatar-stats-box').classList.toggle('hidden');
}

function toggleBookshelf() {
    document.getElementById('bookshelf-panel').classList.toggle('hidden');
}
