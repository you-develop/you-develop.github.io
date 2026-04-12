// 메모 LocalStorage 저장/불러오기 (날짜별 저장)
function dateKey() { return new Date().toISOString().slice(0, 10); }

export function get() { return localStorage.getItem('memo-' + dateKey()) || ''; }
export function set(text) { localStorage.setItem('memo-' + dateKey(), text); }

// 캘린더용: 특정 날짜의 메모 조회
export function getByDate(dateStr) {
    return localStorage.getItem('memo-' + dateStr) || '';
}
