// 음악 패널 DOM 빌드
let trashSvg = '';

export function setIcons({ trash }) { trashSvg = trash; }

export function buildBody() {
    const body = document.createElement('div');
    body.className = 'music-body';
    body.innerHTML = `
        <div class="music-input-group">
            <input class="music-url-input" type="text" placeholder="YouTube URL 붙여넣기" />
            <button class="music-add-btn">추가</button>
        </div>
        <div class="music-list"></div>
        <div class="music-counter">0곡</div>
    `;
    return body;
}

export function renderList(listEl, items) {
    listEl.innerHTML = '';
    items.forEach(item => listEl.appendChild(buildItem(item)));
}

function buildItem(item) {
    const el = document.createElement('div');
    el.className = 'music-item';
    el.dataset.id = item.id;
    el.dataset.videoId = item.videoId;
    el.innerHTML = `
        <span class="music-item-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</span>
        <button class="music-delete" title="삭제">${trashSvg}</button>
    `;
    return el;
}

export function updateCounter(bodyEl, count) {
    bodyEl.querySelector('.music-counter').textContent = `${count}곡`;
}

function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
