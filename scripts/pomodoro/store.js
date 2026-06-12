const KEY = 'pomodoro-state';

const emptyState = () => ({ items: [], active: null });

export function load() {
    try {
        const state = JSON.parse(localStorage.getItem(KEY));
        return state?.items && 'active' in state ? state : emptyState();
    } catch {
        return emptyState();
    }
}

export function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
}
