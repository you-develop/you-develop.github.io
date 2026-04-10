// 기능 패널: 표시/숨김
import { reset as resetSpinner } from './spinner/index.js';

const panel = document.getElementById('featurePanel');
const titleEl = document.getElementById('panelTitle');

export function show(icon) {
    titleEl.textContent = icon.label;
    panel.classList.remove('hidden');
}

export function hide() {
    panel.classList.add('hidden');
    resetSpinner();
}

export function isVisible() {
    return !panel.classList.contains('hidden');
}
