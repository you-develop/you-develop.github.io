// 모듈화된 코드
const ClockApp = (function () {
    // 프라이빗 변수
    let lastHour = -1;
    let alarmEnabled = false;
    let alarmSoundInterval;

    // DOM 요소
    const elements = {
        date: document.getElementById('date'),
        time: document.getElementById('time'),
        background: document.getElementById('background'),
        alarmToggle: document.getElementById('alarmToggle'),
        bellOn: document.getElementById('bellOn'),
        bellOff: document.getElementById('bellOff'),
        alarmMessage: document.getElementById('alarmMessage'),
        progressBar: document.getElementById('alarmProgressBar'),
        alarmSound: document.getElementById('alarmSound')
    };

    // 상수
    const ALARM_DISPLAY_DURATION = 10000; // 10초

    // 알람 소리 재생 함수
    function playAlarmSound() {
        elements.alarmSound.pause();
        elements.alarmSound.currentTime = 0;

        try {
            elements.alarmSound.play().catch(error => {
                console.log('자동 재생이 차단되었습니다. 사용자 상호작용이 필요합니다.', error);
            });
        } catch (e) {
            console.log('알람 소리 재생 중 오류 발생:', e);
        }
    }

    // 알람 소리 반복 재생 시작 함수
    function startRepeatingAlarm() {
        stopRepeatingAlarm();
        playAlarmSound();
        alarmSoundInterval = setInterval(playAlarmSound, 2000);
    }

    // 알람 소리 반복 재생 중지 함수
    function stopRepeatingAlarm() {
        if (alarmSoundInterval) {
            clearInterval(alarmSoundInterval);
            alarmSoundInterval = null;
            elements.alarmSound.pause();
            elements.alarmSound.currentTime = 0;
        }
    }

    // 알람 트리거 함수
    function triggerAlarm() {
        // 애니메이션 클래스 추가
        elements.background.classList.add('flash');

        // 알람 소리 반복 재생 시작
        startRepeatingAlarm();

        // 알람 메시지 표시
        elements.alarmMessage.classList.remove('hidden');

        // 진행 막대 초기화
        elements.progressBar.style.width = '100%';

        // 조금 지연 후 애니메이션 효과 적용
        setTimeout(() => {
            elements.alarmMessage.classList.add('show');
        }, 100);

        // 배경 깜빡임 완료 후 클래스 제거
        setTimeout(() => {
            elements.background.classList.remove('flash');
        }, 1500);

        // 진행 막대 애니메이션
        const startTime = Date.now();
        const progressInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const remainingPercent = 100 - (elapsedTime / ALARM_DISPLAY_DURATION * 100);

            if (remainingPercent <= 0) {
                clearInterval(progressInterval);
                elements.progressBar.style.width = '0%';
            } else {
                elements.progressBar.style.width = remainingPercent + '%';
            }
        }, 50);

        // 알람 메시지 숨기기
        setTimeout(() => {
            clearInterval(progressInterval);
            stopRepeatingAlarm();
            elements.alarmMessage.classList.remove('show');
            elements.alarmMessage.classList.remove('sound-muted');

            setTimeout(() => {
                elements.alarmMessage.classList.add('hidden');
            }, 500);
        }, ALARM_DISPLAY_DURATION);
    }

    // 시간 업데이트 함수
    function updateDateTime() {
        const now = new Date();

        // 날짜 표시
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const dateString = now.toLocaleDateString('ko-KR', options);
        elements.date.textContent = dateString;

        // 시간 표시
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        elements.time.textContent = `${hours}:${minutes}:${seconds}`;

        // 1시간마다 알람 (분, 초가 00:00일 때)
        if (alarmEnabled && minutes === '00' && seconds === '00' && lastHour !== hours) {
            triggerAlarm();
            lastHour = hours;
        }
    }

    // 알람 토글 함수
    function toggleAlarm() {
        alarmEnabled = !alarmEnabled;

        if (alarmEnabled) {
            elements.bellOff.classList.add('hidden');
            elements.bellOn.classList.remove('hidden');
            elements.alarmToggle.classList.add('active');

            lastHour = new Date().getHours();

            // 알람 활성화 시 사용자 상호작용으로 오디오 재생 권한 얻기
            elements.alarmSound.volume = 0.1;
            elements.alarmSound.play().then(() => {
                setTimeout(() => {
                    elements.alarmSound.pause();
                    elements.alarmSound.currentTime = 0;
                    elements.alarmSound.volume = 1.0;
                }, 100);
            }).catch(e => {
                console.log('알람 초기화 중 오류:', e);
            });
        } else {
            elements.bellOn.classList.add('hidden');
            elements.bellOff.classList.remove('hidden');
            elements.alarmToggle.classList.remove('active');
        }
    }

    // 이벤트 리스너 설정
    function setupEventListeners() {
        // 알람 토글 버튼 클릭
        elements.alarmToggle.addEventListener('click', toggleAlarm);

        // 알람 메시지 클릭 (소리 중지)
        elements.alarmMessage.addEventListener('click', function () {
            stopRepeatingAlarm();
            this.classList.add('sound-muted');
        });

        // 페이지 로드 시 오디오 요소 준비
        window.addEventListener('load', function () {
            document.body.addEventListener('click', function () {
                if (alarmEnabled && elements.alarmSound.paused) {
                    elements.alarmSound.load();
                }
            }, { once: true });
        });
    }

    // 초기화 함수
    function init() {
        updateDateTime();
        setInterval(updateDateTime, 1000);
        setupEventListeners();
    }

    // 퍼블릭 API
    return {
        init: init,
        triggerAlarm: triggerAlarm
    };
})();

// 앱 시작
document.addEventListener('DOMContentLoaded', ClockApp.init);