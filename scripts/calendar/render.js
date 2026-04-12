// 달력 DOM 빌드
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const today = new Date();
const todayStr = today.toISOString().slice(0, 10);

function pad(n) { return String(n).padStart(2, '0'); }

function buildTag(cls, label, tooltip) {
    const span = document.createElement('span');
    span.className = `cal-tag cal-tag--${cls}`;
    span.textContent = label;
    if (tooltip) span.dataset.tooltip = tooltip;
    return span;
}

function buildTodoTag(todos) {
    const total = todos.length;
    const done = todos.filter(t => t.done).length;
    const allDone = done === total;
    const lines = todos.map(t => (t.done ? '✓ ' : '○ ') + t.text).join('\n');

    const span = document.createElement('span');
    span.className = `cal-tag cal-tag--todo${allDone ? ' cal-tag--done' : ''}`;
    span.dataset.tooltip = lines;

    const label = document.createElement('span');
    label.className = 'cal-tag-label';
    label.textContent = '할일';
    span.appendChild(label);

    const bar = document.createElement('span');
    bar.className = 'cal-tag-bar';
    const fill = document.createElement('span');
    fill.className = 'cal-tag-bar-fill';
    fill.style.width = `${(done / total) * 100}%`;
    bar.appendChild(fill);
    span.appendChild(bar);

    return span;
}

function buildDayCell(year, month, day, data) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
    const cell = document.createElement('div');
    cell.className = 'cal-day';
    if (dateStr === todayStr) cell.classList.add('today');

    const num = document.createElement('span');
    num.className = 'cal-day-num';
    num.textContent = day;
    cell.appendChild(num);

    const entry = data[dateStr];
    if (!entry) return cell;

    const hasMemo = !!entry.memo.trim();
    const hasTodos = entry.todos.length > 0;
    const allTodosDone = hasTodos && entry.todos.every(t => t.done);

    // 메모 + 할일 모두 완료 시 특수 효과
    if (hasMemo && allTodosDone) cell.classList.add('cal-day--perfect');

    const tags = document.createElement('div');
    tags.className = 'cal-tags';

    if (hasMemo) {
        const preview = entry.memo.trim().slice(0, 80) + (entry.memo.trim().length > 80 ? '…' : '');
        tags.appendChild(buildTag('memo', '메모', preview));
    }

    if (hasTodos) {
        tags.appendChild(buildTodoTag(entry.todos));
    }

    cell.appendChild(tags);
    return cell;
}

export function buildCalendar(year, month, data) {
    const wrap = document.createElement('div');
    wrap.className = 'cal-body';

    // 요일 헤더
    const header = document.createElement('div');
    header.className = 'cal-grid cal-header';
    DAYS.forEach(d => {
        const h = document.createElement('div');
        h.className = 'cal-head';
        h.textContent = d;
        header.appendChild(h);
    });
    wrap.appendChild(header);

    // 날짜 그리드
    const grid = document.createElement('div');
    grid.className = 'cal-grid';

    const firstDay = new Date(year, month, 1).getDay(); // 0=일
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 앞쪽 빈 셀
    for (let i = 0; i < firstDay; i++) {
        grid.appendChild(document.createElement('div'));
    }

    // 날짜 셀
    for (let d = 1; d <= daysInMonth; d++) {
        grid.appendChild(buildDayCell(year, month, d, data));
    }

    wrap.appendChild(grid);
    return wrap;
}
