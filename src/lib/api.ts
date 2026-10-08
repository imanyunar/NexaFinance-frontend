// API Client for NexaFinance
// Uses strictly HttpOnly Secure SameSite=None cookies (Zero localStorage token exposure)

export const API_BASE = (() => {
  // If running locally, use relative path so Vite proxy handles it cleanly
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api';
  }
  // If deployed in production, use the configured backend URL
  const base = import.meta.env.VITE_API_BASE_URL || 'https://nexafinance-alpha.vercel.app';
  return base.endsWith('/api') ? base : `${base}/api`;
})();

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {};

  // For POST, PUT, PATCH: ensure body is at least an empty JSON object if Content-Type is application/json
  let body = options.body;
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    headers['Content-Type'] = 'application/json';
    if (body === undefined) {
      body = JSON.stringify({});
    }
  }

  const response = await fetch(url, {
    ...options,
    body,
    credentials: 'include', // Automatically passes HttpOnly Secure cookie
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> || {}),
    },
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const data = await response.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  // Handle 204 No Content or empty responses cleanly
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  const text = await response.text();
  if (!text || text.trim() === '') {
    return {} as T;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}
