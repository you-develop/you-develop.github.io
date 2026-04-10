// 타원 궤도 애니메이션: 아이콘 배치, 드래그 회전
const ORBIT_RADIUS_X = 170;
const ORBIT_RADIUS_Y = 60;

export class OrbitSpinner {
    constructor(mainElement) {
        this.mainElement = mainElement;
        this.iconElements = [];
        this.angle = 90;
        this.fadeFactor = 1; // 화면 전환용 페이드 배율 (0~1)
        this.isDragging = false;
        this.dragStartX = 0;
        this.angleAtDragStart = 0;
        this.hasDragMoved = false;
        this.isPlacingActive = true;
        this.isInteractable = true;
        this._tick = this._tick.bind(this);
    }

    get radiusY() { return ORBIT_RADIUS_Y; }
    get iconCount() { return this.iconElements.length; }

    setElements(iconElements) {
        this.iconElements = iconElements;
        this._bindDragEvents();
        requestAnimationFrame(this._tick);
    }

    animateTo(targetAngle, callback) {
        const startAngle = this.angle;
        const delta = ((targetAngle - this.angle) % 360 + 540) % 360 - 180;
        const duration = Math.max(120, Math.abs(delta) / 180 * 500);
        const startTime = performance.now();
        const step = () => {
            const progress = Math.min((performance.now() - startTime) / duration, 1);
            const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            this.angle = startAngle + delta * eased;
            if (progress < 1) requestAnimationFrame(step); else callback?.();
        };
        requestAnimationFrame(step);
    }

    pause() { this.isPlacingActive = false; this.isInteractable = false; }
    resume() { this.isPlacingActive = true; this.isInteractable = true; }

    _tick() {
        if (this.isPlacingActive) this._placeIcons();
        requestAnimationFrame(this._tick);
    }

    _placeIcons() {
        this.iconElements.forEach((element, index) => {
            const radians = (this.angle - (index / this.iconCount) * 360) * Math.PI / 180;
            const x = ORBIT_RADIUS_X * Math.cos(radians);
            const y = ORBIT_RADIUS_Y * Math.sin(radians);
            const normalized = (y / ORBIT_RADIUS_Y + 1) / 2;
            element.style.transform = `translate(${x}px, ${y}px) scale(${0.65 + 0.35 * normalized})`;
            element.style.zIndex = Math.round(y + ORBIT_RADIUS_Y);
            element.style.opacity = String((0.5 + 0.5 * normalized) * this.fadeFactor);
        });
    }

    _bindDragEvents() {
        this.mainElement.addEventListener('mousedown', e => this._onDragStart(e.clientX));
        document.addEventListener('mousemove', e => this._onDragMove(e.clientX));
        document.addEventListener('mouseup', () => this._onDragEnd());
        this.mainElement.addEventListener('touchstart', e => this._onDragStart(e.touches[0].clientX), { passive: true });
        document.addEventListener('touchmove', e => { if (this.isDragging) this._onDragMove(e.touches[0].clientX); }, { passive: true });
        document.addEventListener('touchend', () => this._onDragEnd());
    }

    _onDragStart(x) {
        if (!this.isInteractable) return;
        this.isDragging = true;
        this.dragStartX = x;
        this.angleAtDragStart = this.angle;
        this.hasDragMoved = false;
    }

    _onDragMove(x) {
        if (!this.isDragging) return;
        if (Math.abs(x - this.dragStartX) > 5) this.hasDragMoved = true;
        this.angle = this.angleAtDragStart - (x - this.dragStartX) * 0.25;
    }

    _onDragEnd() { this.isDragging = false; }
}
