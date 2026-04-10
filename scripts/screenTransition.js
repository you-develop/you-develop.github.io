// 대기 화면 ↔ 메인 화면 전환 (역재생 지원)
const waitScreen = document.getElementById('waitScreen');
const mainScreen = document.getElementById('mainScreen');
const overlay = document.getElementById('glassOverlay');
const OVERLAY_TR = 'backdrop-filter 0.6s ease, -webkit-backdrop-filter 0.6s ease, background 0.6s ease';

let state = 'wait'; // 'wait' | 'to-main' | 'main' | 'to-wait'
let pendingTimer = null;

function clearPending() { if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; } }
function opacity(el) { return parseFloat(getComputedStyle(el).opacity); }
// 트랜지션 전 스타일 강제 갱신용 double rAF
function nextFrame(cb) { requestAnimationFrame(() => requestAnimationFrame(cb)); }

export function getState() { return state; }

export function toMain() {
    if (state === 'main') return;
    clearPending();

    if (state === 'to-wait') {
        const mDur = Math.round((1 - opacity(mainScreen)) * 500);
        const wDur = Math.round(opacity(waitScreen) * 400);

        mainScreen.classList.remove('hidden');
        mainScreen.style.transition = `opacity ${mDur}ms ease`;
        mainScreen.style.opacity = '1';

        waitScreen.style.transition = `opacity ${wDur}ms ease`;
        waitScreen.style.opacity = '0';

        nextFrame(() => {
            overlay.style.transition = OVERLAY_TR;
            overlay.style.backdropFilter = 'blur(0px)';
            overlay.style.webkitBackdropFilter = 'blur(0px)';
            overlay.style.background = 'rgba(255,255,255,0)';
        });

        state = 'to-main';
        pendingTimer = setTimeout(() => {
            waitScreen.classList.add('hidden');
            waitScreen.style.opacity = '';
            waitScreen.style.transition = '';
            state = 'main';
            pendingTimer = null;
        }, Math.max(mDur, wDur) + 50);
        return;
    }

    state = 'to-main';
    waitScreen.style.transition = 'opacity 0.4s ease';
    waitScreen.style.opacity = '0';
    waitScreen.style.pointerEvents = 'none';

    mainScreen.classList.remove('hidden');
    mainScreen.style.transition = 'none';
    mainScreen.style.opacity = '0';

    nextFrame(() => {
        overlay.style.transition = OVERLAY_TR;
        overlay.style.backdropFilter = 'blur(0px)';
        overlay.style.webkitBackdropFilter = 'blur(0px)';
        overlay.style.background = 'rgba(255,255,255,0)';
        mainScreen.style.transition = 'opacity 0.5s ease';
        mainScreen.style.opacity = '1';
    });

    pendingTimer = setTimeout(() => {
        waitScreen.classList.add('hidden');
        waitScreen.style.opacity = '';
        waitScreen.style.transition = '';
        waitScreen.style.pointerEvents = '';
        state = 'main';
        pendingTimer = null;
    }, 450);
}

export function toWait() {
    if (state === 'wait') return;
    clearPending();

    if (state === 'to-main') {
        const mDur = Math.round(opacity(mainScreen) * 500);
        const wDur = Math.round((1 - opacity(waitScreen)) * 400);

        mainScreen.style.transition = `opacity ${mDur}ms ease`;
        mainScreen.style.opacity = '0';

        waitScreen.classList.remove('hidden');
        waitScreen.style.pointerEvents = '';
        waitScreen.style.transition = `opacity ${wDur}ms ease`;
        waitScreen.style.opacity = '1';

        state = 'to-wait';
        pendingTimer = setTimeout(() => {
            mainScreen.classList.add('hidden');
            mainScreen.style.opacity = '';
            mainScreen.style.transition = '';
            state = 'wait';
            pendingTimer = null;
        }, Math.max(mDur, wDur) + 50);
        return;
    }

    state = 'to-wait';
    overlay.style.transition = 'none';
    overlay.style.backdropFilter = 'blur(0px)';
    overlay.style.webkitBackdropFilter = 'blur(0px)';
    overlay.style.background = 'rgba(255,255,255,0)';

    mainScreen.style.transition = 'opacity 0.4s ease';
    mainScreen.style.opacity = '0';

    waitScreen.classList.remove('hidden');
    waitScreen.style.transition = 'none';
    waitScreen.style.opacity = '0';

    nextFrame(() => {
        waitScreen.style.transition = 'opacity 0.4s ease';
        waitScreen.style.opacity = '1';
    });

    pendingTimer = setTimeout(() => {
        mainScreen.classList.add('hidden');
        mainScreen.style.opacity = '';
        mainScreen.style.transition = '';
        state = 'wait';
        pendingTimer = null;
    }, 450);
}
