export function renderThreads(container, items) {
    container.replaceChildren(...items.map(buildRow));
    if (!items.length) {
        const empty = document.createElement('p');
        empty.className = 'admin-empty';
        empty.textContent = '저장된 방명록이 없습니다.';
        container.appendChild(empty);
    }
}

function buildRow(item) {
    const row = document.createElement('article');
    row.className = 'admin-item';
    row.dataset.id = item.id;
    const expired = item.expiresAt?.toMillis() <= Date.now();
    row.innerHTML = `
        <input type="checkbox" class="admin-check" aria-label="선택">
        <div>
            <p class="admin-content"></p>
            <small>${formatDate(item.createdAt)} · 점수 ${item.score || 0}${expired ? ' · 만료' : ''}</small>
        </div>
        <button class="item-delete">삭제</button>`;
    row.querySelector('.admin-content').textContent = item.content;
    return row;
}

export function selectedIds(container) {
    return [...container.querySelectorAll('.admin-check:checked')]
        .map(input => input.closest('.admin-item').dataset.id);
}

export function setStatus(message, error = false) {
    const status = document.getElementById('adminStatus');
    status.textContent = message;
    status.classList.toggle('error', error);
}

function formatDate(timestamp) {
    if (!timestamp?.toDate) return '시간 확인 중';
    return timestamp.toDate().toLocaleString('ko-KR');
}
