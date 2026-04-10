// 대기 화면 ↔ 메인 화면 전환 (역재생 지원)
import { setIconFade, animateIconFade, getIconFade } from './spinner/index.js';

const waitScreen = document.getElementById('waitScreen');
const mainScreen = document.getElementById('mainScreen');
const overlay = document.getElementById('glassOverlay');
const clock = document.querySelector('.top-clock');
const OVERLAY_TR = 'backdrop-filter 0.6s ease, -webkit-backdrop-filter 0.6s ease, background 0.6s ease';

let state = 'wait'; // 'wait' | 'to-main' | 'main' | 'to-wait'
let pendingTimer = null;

function clearPending() { if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; } }
function opacity(el) { return parseFloat(getComputedStyle(el).opacity); }
// 트랜지션 전 스타일 강제 갱신용 double rAF
function nextFrame(cb) { requestAnimationFrame(() => requestAnimationFrame(cb)); }
function clearOverlay() {
    overlay.style.backdropFilter = 'blur(0px)';
    overlay.style.webkitBackdropFilter = 'blur(0px)';
    overlay.style.background = 'rgba(255,255,255,0)';
}

export function getState() { return state; }

export function toMain() {
    if (state === 'main') return;
    clearPending();

    if (state === 'to-wait') {
        const fade = getIconFade();
        const mDur = Math.round((1 - fade) * 500);
        const cDur = Math.round((1 - opacity(clock)) * 500);
        const wDur = Math.round(opacity(waitScreen) * 400);

        animateIconFade(1, mDur);
        clock.style.transition = `opacity ${cDur}ms ease`;
        clock.style.opacity = '1';
        waitScreen.style.transition = `opacity ${wDur}ms ease`;
        waitScreen.style.opacity = '0';
        nextFrame(() => { overlay.style.transition = OVERLAY_TR; clearOverlay(); });

        state = 'to-main';
        pendingTimer = setTimeout(() => {
            waitScreen.classList.add('hidden');
            waitScreen.style.opacity = '';
            waitScreen.style.transition = '';
            clock.style.opacity = '';
            clock.style.transition = '';
            state = 'main';
            pendingTimer = null;
        }, Math.max(mDur, wDur, cDur) + 50);
        return;
    }

    state = 'to-main';
    waitScreen.style.transition = 'opacity 0.4s ease';
    waitScreen.style.opacity = '0';
    waitScreen.style.pointerEvents = 'none';

    setIconFade(0);
    clock.style.transition = 'none';
    clock.style.opacity = '0';
    mainScreen.classList.remove('hidden');

    nextFrame(() => {
        overlay.style.transition = OVERLAY_TR;
        clearOverlay();
        clock.style.transition = 'opacity 0.5s ease';
        clock.style.opacity = '1';
        animateIconFade(1, 500);
    });

    pendingTimer = setTimeout(() => {
        waitScreen.classList.add('hidden');
        waitScreen.style.opacity = '';
        waitScreen.style.transition = '';
        waitScreen.style.pointerEvents = '';
        clock.style.opacity = '';
        clock.style.transition = '';
        state = 'main';
        pendingTimer = null;
    }, 450);
}

export function toWait() {
    if (state === 'wait') return;
    clearPending();

    if (state === 'to-main') {
        const fade = getIconFade();
        const mDur = Math.round(fade * 500);
        const cDur = Math.round(opacity(clock) * 500);
        const wDur = Math.round((1 - opacity(waitScreen)) * 400);

        animateIconFade(0, mDur);
        clock.style.transition = `opacity ${cDur}ms ease`;
        clock.style.opacity = '0';
        waitScreen.classList.remove('hidden');
        waitScreen.style.pointerEvents = '';
        waitScreen.style.transition = `opacity ${wDur}ms ease`;
        waitScreen.style.opacity = '1';

        state = 'to-wait';
        pendingTimer = setTimeout(() => {
            mainScreen.classList.add('hidden');
            clock.style.opacity = '';
            clock.style.transition = '';
            setIconFade(1);
            state = 'wait';
            pendingTimer = null;
        }, Math.max(mDur, wDur, cDur) + 50);
        return;
    }

    state = 'to-wait';
    overlay.style.transition = 'none';
    clearOverlay();

    animateIconFade(0, 400);
    clock.style.transition = 'opacity 0.4s ease';
    clock.style.opacity = '0';
    waitScreen.classList.remove('hidden');
    waitScreen.style.transition = 'none';
    waitScreen.style.opacity = '0';

    nextFrame(() => {
        waitScreen.style.transition = 'opacity 0.4s ease';
        waitScreen.style.opacity = '1';
    });

    pendingTimer = setTimeout(() => {
        mainScreen.classList.add('hidden');
        clock.style.opacity = '';
        clock.style.transition = '';
        setIconFade(1);
        state = 'wait';
        pendingTimer = null;
    }, 450);
}
