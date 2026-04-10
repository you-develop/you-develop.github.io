// 앱 진입점: 모듈 초기화
import { init as initClock } from './clock.js';
import { init as initDragBlur } from './dragBlur.js';
import { init as initSpinner } from './spinner/index.js';
import { show as showPanel, hide as hidePanel, isVisible as isPanelVisible, registerModule } from './featurePanel.js';
import { toMain, toWait, getState } from './screenTransition.js';
import { mount as todoMount, unmount as todoUnmount } from './todo/index.js';

document.addEventListener('DOMContentLoaded', async () => {
    registerModule('todo', { mount: todoMount, unmount: todoUnmount });
    initClock();
    initDragBlur(toMain);
    await initSpinner(showPanel);

    // Esc: 패널 우선 닫기, 없으면 대기 화면 전환 (역재생 포함)
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (isPanelVisible()) { hidePanel(); return; }
        if (getState() === 'wait' || getState() === 'to-wait') { toMain(); return; }
        toWait();
    });
});
