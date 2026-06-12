import { STAGES, STAGE_MS, TOTAL_MS } from './constants.js';
import * as store from './store.js';
import { show as showAlarm } from '../alarm.js';
let state = store.load();
let interval = null;
const listeners = new Set();
function persist() {
    store.save(state);
    listeners.forEach(listener => listener(snapshot()));
}
function itemProgress(active) {
    const before = STAGE_MS.slice(0, active.stageIndex).reduce((a, b) => a + b, 0);
    return Math.min(99, Math.floor((before + STAGE_MS[active.stageIndex] - active.remainingMs) / TOTAL_MS * 100));
}
function syncItem() {
    if (!state.active) return;
    const item = state.items.find(entry => entry.id === state.active.id);
    if (!item) return;
    item.progress = itemProgress(state.active);
    item.status = state.active.running ? 'running' : 'paused';
}
function advance(now, notify) {
    while (state.active?.running && now >= state.active.endAt) {
        if (state.active.stageIndex === STAGES.length - 1) {
            const item = state.items.find(entry => entry.id === state.active.id);
            if (item) Object.assign(item, { progress: 100, status: 'completed' });
            state.active = null;
            if (notify) showAlarm('포모도로가 완료되었습니다');
            return;
        }
        state.active.stageIndex++;
        state.active.remainingMs = STAGE_MS[state.active.stageIndex];
        state.active.endAt += state.active.remainingMs;
        if (notify) showAlarm(`${STAGES[state.active.stageIndex].name} 단계가 시작되었습니다`);
    }
    if (state.active?.running) state.active.remainingMs = Math.max(0, state.active.endAt - now);
    syncItem();
}
function tick() {
    if (!state.active?.running) return;
    advance(Date.now(), true);
    persist();
}
export function init() {
    advance(Date.now(), false);
    persist();
    interval = setInterval(tick, 1000);
}
export function subscribe(listener) {
    listeners.add(listener);
    listener(snapshot());
    return () => listeners.delete(listener);
}
export function snapshot() {
    return structuredClone(state);
}
export function start(label) {
    if (!state.active) {
        const item = { id: crypto.randomUUID(), label, progress: 0, status: 'paused' };
        state.items.push(item);
        state.active = { id: item.id, stageIndex: 0, remainingMs: STAGE_MS[0], running: false, endAt: null };
    }
    state.active.running = true;
    state.active.endAt = Date.now() + state.active.remainingMs;
    persist();
}
export function pause() {
    if (!state.active?.running) return;
    state.active.remainingMs = Math.max(0, state.active.endAt - Date.now());
    state.active.running = false;
    state.active.endAt = null;
    persist();
}
export function move(offset) {
    if (!state.active) return;
    const next = Math.max(0, Math.min(STAGES.length - 1, state.active.stageIndex + offset));
    state.active.stageIndex = next;
    state.active.remainingMs = STAGE_MS[next];
    if (state.active.running) state.active.endAt = Date.now() + state.active.remainingMs;
    syncItem();
    persist();
}
export function reset() {
    if (!state.active) return;
    Object.assign(state.active, { stageIndex: 0, remainingMs: STAGE_MS[0], running: false, endAt: null });
    syncItem();
    persist();
}
export function remove(id) {
    if (state.active?.id === id) state.active = null;
    state.items = state.items.filter(item => item.id !== id);
    persist();
}
