// 할 일 목록 DOM 렌더링
let ICONS = { edit: '', trash: '', confirm: '' };

export function setIcons(icons) {
    ICONS = icons;
}

export function buildBody() {
    const div = document.createElement('div');
    div.className = 'todo-body';
    div.innerHTML = `
        <div class="todo-add-row">
            <input class="todo-add-input" placeholder="새 항목 추가..." maxlength="100">
            <button class="todo-add-btn">추가</button>
        </div>
        <div class="todo-list"></div>`;
    return div;
}

export function buildCounter() {
    const span = document.createElement('span');
    span.className = 'todo-counter';
    span.textContent = '0 / 0';
    return span;
}

export function buildItem(item) {
    const div = document.createElement('div');
    div.className = 'todo-item' + (item.done ? ' done' : '');
    div.dataset.id = item.id;
    div.innerHTML = `
        <input type="checkbox" class="todo-checkbox"${item.done ? ' checked' : ''}>
        <span class="todo-text" title="${escHtml(item.text)}">${escHtml(item.text)}</span>
        <button class="todo-btn todo-edit" title="편집">${ICONS.edit}</button>
        <button class="todo-btn todo-delete" title="삭제">${ICONS.trash}</button>`;
    return div;
}

export function renderList(listEl, items) {
    listEl.innerHTML = '';
    items.forEach(item => listEl.appendChild(buildItem(item)));
}

export function updateCounter(counterEl, done, total) {
    if (counterEl) counterEl.textContent = `${done} / ${total}`;
}

export function enterEdit(itemEl, text) {
    const span = itemEl.querySelector('.todo-text');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-text-edit';
    input.value = text;
    input.maxLength = 100;
    span.replaceWith(input);
    const editBtn = itemEl.querySelector('.todo-edit');
    editBtn.innerHTML = ICONS.confirm;
    editBtn.title = '승인';
    input.focus();
    input.select();
}

export function exitEdit(itemEl, text) {
    const input = itemEl.querySelector('.todo-text-edit');
    if (!input) return;
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.title = text;
    span.textContent = text;
    input.replaceWith(span);
    const editBtn = itemEl.querySelector('.todo-edit');
    editBtn.innerHTML = ICONS.edit;
    editBtn.title = '편집';
}

function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
