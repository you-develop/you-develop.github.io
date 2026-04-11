// 플로팅 YouTube 플레이어 (JS 직접 관리 플레이리스트)
let player = null;
let playlist = [];   // JS로 직접 관리
let currentIndex = 0;
let pending = null;  // { autoplay } — onReady 전 보류

const apiReadyPromise = new Promise(resolve => {
    if (window.YT && window.YT.Player) { resolve(); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(); };
});

export async function init() {
    await apiReadyPromise;
    const container = document.getElementById('floatingPlayer');
    const div = document.createElement('div');
    container.appendChild(div);
    player = new YT.Player(div, {
        width: '100%', height: '100%',
        playerVars: { autoplay: 0, controls: 1, rel: 0 },
        events: {
            onReady: () => {
                if (pending !== null) { _playCurrent(pending.autoplay); pending = null; }
            },
            onStateChange: ({ data }) => {
                // 현재 곡 끝나면 다음 곡 재생 (마지막이면 처음으로)
                if (data === YT.PlayerState.ENDED && playlist.length) {
                    currentIndex = (currentIndex + 1) % playlist.length;
                    player.loadVideoById(playlist[currentIndex]);
                }
            },
        },
    });
}

function _playCurrent(autoplay) {
    if (!playlist.length) return;
    if (autoplay) player.loadVideoById(playlist[currentIndex]);
    else player.cueVideoById(playlist[currentIndex]);
}

// 플레이리스트 전체 교체 (페이지 로드 또는 첫 URL 추가)
export function setPlaylist(videoIds, autoplay = false) {
    playlist = [...videoIds];
    currentIndex = 0;
    if (!playlist.length) { stopAndHide(); return; }
    document.getElementById('floatingPlayer').classList.remove('hidden');
    if (!player || typeof player.cueVideoById !== 'function') {
        pending = { autoplay };
        return;
    }
    _playCurrent(autoplay);
}

// 재생 중단 없이 플레이리스트 끝에 추가
export function appendVideo(videoId) {
    playlist.push(videoId);
    document.getElementById('floatingPlayer').classList.remove('hidden');
}

// 항목 제거. 현재 재생 중 항목이면 다음 곡으로 (없으면 숨김)
export function removeVideo(videoId) {
    const idx = playlist.indexOf(videoId);
    if (idx === -1) return;
    const isCurrent = idx === currentIndex;
    const playing = isPlaying();
    playlist.splice(idx, 1);
    if (!playlist.length) { stopAndHide(); return; }
    if (idx < currentIndex) { currentIndex--; return; }
    if (isCurrent) {
        if (currentIndex >= playlist.length) currentIndex = 0;
        if (playing) player.loadVideoById(playlist[currentIndex]);
    }
}

export function isPlaying() {
    try { return player?.getPlayerState() === YT.PlayerState.PLAYING; }
    catch { return false; }
}

export function stopAndHide() {
    document.getElementById('floatingPlayer').classList.add('hidden');
    try { player?.stopVideo(); } catch { /* ignore */ }
    pending = null;
}

// 플레이리스트 내 특정 인덱스 영상 재생
export function playAt(index) {
    if (index < 0 || index >= playlist.length) return;
    currentIndex = index;
    player?.loadVideoById(playlist[currentIndex]);
}
