// 할 일 목록 공개 API (mount / unmount)
import * as store from './store.js';
import * as render from './render.js';
import { launch as launchConfetti } from './confetti.js';

let body = null;
let editingId = null;
let abortCtrl = null;
let iconsLoaded = false;

async function loadIcons() {
    if (iconsLoaded) return;
    const [edit, trash, confirm] = await Promise.all([
        fetch('assets/icons/edit.svg').then(r => r.text()),
        fetch('assets/icons/trash.svg').then(r => r.text()),
        fetch('assets/icons/confirm.svg').then(r => r.text()),
    ]);
    render.setIcons({ edit, trash, confirm });
    iconsLoaded = true;
}

export async function mount(panelEl) {
    unmount();
    await loadIcons();
    body = render.buildBody();
    panelEl.appendChild(body);
    refresh();

    abortCtrl = new AbortController();
    const sig = { signal: abortCtrl.signal };

    body.addEventListener('click', onBodyClick, sig);
    body.querySelector('.todo-add-btn').addEventListener('click', onAdd, sig);
    body.querySelector('.todo-add-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') onAdd();
    }, sig);
}

export function unmount() {
    if (!body) return;
    if (editingId) cancelEdit();
    abortCtrl?.abort();
    body.remove();
    body = null;
    editingId = null;
}

// refresh 전 편집 모드 해제 → DOM 재빌드로 인한 편집 상태 파괴 방지
function refresh() {
    if (editingId) cancelEdit();
    const items = store.getItems();
    render.renderList(body.querySelector('.todo-list'), items);
    const { done, total } = store.getStats();
    render.updateCounter(body, done, total);
}

function onBodyClick(e) {
    const itemEl = e.target.closest('.todo-item');
    if (!itemEl) return;
    const id = itemEl.dataset.id;

    if (e.target.closest('.todo-delete')) {
        if (editingId === id) cancelEdit();
        store.removeItem(id);
        refresh();
        return;
    }

    if (e.target.closest('.todo-edit')) {
        if (editingId === id) { confirmEdit(itemEl); return; }
        if (editingId) cancelEdit();
        const item = store.getItems().find(i => i.id === id);
        editingId = id;
        render.enterEdit(itemEl, item.text);
        return;
    }

    // 체크박스 또는 텍스트 클릭 → 토글
    if (e.target.closest('.todo-checkbox') || e.target.closest('.todo-text')) {
        if (editingId === id) return;
        const item = store.toggleItem(id);
        if (item?.done) launchConfetti(itemEl.querySelector('.todo-checkbox'));
        refresh();
    }
}

function confirmEdit(itemEl) {
    const input = itemEl.querySelector('.todo-text-edit');
    const text = input?.value.trim();
    if (text) store.updateItem(editingId, text);
    const item = store.getItems().find(i => i.id === editingId);
    render.exitEdit(itemEl, item?.text || '');
    editingId = null;
    refresh();
}

function cancelEdit() {
    const itemEl = body?.querySelector(`[data-id="${editingId}"]`);
    if (!itemEl) { editingId = null; return; }
    const item = store.getItems().find(i => i.id === editingId);
    render.exitEdit(itemEl, item?.text || '');
    editingId = null;
}

function onAdd() {
    const input = body.querySelector('.todo-add-input');
    const text = input.value.trim();
    if (!text) return;
    store.addItem(text);
    input.value = '';
    refresh();
    const list = body.querySelector('.todo-list');
    list.scrollTop = list.scrollHeight;
}
