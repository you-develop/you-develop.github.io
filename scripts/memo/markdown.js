// 간단한 마크다운 → HTML 파서
export function parse(text) {
    if (!text.trim()) return '';
    const lines = text.split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const hm = line.match(/^(#{1,6})\s+(.+)/);
        if (hm) {
            out.push(`<h${hm[1].length}>${inline(hm[2])}</h${hm[1].length}>`);
            i++; continue;
        }
        if (/^[-*_]{3,}$/.test(line.trim())) {
            out.push('<hr>'); i++; continue;
        }
        if (line.startsWith('> ')) {
            out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
            i++; continue;
        }
        if (/^[-*+]\s/.test(line)) {
            const items = [];
            while (i < lines.length && /^[-*+]\s/.test(lines[i]))
                items.push(`<li>${inline(lines[i++].slice(2))}</li>`);
            out.push(`<ul>${items.join('')}</ul>`); continue;
        }
        if (/^\d+\.\s/.test(line)) {
            const items = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i]))
                items.push(`<li>${inline(lines[i++].replace(/^\d+\.\s/, ''))}</li>`);
            out.push(`<ol>${items.join('')}</ol>`); continue;
        }
        if (line.trim() === '') { i++; continue; }
        // 일반 단락: 연속된 일반 행 묶기
        const para = [];
        while (i < lines.length && lines[i].trim() !== '' &&
            !/^#{1,6}\s/.test(lines[i]) && !/^[-*+]\s/.test(lines[i]) &&
            !/^\d+\.\s/.test(lines[i]) && !/^[-*_]{3,}$/.test(lines[i].trim()) &&
            !lines[i].startsWith('> ')) {
            para.push(inline(lines[i])); i++;
        }
        if (para.length) out.push(`<p>${para.join('<br>')}</p>`);
    }
    return out.join('\n');
}

function inline(text) {
    let s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    s = s.replace(/_(.+?)_/g, '<em>$1</em>');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s;
}
