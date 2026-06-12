import { STAGES, STAGE_MS } from './constants.js';

const icons = {
    previous: '<svg viewBox="0 0 24 24"><path d="M19 20 9 12l10-8v16M5 19V5"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7V5Z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M9 5v14M15 5v14"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="m5 4 10 8-10 8V4M19 5v14"/></svg>',
    reset: '<svg viewBox="0 0 24 24"><path d="M4 4v6h6M20 12a8 8 0 1 1-2.34-5.66L20 8"/></svg>',
};

export function buildBody() {
    const body = document.createElement('div');
    body.className = 'pomodoro-body';
    body.innerHTML = `
        <div class="pomodoro-stages">${STAGES.map((stage, index) => `
            <span class="pomodoro-stage" title="${index + 1}. ${stage.name} ${stage.minutes}분">
                <i></i>
            </span>`).join('')}</div>
        <div class="pomodoro-player">
            <strong class="pomodoro-time">25:00</strong>
            <div class="pomodoro-controls">
                ${button('previous', '이전 단계')}
                ${button('play', '재생', 'pomodoro-toggle')}
                ${button('next', '다음 단계')}
            </div>
            ${button('reset', '리셋')}
        </div>
        <input class="pomodoro-label" maxlength="100" placeholder="포모도로 사용 목적을 입력하세요">
        <p class="pomodoro-error"></p>
        <div class="pomodoro-list"></div>`;
    return body;
}

function button(name, title, extra = '') {
    return `<button class="pomodoro-button pomodoro-${name} ${extra}" title="${title}">${icons[name]}</button>`;
}

export function update(body, state, trashSvg) {
    const active = state.active;
    const stageIndex = active?.stageIndex ?? 0;
    const remaining = active?.remainingMs ?? STAGE_MS[0];
    body.querySelector('.pomodoro-time').textContent = formatTime(remaining);
    body.querySelector('.pomodoro-toggle').innerHTML = active?.running ? icons.pause : icons.play;
    body.querySelector('.pomodoro-toggle').title = active?.running ? '일시정지' : '재생';
    const input = body.querySelector('.pomodoro-label');
    const item = state.items.find(entry => entry.id === active?.id);
    input.disabled = Boolean(active);
    if (item && input.value !== item.label) input.value = item.label;
    if (!active && input.disabled === false && state.items.every(entry => entry.status === 'completed')) input.value = '';
    updateStages(body, stageIndex, remaining, active);
    renderList(body.querySelector('.pomodoro-list'), state.items, active?.id, trashSvg);
}

function updateStages(body, stageIndex, remaining, active) {
    body.querySelectorAll('.pomodoro-stage').forEach((bar, index) => {
        const fill = index < stageIndex ? 100 : index === stageIndex && active
            ? (1 - remaining / STAGE_MS[index]) * 100 : 0;
        bar.classList.toggle('current', Boolean(active) && index === stageIndex);
        bar.querySelector('i').style.width = `${Math.max(0, Math.min(100, fill))}%`;
    });
}

function renderList(list, items, activeId, trashSvg) {
    list.innerHTML = items.map(item => `
        <div class="pomodoro-item ${item.id === activeId ? 'active' : ''}" data-id="${item.id}">
            <span title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</span>
            <b>${item.progress}%</b>
            <button class="pomodoro-delete" title="제거">${trashSvg}</button>
        </div>`).join('');
}

function formatTime(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function escapeHtml(value) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
