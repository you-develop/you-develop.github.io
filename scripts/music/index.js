// 음악 패널 공개 API (mount / unmount)
import * as store from './store.js';
import * as render from './render.js';
import { setPlaylist, appendVideo, removeVideo, playAt } from './player.js';
import { getTitleEl } from '../featurePanel.js';

let body = null;
let counterEl = null;
let abortCtrl = null;
let iconsLoaded = false;

async function loadIcons() {
    if (iconsLoaded) return;
    const trash = await fetch('assets/icons/trash.svg').then(r => r.text());
    render.setIcons({ trash });
    iconsLoaded = true;
}

export async function mount(panelEl) {
    unmount();
    await loadIcons();
    body = render.buildBody();
    panelEl.appendChild(body);
    counterEl = render.buildCounter();
    getTitleEl().appendChild(counterEl);
    refresh();

    abortCtrl = new AbortController();
    const sig = { signal: abortCtrl.signal };
    body.querySelector('.music-add-btn').addEventListener('click', onAdd, sig);
    body.querySelector('.music-url-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') onAdd();
    }, sig);
    body.addEventListener('click', onBodyClick, sig);
}

export function unmount() {
    if (!body) return;
    abortCtrl?.abort();
    body.remove();
    counterEl?.remove();
    body = null;
    counterEl = null;
}

function refresh() {
    const items = store.getItems();
    render.renderList(body.querySelector('.music-list'), items);
    render.updateCounter(counterEl, items.length);
}

async function onAdd() {
    const input = body.querySelector('.music-url-input');
    const url = input.value.trim();
    if (!url) return;
    const wasEmpty = store.getItems().length === 0;
    const item = store.addItem(url);
    if (!item) { input.classList.add('music-url-error'); return; }
    input.classList.remove('music-url-error');
    input.value = '';

    if (wasEmpty) {
        setPlaylist([item.videoId], true);  // 첫 URL: 즉시 재생
    } else {
        appendVideo(item.videoId);          // 재생 중단 없이 끝에 추가
    }
    refresh();

    // 비동기 제목 조회 후 해당 DOM 요소만 업데이트
    const title = await store.fetchTitle(item.id);
    if (!title || !body) return;
    const titleEl = body.querySelector(`[data-id="${item.id}"] .music-item-title`);
    if (titleEl) { titleEl.textContent = title; titleEl.title = title; }
}

function onBodyClick(e) {
    const itemEl = e.target.closest('.music-item');
    if (!itemEl) return;
    if (e.target.closest('.music-delete')) {
        store.removeItem(itemEl.dataset.id);
        removeVideo(itemEl.dataset.videoId);  // 현재 곡이면 다음으로, 없으면 숨김
        refresh();
        return;
    }
    const index = store.getItems().findIndex(i => i.id === itemEl.dataset.id);
    playAt(index);
}
