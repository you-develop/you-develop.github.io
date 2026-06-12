import * as auth from './auth.js';
import * as render from './render.js';
import * as store from './store.js';

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const panel = document.getElementById('adminPanel');
const list = document.getElementById('threadList');
let stopListen;

loginBtn.addEventListener('click', async () => {
    try { await auth.login(); }
    catch (error) { render.setStatus(error.message, true); }
});

logoutBtn.addEventListener('click', () => auth.logout());

panel.addEventListener('click', async event => {
    try {
        const item = event.target.closest('.admin-item');
        if (event.target.closest('.item-delete')) await store.removeOne(item.dataset.id);
        if (event.target.id === 'deleteSelected') await deleteSelected();
        if (event.target.id === 'deleteExpired') {
            const count = await store.removeExpired();
            render.setStatus(`만료 방명록 ${count}개 삭제`);
        }
        if (event.target.id === 'deleteAll') await deleteAll();
    } catch (error) {
        render.setStatus(error.message, true);
    }
});

try {
    auth.watchAuth(user => {
        stopListen?.();
        const admin = auth.isAdmin(user);
        loginBtn.hidden = Boolean(user && !user.isAnonymous);
        logoutBtn.hidden = !user || user.isAnonymous;
        panel.hidden = !admin;
        if (!user) { render.setStatus('Google 계정으로 로그인하세요.'); return; }
        if (!admin) {
            render.setStatus(`관리자 UID가 아닙니다: ${user.uid}`, true);
            return;
        }
        render.setStatus(`${user.email} 로그인`);
        stopListen = store.listenAll(
            items => render.renderThreads(list, items),
            error => render.setStatus(error.message, true),
        );
    });
} catch (error) {
    render.setStatus(error.message, true);
}

async function deleteSelected() {
    const ids = render.selectedIds(list);
    if (!ids.length) return;
    await store.removeIds(ids);
    render.setStatus(`선택 방명록 ${ids.length}개 삭제`);
}

async function deleteAll() {
    if (!confirm('모든 방명록을 삭제하시겠습니까?')) return;
    const count = await store.removeAll();
    render.setStatus(`전체 방명록 ${count}개 삭제`);
}
