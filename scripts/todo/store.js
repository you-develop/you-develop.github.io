// 할 일 데이터 LocalStorage CRUD (날짜별 저장)
function dateKey() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function key() { return 'todo-' + dateKey(); }

function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function load() {
    try { return JSON.parse(localStorage.getItem(key())) || []; }
    catch { return []; }
}

function save(items) {
    localStorage.setItem(key(), JSON.stringify(items));
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

// 캘린더용: 특정 날짜의 할일 조회
export function getItemsByDate(dateStr) {
    try { return JSON.parse(localStorage.getItem('todo-' + dateStr)) || []; }
    catch { return []; }
}
