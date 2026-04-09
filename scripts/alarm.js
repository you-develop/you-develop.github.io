// 알람 토글·트리거·사운드 관리 모듈
const DURATION = 10000;
let enabled = false;
let lastHour = -1;
let soundInterval;

const bg       = document.getElementById('background');
const toggle   = document.getElementById('alarmToggle');
const bellOn   = document.getElementById('bellOn');
const bellOff  = document.getElementById('bellOff');
const msg      = document.getElementById('alarmMessage');
const progress = document.getElementById('alarmProgressBar');
const sound    = document.getElementById('alarmSound');

function playSound() {
    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function startSound() {
    stopSound();
    playSound();
    soundInterval = setInterval(playSound, 2000);
}

function stopSound() {
    if (!soundInterval) return;
    clearInterval(soundInterval);
    soundInterval = null;
    sound.pause();
    sound.currentTime = 0;
}

function triggerAlarm() {
    bg.classList.add('flash');
    startSound();
    msg.classList.remove('hidden');
    progress.style.width = '100%';
    setTimeout(() => msg.classList.add('show'), 100);
    setTimeout(() => bg.classList.remove('flash'), 1500);

    const start = Date.now();
    const interval = setInterval(() => {
        const pct = 100 - (Date.now() - start) / DURATION * 100;
        if (pct <= 0) { clearInterval(interval); progress.style.width = '0%'; }
        else progress.style.width = pct + '%';
    }, 50);

    setTimeout(() => {
        clearInterval(interval);
        stopSound();
        msg.classList.remove('show', 'sound-muted');
        setTimeout(() => msg.classList.add('hidden'), 500);
    }, DURATION);
}

function toggleAlarm() {
    enabled = !enabled;
    bellOff.classList.toggle('hidden', enabled);
    bellOn.classList.toggle('hidden', !enabled);
    toggle.classList.toggle('active', enabled);
    if (!enabled) return;
    lastHour = new Date().getHours();
    sound.volume = 0.1;
    sound.play().then(() => setTimeout(() => {
        sound.pause(); sound.currentTime = 0; sound.volume = 1;
    }, 100)).catch(() => {});
}

export function onTick(h, m, s) {
    if (enabled && m === '00' && s === '00' && lastHour !== h) {
        triggerAlarm();
        lastHour = h;
    }
}

export function init() {
    toggle.addEventListener('click', toggleAlarm);
    msg.addEventListener('click', () => { stopSound(); msg.classList.add('sound-muted'); });
    window.addEventListener('load', () => {
        document.body.addEventListener('click', () => {
            if (enabled && sound.paused) sound.load();
        }, { once: true });
    });
}
