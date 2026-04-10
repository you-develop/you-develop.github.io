// 메모 LocalStorage 저장/불러오기
const KEY = 'memo-content';
export function get() { return localStorage.getItem(KEY) || ''; }
export function set(text) { localStorage.setItem(KEY, text); }
