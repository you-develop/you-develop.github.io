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
    }

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
