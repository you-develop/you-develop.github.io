// 앱 진입점: 모듈 초기화
import { init as initClock } from './clock.js';
import { init as initAlarm, onTick } from './alarm.js';
import { init as initThread } from './thread.js';

document.addEventListener('DOMContentLoaded', () => {
    initClock(onTick);
    initAlarm();
    initThread();
});
