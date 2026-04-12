// 달력용: localStorage 스캔 → 월별 메모/할일 데이터 반환
export function getMonthData(year, month) {
    // month: 0-indexed
    const pad = n => String(n).padStart(2, '0');
    const prefix = `${year}-${pad(month + 1)}-`;
    const result = {};

    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;

        if (k.startsWith('todo-') && k.slice(5, 13) === prefix.slice(0, 8)) {
            const dateStr = k.slice(5); // YYYY-MM-DD
            if (!dateStr.startsWith(prefix.slice(0, 8))) continue;
            if (!result[dateStr]) result[dateStr] = { memo: '', todos: [] };
            try { result[dateStr].todos = JSON.parse(localStorage.getItem(k)) || []; }
            catch { result[dateStr].todos = []; }
        }

        if (k.startsWith('memo-') && k.slice(5, 13) === prefix.slice(0, 8)) {
            const dateStr = k.slice(5);
            if (!dateStr.startsWith(prefix.slice(0, 8))) continue;
            if (!result[dateStr]) result[dateStr] = { memo: '', todos: [] };
            result[dateStr].memo = localStorage.getItem(k) || '';
        }
    }

    return result;
}
