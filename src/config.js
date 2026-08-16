const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
export const API_URL = import.meta.env.VITE_API_URL || (isLocalHost ? 'http://127.0.0.1:8000' : 'https://food-q-backend.onrender.com');
