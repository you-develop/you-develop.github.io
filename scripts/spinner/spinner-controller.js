// 스피너 상태 관리: 궤도 ↔ 밴드 전환
import { OrbitSpinner } from './orbit-spinner.js';
import { BandSpinner } from './band-spinner.js';

export class SpinnerController {
    constructor(spinnerElement, mainElement) {
        this.spinnerElement = spinnerElement;
        this.orbitSpinner = new OrbitSpinner(mainElement);
        this.bandSpinner = new BandSpinner();
        this.iconElements = [];
        this.icons = [];
        this.isSelecting = false;
        this.onIconSelectedCallback = null;
        this.selectTimer = null;
        this._fadeRAF = null;
    }

    setFade(value) {
        if (this._fadeRAF) { cancelAnimationFrame(this._fadeRAF); this._fadeRAF = null; }
        this.orbitSpinner.fadeFactor = value;
    }

    animateFade(target, duration) {
        if (this._fadeRAF) { cancelAnimationFrame(this._fadeRAF); this._fadeRAF = null; }
        const from = this.orbitSpinner.fadeFactor;
        const startTime = performance.now();
        const step = () => {
            const t = Math.min((performance.now() - startTime) / duration, 1);
            this.orbitSpinner.fadeFactor = from + (target - from) * t;
            if (t < 1) this._fadeRAF = requestAnimationFrame(step);
            else this._fadeRAF = null;
        };
        this._fadeRAF = requestAnimationFrame(step);
    }

    get fadeFactor() { return this.orbitSpinner.fadeFactor; }

    async initialize(icons, onIconSelected) {
        this.icons = icons;
        this.onIconSelectedCallback = onIconSelected;
        this.iconElements = await Promise.all(icons.map(icon => this._buildIconElement(icon)));
        this.iconElements.forEach((element, index) => {
            element.addEventListener('click', () => this._onIconClick(index));
            this.spinnerElement.appendChild(element);
        });
        this.orbitSpinner.setElements(this.iconElements);
    }

    reset() {
        if (this.selectTimer) { clearTimeout(this.selectTimer); this.selectTimer = null; }
        this.isSelecting = false;
        this.bandSpinner.reset();
        this.iconElements.forEach(element => { element.style.transition = 'transform 0.4s ease, opacity 0.4s ease'; });
        this.orbitSpinner.resume();
        setTimeout(() => { this.iconElements.forEach(element => { element.style.transition = ''; }); }, 420);
        document.getElementById('spinnerContainer').classList.remove('selecting');
    }

    async _buildIconElement(icon) {
        const element = document.createElement('div');
        element.className = 'icon-item';
        const response = await fetch(`assets/icons/${icon.id}.svg`);
        element.innerHTML = await response.text();
        return element;
    }

    _onIconClick(index) {
        if (this.isSelecting || this.orbitSpinner.hasDragMoved) return;
        this.isSelecting = true;
        this.orbitSpinner.isInteractable = false;
        const targetAngle = 90 + (index / this.icons.length) * 360;
        this.orbitSpinner.animateTo(targetAngle, () => {
            this.orbitSpinner.pause();
            document.getElementById('spinnerContainer').classList.add('selecting');
            this.bandSpinner.init(index, this.iconElements, selectedIndex => {
                this.onIconSelectedCallback?.(this.icons[selectedIndex]);
            });
            this.onIconSelectedCallback?.(this.icons[index]);
        });
    }
}
