export function buildBody() {
    const body = document.createElement('div');
    body.className = 'thread-body';
    body.innerHTML = `
        <div class="thread-add-row">
            <input class="thread-input" maxlength="100" placeholder="방명록 남기기...">
            <button class="thread-add-btn">추가</button>
        </div>
        <p class="thread-status" aria-live="polite"></p>
        <div class="thread-list"></div>`;
    return body;
}

export function buildCounter() {
    const counter = document.createElement('span');
    counter.className = 'thread-counter';
    counter.textContent = '0 / 100';
    return counter;
}

export function renderList(list, items, uid) {
    list.replaceChildren(...items.map(item => buildItem(item, uid)));
    if (!items.length) {
        const empty = document.createElement('p');
        empty.className = 'thread-empty';
        empty.textContent = '아직 작성된 방명록이 없습니다.';
        list.appendChild(empty);
    }
}

function buildItem(item, uid) {
    const score = Number(item.score) || 0;
    const hidden = score <= -10;
    const ownVote = item.votes?.[uid] || 0;
    const row = document.createElement('div');
    row.className = `thread-item${score <= -5 ? ' muted' : ''}${hidden ? ' concealed' : ''}`;
    row.dataset.id = item.id;
    const title = hidden ? '낮은 평가로 숨겨진 내용' : item.content;
    row.innerHTML = `
        <button class="thread-text" title="${escapeHtml(title)}"
            aria-expanded="${!hidden}">${hidden ? '클릭하여 내용 보기' : escapeHtml(item.content)}</button>
        <span class="thread-score">${score}</span>
        <button class="thread-vote up${ownVote === 1 ? ' selected' : ''}" title="추천">+1</button>
        <button class="thread-vote down${ownVote === -1 ? ' selected' : ''}" title="비추천">-1</button>`;
    if (hidden) row.dataset.content = item.content;
    return row;
}

export function setStatus(body, message, error = false) {
    const status = body?.querySelector('.thread-status');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('error', error);
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
    ));
}
