// 스피너 공개 API
import { ICONS } from './icons.js';
import { SpinnerController } from './spinner-controller.js';

let controller = null;

export async function init(onIconSelected) {
    const spinnerElement = document.getElementById('spinner');
    const mainElement = document.getElementById('mainScreen');
    controller = new SpinnerController(spinnerElement, mainElement);
    await controller.initialize(ICONS, onIconSelected);
}

export function reset() {
    controller?.reset();
}
