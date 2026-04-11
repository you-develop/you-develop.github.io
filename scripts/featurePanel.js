// 기능 패널: 표시/숨김 + 콘텐츠 모듈 mount/unmount
import { reset as resetSpinner } from './spinner/index.js';

const panel = document.getElementById('featurePanel');
const titleEl = document.getElementById('panelTitle');
const modules = {};
let currentId = null;
let hideTimer = null;
const TRANSITION_MS = 350;

export function registerModule(id, { mount, unmount }) {
    modules[id] = { mount, unmount };
}

export function show(icon) {
    if (currentId === icon.id) return;
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }

    // 이미 열려 있으면 페이드 아웃 후 새 콘텐츠로 교체
    if (currentId) {
        panel.classList.remove('panel-open');
        const prevId = currentId;
        currentId = null;
        hideTimer = setTimeout(() => {
            hideTimer = null;
            modules[prevId]?.unmount?.();
            _mount(icon);
        }, TRANSITION_MS);
        return;
    }

    _mount(icon);
}

function _mount(icon) {
    currentId = icon.id;
    titleEl.innerHTML = `<span>${icon.label}</span>`;
    modules[icon.id]?.mount?.(panel);
    requestAnimationFrame(() => requestAnimationFrame(() => {
        panel.classList.add('panel-open');
    }));
}

export function getTitleEl() { return titleEl; }

export function hide() {
    const prevId = currentId;
    currentId = null;
    panel.classList.remove('panel-open');
    resetSpinner();
    // 트랜지션 종료 후 내용 비움
    hideTimer = setTimeout(() => {
        modules[prevId]?.unmount?.();
        titleEl.innerHTML = '';
        hideTimer = null;
    }, TRANSITION_MS);
}

export function isVisible() {
    return panel.classList.contains('panel-open');
}
