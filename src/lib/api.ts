import axios from 'axios';
import { get } from 'svelte/store';
import { token } from '$lib/stores/auth';

function sanitize(raw: unknown): string | null {
    if (typeof raw !== 'string') 
        return null;

    const v = raw.trim();

    if (!v || v === 'undefined' || v === 'null') 
        return null;
    
    return v;
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const t = sanitize(get(token) as unknown as string);

    if (t) 
        config.headers.Authorization = `Bearer ${t}`;
    else 
        delete config.headers.Authorization;

    return config;
});

export default api;