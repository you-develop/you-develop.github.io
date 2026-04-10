// 대기 화면 드래그 → 화면 전체 유리 blur 효과 → 임계치 초과 시 콜백
const THRESHOLD = 150;
const MAX_BLUR = 6;

let overlay;
let dragStart = null;
let dragActive = false;
let distance = 0;

function applyBlur(px) {
    overlay.style.transition = 'none';
    overlay.style.backdropFilter = `blur(${px}px)`;
    overlay.style.webkitBackdropFilter = `blur(${px}px)`;
    overlay.style.background = `rgba(255,255,255,${(px / MAX_BLUR) * 0.001})`;
}

function resetBlur() {
    overlay.style.transition = 'backdrop-filter 0.3s ease, background 0.3s ease';
    overlay.style.backdropFilter = 'blur(0px)';
    overlay.style.webkitBackdropFilter = 'blur(0px)';
    overlay.style.background = 'rgba(255,255,255,0)';
}

export function init(onThresholdReached) {
    overlay = document.getElementById('glassOverlay');

    document.addEventListener('mousedown', (e) => {
        if (document.getElementById('waitScreen').classList.contains('hidden')) return;
        dragStart = { x: e.clientX, y: e.clientY };
        dragActive = true;
        distance = 0;
    });

    document.addEventListener('mousemove', (e) => {
        if (!dragActive) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        distance = Math.sqrt(dx * dx + dy * dy);
        const blur = Math.min((distance / THRESHOLD) * MAX_BLUR, MAX_BLUR);
        applyBlur(blur);
    });

    document.addEventListener('mouseup', () => {
        if (!dragActive) return;
        dragActive = false;

        if (distance >= THRESHOLD) {
            onThresholdReached(); // blur 유지 - screenTransition에서 역재생
        } else {
            resetBlur();
        }
        distance = 0;
    });
}
