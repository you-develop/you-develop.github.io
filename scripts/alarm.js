const DURATION = 5000;
let audio = null;
let overlay = null;
let timer = null;

export function init() {
    audio = new Audio('assets/sounds/alarm.mp3');
    audio.preload = 'auto';
    audio.loop = true;
    overlay = document.createElement('div');
    overlay.className = 'pomodoro-overlay';
    overlay.innerHTML = '<p class="pomodoro-overlay-message"></p>';
    overlay.addEventListener('click', stop);
    document.body.appendChild(overlay);
}

export function unlock() {
    if (!audio) return;
    audio.muted = true;
    audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
    }).catch(() => { audio.muted = false; });
}

export function show(message) {
    if (!audio || !overlay) return;
    stop();
    overlay.querySelector('p').textContent = message;
    overlay.classList.add('visible');
    audio.currentTime = 0;
    audio.play().catch(() => {});
    timer = setTimeout(stop, DURATION);
}

export function stop() {
    if (timer) clearTimeout(timer);
    timer = null;
    overlay?.classList.remove('visible');
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
}
