// 기능 패널: 표시/숨김 + 콘텐츠 모듈 mount/unmount
import { reset as resetSpinner } from './spinner/index.js';

const panel = document.getElementById('featurePanel');
const titleEl = document.getElementById('panelTitle');
const modules = {};
let currentId = null;

export function registerModule(id, { mount, unmount }) {
    modules[id] = { mount, unmount };
}

export function show(icon) {
    modules[currentId]?.unmount?.();
    currentId = icon.id;
    titleEl.textContent = icon.label;
    panel.classList.remove('hidden');
    modules[icon.id]?.mount?.(panel);
}

export function hide() {
    modules[currentId]?.unmount?.();
    currentId = null;
    panel.classList.add('hidden');
    resetSpinner();
}

export function isVisible() {
    return !panel.classList.contains('hidden');
}
