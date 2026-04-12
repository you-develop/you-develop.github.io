// 캘린더 모듈 mount / unmount
import { getTitleEl } from '../featurePanel.js';
import { getMonthData } from './store.js';
import { buildCalendar } from './render.js';

let viewYear = 0, viewMonth = 0;
let navEl = null, calBody = null, panelRef = null;
let abortCtrl = null;

export function mount(panelEl) {
    unmount();
    panelRef = panelEl;

    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();

    navEl = buildNav();
    getTitleEl().appendChild(navEl);

    renderCal();

    abortCtrl = new AbortController();
    const sig = { signal: abortCtrl.signal };
    navEl.querySelector('.cal-nav-prev').addEventListener('click', () => navigate(-1), sig);
    navEl.querySelector('.cal-nav-next').addEventListener('click', () => navigate(1), sig);
}

export function unmount() {
    abortCtrl?.abort();
    navEl?.remove();
    calBody?.remove();
    navEl = null; calBody = null; panelRef = null;
}

function buildNav() {
    const nav = document.createElement('div');
    nav.className = 'cal-nav';
    nav.innerHTML = `
        <button class="cal-nav-btn cal-nav-prev">&#8249;</button>
        <span class="cal-nav-label"></span>
        <button class="cal-nav-btn cal-nav-next">&#8250;</button>`;
    return nav;
}

function updateNavLabel() {
    const pad = n => String(n).padStart(2, '0');
    navEl.querySelector('.cal-nav-label').textContent =
        `${viewYear}.${pad(viewMonth + 1)}`;
}

function renderCal() {
    calBody?.remove();
    const data = getMonthData(viewYear, viewMonth);
    calBody = buildCalendar(viewYear, viewMonth, data);
    panelRef.appendChild(calBody);
    updateNavLabel();
}

function navigate(delta) {
    viewMonth += delta;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCal();
}
