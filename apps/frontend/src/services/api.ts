import axios, { type AxiosError } from 'axios';

// ─── Axios instance ────────────────────────────────────────────
// In dev: Vite proxies /api → localhost:3000 (no env var needed)
// In production (Vercel): VITE_API_URL must be set to the Railway backend URL
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach JWT ──────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sanmar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — handle auth errors ────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear stale token, redirect to login
      localStorage.removeItem('sanmar_token');
      localStorage.removeItem('sanmar_user');
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  },
);

// ─── Typed error helper ────────────────────────────────────────
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join('. ');
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export default api;
