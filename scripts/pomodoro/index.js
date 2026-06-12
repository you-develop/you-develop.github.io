import * as timer from './timer.js';
import * as render from './render.js';
import { unlock } from '../alarm.js';

let body = null;
let unsubscribe = null;
let abortCtrl = null;
let trashSvg = '';

export async function mount(panel) {
    unmount();
    if (!trashSvg) trashSvg = await fetch('assets/icons/trash.svg').then(response => response.text());
    body = render.buildBody();
    panel.appendChild(body);
    abortCtrl = new AbortController();
    body.addEventListener('click', onClick, { signal: abortCtrl.signal });
    body.querySelector('.pomodoro-label').addEventListener('keydown', event => {
        if (event.key === 'Enter') toggle();
    }, { signal: abortCtrl.signal });
    unsubscribe = timer.subscribe(state => body && render.update(body, state, trashSvg));
}

export function unmount() {
    abortCtrl?.abort();
    unsubscribe?.();
    body?.remove();
    body = null;
    unsubscribe = null;
}

function onClick(event) {
    if (event.target.closest('.pomodoro-toggle')) { toggle(); return; }
    if (event.target.closest('.pomodoro-previous')) { timer.move(-1); return; }
    if (event.target.closest('.pomodoro-next')) { timer.move(1); return; }
    if (event.target.closest('.pomodoro-reset')) { timer.reset(); return; }
    const deleteButton = event.target.closest('.pomodoro-delete');
    if (deleteButton) timer.remove(deleteButton.closest('.pomodoro-item').dataset.id);
}

function toggle() {
    const state = timer.snapshot();
    if (state.active?.running) { timer.pause(); return; }
    const input = body.querySelector('.pomodoro-label');
    const label = input.value.trim();
    const error = body.querySelector('.pomodoro-error');
    if (!state.active && !label) {
        error.textContent = '사용 목적을 입력하세요.';
        input.focus();
        return;
    }
    error.textContent = '';
    unlock();
    timer.start(label);
}

export { init } from './timer.js';
