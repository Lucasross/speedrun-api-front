import { writable, derived } from 'svelte/store';

function sanitizeToken(raw: unknown): string | null {
    if (typeof raw !== 'string') return null;
    const v = raw.trim();
    if (!v || v === 'undefined' || v === 'null') return null;
    return v;
}

export const token = writable<string | null>(null);

// booléen fiable pour l’UI
export const isAuthenticated = derived(token, ($t) => sanitizeToken($t) !== null);

export function setAuth(newToken: unknown) {
    const safe = sanitizeToken(typeof newToken === 'string' ? newToken : String(newToken));
    if (!safe) return clearAuth();
    token.set(safe);
    localStorage.setItem('token', safe);
}

export function loadAuthFromStorage() {
    const safe = sanitizeToken(localStorage.getItem('token'));
    token.set(safe);
}

export function clearAuth() {
    token.set(null);
    localStorage.removeItem('token');
}