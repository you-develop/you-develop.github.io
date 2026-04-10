// 메모 기능 mount / unmount
import * as store from './store.js';
import { parse as parseMd } from './markdown.js';
import { getTitleEl } from '../featurePanel.js';

let body = null, editBtn = null, abortCtrl = null;
let editing = false, iconsLoaded = false;
let ICONS = { edit: '', confirm: '' };
// 패널 전환 시에도 보존되는 상태
let savedDraft = null;   // 미저장 편집 내용
let savedEditing = false; // 이전 편집 모드 여부

async function loadIcons() {
    if (iconsLoaded) return;
    const [e, c] = await Promise.all([
        fetch('assets/icons/edit.svg').then(r => r.text()),
        fetch('assets/icons/confirm.svg').then(r => r.text()),
    ]);
    ICONS = { edit: e, confirm: c };
    iconsLoaded = true;
}

export async function mount(panelEl) {
    unmount();
    await loadIcons();

    // 제목 행 오른쪽에 편집 버튼 추가
    editBtn = document.createElement('button');
    editBtn.className = 'memo-action-btn';
    editBtn.title = '편집';
    editBtn.innerHTML = ICONS.edit;
    getTitleEl().appendChild(editBtn);

    body = document.createElement('div');
    body.className = 'memo-body';
    body.innerHTML = `
        <textarea class="memo-textarea" placeholder="메모를 입력하세요..."></textarea>
        <div class="memo-preview"></div>`;
    panelEl.appendChild(body);

    if (savedEditing) {
        showEdit(savedDraft);
    } else {
        showView();
    }

    abortCtrl = new AbortController();
    editBtn.addEventListener('click', onEditClick, { signal: abortCtrl.signal });
}

export function unmount() {
    if (!body) return;
    // 편집 중이면 현재 내용과 모드를 보존
    if (editing) {
        savedDraft = body.querySelector('.memo-textarea').value;
        savedEditing = true;
    } else {
        savedDraft = null;
        savedEditing = false;
    }
    abortCtrl?.abort();
    editBtn?.remove();
    body.remove();
    body = null; editBtn = null; editing = false;
}

function onEditClick() {
    if (editing) {
        store.set(body.querySelector('.memo-textarea').value);
        savedDraft = null; savedEditing = false;
        showView();
    } else {
        showEdit();
    }
}

function showEdit(text) {
    editing = true;
    const textarea = body.querySelector('.memo-textarea');
    textarea.value = text !== undefined ? text : store.get();
    textarea.classList.remove('hidden');
    body.querySelector('.memo-preview').classList.add('hidden');
    editBtn.innerHTML = ICONS.confirm;
    editBtn.title = '저장';
    textarea.focus();
}

function showView() {
    editing = false;
    const text = store.get();
    const preview = body.querySelector('.memo-preview');
    preview.innerHTML = text.trim()
        ? parseMd(text)
        : '<span class="memo-empty">메모가 없습니다.</span>';
    body.querySelector('.memo-textarea').classList.add('hidden');
    preview.classList.remove('hidden');
    editBtn.innerHTML = ICONS.edit;
    editBtn.title = '편집';
}
