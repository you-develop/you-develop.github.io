// 날짜/시간 표시 모듈
const dateEl = document.getElementById('date');
const timeEl = document.getElementById('time');
const mainDateEl = document.getElementById('mainDate');
const mainTimeEl = document.getElementById('mainTime');

function tick(onTick) {
    const now = new Date();
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('ko-KR', opts);

    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${h}:${m}:${s}`;

    dateEl.textContent = dateStr;
    timeEl.textContent = timeStr;
    if (mainDateEl) mainDateEl.textContent = dateStr;
    if (mainTimeEl) mainTimeEl.textContent = timeStr;

    if (onTick) onTick(h, m, s);
}

export function init(onTick) {
    tick(onTick);
    setInterval(() => tick(onTick), 1000);
}
