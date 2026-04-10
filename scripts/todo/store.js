// 할 일 데이터 LocalStorage CRUD
const KEY = 'todo-items';

function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
}

function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
}

export function getItems() {
    return load();
}

export function addItem(text) {
    const items = load();
    const item = { id: genId(), text, done: false };
    items.push(item);
    save(items);
    return item;
}

export function removeItem(id) {
    save(load().filter(i => i.id !== id));
}

export function toggleItem(id) {
    const items = load();
    const item = items.find(i => i.id === id);
    if (item) { item.done = !item.done; save(items); }
    return item;
}

export function updateItem(id, text) {
    const items = load();
    const item = items.find(i => i.id === id);
    if (item) { item.text = text; save(items); }
}

export function getStats() {
    const items = load();
    return { done: items.filter(i => i.done).length, total: items.length };
}
