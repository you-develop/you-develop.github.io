import { getTitleEl } from '../featurePanel.js';
import { ensureUser } from './firebase.js';
import * as render from './render.js';
import * as store from './store.js';
let body;
let counter;
let user;
let stopListen;
let expiryTimer;
let abortCtrl;
export async function mount(panel) {
    unmount();
    body = render.buildBody();
    const mountedBody = body;
    counter = render.buildCounter();
    panel.appendChild(body);
    getTitleEl().appendChild(counter);
    bindEvents();
    try {
        user = await ensureUser();
        if (body !== mountedBody) return;
        await subscribe();
    } catch (error) {
        render.setStatus(body, error.message, true);
    }
}
export function unmount() {
    abortCtrl?.abort();
    stopListen?.();
    clearTimeout(expiryTimer);
    body?.remove();
    counter?.remove();
    body = counter = user = stopListen = null;
}
function bindEvents() {
    abortCtrl = new AbortController();
    const signal = abortCtrl.signal;
    body.addEventListener('click', onClick, { signal });
    body.querySelector('.thread-input').addEventListener('keydown', event => {
        if (event.key === 'Enter') add();
    }, { signal });
}
async function subscribe() {
    stopListen?.();
    const mountedBody = body;
    const stop = await store.listenThreads(items => {
        if (!body) return;
        const visible = items.filter(item => (Number(item.score) || 0) > -20);
        items.filter(item => (Number(item.score) || 0) <= -20)
            .forEach(item => store.removeThread(item.id).catch(() => {}));
        render.renderList(body.querySelector('.thread-list'), visible, user.uid);
        counter.textContent = `${visible.length} / 100`;
        clearTimeout(expiryTimer);
        const expiry = Math.min(...visible.map(item => item.expiresAt.toMillis()));
        if (Number.isFinite(expiry)) {
            expiryTimer = setTimeout(() => {
                visible.filter(item => item.expiresAt.toMillis() <= Date.now())
                    .forEach(item => store.removeThread(item.id).catch(() => {}));
                subscribe();
            }, Math.max(0, expiry - Date.now()) + 50);
        }
    }, error => render.setStatus(body, error.message, true));
    if (body === mountedBody) stopListen = stop;
    else stop();
}

async function onClick(event) {
    if (event.target.closest('.thread-add-btn')) { await add(); return; }
    const item = event.target.closest('.thread-item');
    if (!item) return;
    if (event.target.closest('.up')) await vote(item.dataset.id, 1);
    if (event.target.closest('.down')) await vote(item.dataset.id, -1);
    if (event.target.closest('.thread-text')) reveal(item);
}

async function add() {
    const input = body.querySelector('.thread-input');
    const content = input.value.trim();
    if (!content) return;
    try {
        await store.addThread(content);
        input.value = '';
        render.setStatus(body, '');
    } catch (error) {
        render.setStatus(body, error.message, true);
    }
}

async function vote(id, direction) {
    try { await store.voteThread(id, direction); }
    catch (error) { render.setStatus(body, error.message, true); }
}
function reveal(item) {
    if (!item.classList.contains('concealed')) return;
    const text = item.querySelector('.thread-text');
    text.textContent = item.dataset.content;
    text.title = item.dataset.content;
    text.setAttribute('aria-expanded', 'true');
    item.classList.remove('concealed');
}
