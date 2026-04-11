// 음악 URL 목록 LocalStorage 관리
const KEY = 'music-urls';

function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
}

function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

function extractVideoId(url) {
    const patterns = [
        /[?&]v=([^&]+)/,
        /youtu\.be\/([^?]+)/,
        /youtube\.com\/embed\/([^?]+)/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}

export function addItem(url) {
    const videoId = extractVideoId(url);
    if (!videoId) return null;
    const items = load();
    if (items.some(i => i.videoId === videoId)) return items.find(i => i.videoId === videoId);
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    const item = { id, videoId, url, title: videoId };
    items.push(item);
    save(items);
    return item;
}

// oEmbed로 제목 조회 후 LocalStorage 업데이트, 제목 반환
export async function fetchTitle(id) {
    const items = load();
    const item = items.find(i => i.id === id);
    if (!item) return null;
    try {
        const res = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${item.videoId}&format=json`
        );
        if (!res.ok) return null;
        const { title } = await res.json();
        item.title = title;
        save(items);
        return title;
    } catch { return null; }
}

export function removeItem(id) { save(load().filter(i => i.id !== id)); }

export function getItems() { return load(); }
