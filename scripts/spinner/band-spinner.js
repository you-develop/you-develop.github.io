// 밴드 모드: 수평 배열, 드래그 스냅 선택
const BAND_ICON_SPACING = 90;

export class BandSpinner {
    constructor() {
        this.iconElements = [];
        this.iconCount = 0;
        this.selectedIndex = 0;
        this.onSelectCallback = null;
        this.bandOffset = 0;
        this.isDragging = false;
        this.lastDragX = 0;
        this.abortController = null;
        this.snapTimer = null;
    }

    init(selectedIndex, iconElements, onSelect) {
        this.iconElements = iconElements;
        this.iconCount = iconElements.length;
        this.selectedIndex = selectedIndex;
        this.onSelectCallback = onSelect;
        this.bandOffset = 0;
        this._bindEvents();
        iconElements.forEach(element => { element.style.transition = 'transform 0.5s linear, opacity 0.5s linear'; });
        this._place();
        setTimeout(() => { iconElements.forEach(element => { element.style.transition = ''; }); }, 520);
    }

    reset() {
        if (this.snapTimer) { clearTimeout(this.snapTimer); this.snapTimer = null; }
        this.abortController?.abort();
        this.abortController = null;
        this.isDragging = false;
        this.bandOffset = 0;
        this.iconElements.forEach(element => { element.classList.remove('selected'); });
    }

    _circularRelativeIndex(index) {
        const relative = ((index - this.selectedIndex) % this.iconCount + this.iconCount) % this.iconCount;
        return relative > this.iconCount / 2 ? relative - this.iconCount : relative;
    }

    _place() {
        this.iconElements.forEach((element, index) => {
            const x = this._circularRelativeIndex(index) * BAND_ICON_SPACING - this.bandOffset;
            const distance = Math.abs(x) / BAND_ICON_SPACING;
            const scale = distance < 0.15 ? 1.15 : 1;
            element.style.transform = `translate(${x}px, 0) scale(${scale})`;
            element.style.opacity = String(Math.max(0, 1 - distance / 2.2));
            element.classList.toggle('selected', distance < 0.15);
        });
    }

    _applySnap(callback) {
        this.iconElements.forEach(element => { element.style.transition = 'transform 0.3s ease, opacity 0.3s ease'; });
        requestAnimationFrame(() => requestAnimationFrame(() => {
            this.bandOffset = 0;
            this._place();
            this.snapTimer = setTimeout(() => {
                this.snapTimer = null;
                this.iconElements.forEach(element => { element.style.transition = ''; });
                callback?.();
            }, 320);
        }));
    }

    _bindEvents() {
        this.abortController?.abort();
        this.abortController = new AbortController();
        const signal = this.abortController.signal;
        document.addEventListener('mousedown', e => { if (!e.target.closest('#featurePanel')) this._onDragStart(e.clientX); }, { signal });
        document.addEventListener('mousemove', e => this._onDragMove(e.clientX), { signal });
        document.addEventListener('mouseup', () => this._onDragEnd(), { signal });
        document.addEventListener('touchstart', e => { if (!e.target.closest('#featurePanel')) this._onDragStart(e.touches[0].clientX); }, { passive: true, signal });
        document.addEventListener('touchmove', e => { if (this.isDragging) this._onDragMove(e.touches[0].clientX); }, { passive: true, signal });
        document.addEventListener('touchend', () => this._onDragEnd(), { signal });
    }

    _onDragStart(x) { this.isDragging = true; this.lastDragX = x; }

    _onDragMove(x) {
        if (!this.isDragging) return;
        this.bandOffset -= (x - this.lastDragX);
        this.lastDragX = x;
        while (this.bandOffset >= BAND_ICON_SPACING / 2) { this.bandOffset -= BAND_ICON_SPACING; this.selectedIndex = (this.selectedIndex + 1) % this.iconCount; }
        while (this.bandOffset <= -BAND_ICON_SPACING / 2) { this.bandOffset += BAND_ICON_SPACING; this.selectedIndex = ((this.selectedIndex - 1) + this.iconCount) % this.iconCount; }
        this._place();
    }

    _onDragEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this._applySnap(() => this.onSelectCallback?.(this.selectedIndex));
    }
}
