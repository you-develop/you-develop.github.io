// 앱 진입점: 모듈 초기화
import { init as initClock } from './clock.js';
import { init as initDragBlur } from './dragBlur.js';
import { init as initSpinner } from './spinner/index.js';
import { show as showPanel, hide as hidePanel, isVisible as isPanelVisible, registerModule } from './featurePanel.js';
import { toMain, toWait, getState } from './screenTransition.js';
import { mount as todoMount, unmount as todoUnmount } from './todo/index.js';
import { mount as memoMount, unmount as memoUnmount } from './memo/index.js';
import { mount as musicMount, unmount as musicUnmount } from './music/index.js';
import { mount as calendarMount, unmount as calendarUnmount } from './calendar/index.js';
import { init as initMusicPlayer, setPlaylist } from './music/player.js';
import { getItems } from './music/store.js';

// 메인 화면 전환 후 플레이어가 숨겨진 상태일 때만 초기화 (재생 상태 유지)
function goToMain() {
    toMain();
    setTimeout(() => {
        const container = document.getElementById('floatingPlayer');
        if (container.classList.contains('hidden')) {
            const items = getItems();
            if (items.length) setPlaylist(items.map(i => i.videoId));
        }
    }, 500);
}

document.addEventListener('DOMContentLoaded', async () => {
    registerModule('todo', { mount: todoMount, unmount: todoUnmount });
    registerModule('memo', { mount: memoMount, unmount: memoUnmount });
    registerModule('music', { mount: musicMount, unmount: musicUnmount });
    registerModule('calendar', { mount: calendarMount, unmount: calendarUnmount });
    initMusicPlayer();
    initClock();
    initDragBlur(goToMain);
    await initSpinner(showPanel);

    // Esc: 패널 우선 닫기, 없으면 대기 화면 전환 (역재생 포함)
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (isPanelVisible()) { hidePanel(); return; }
        if (getState() === 'wait' || getState() === 'to-wait') { goToMain(); return; }
        toWait();
    });
});
