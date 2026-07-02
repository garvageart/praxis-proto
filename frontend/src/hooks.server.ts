import type { Handle } from '@sveltejs/kit';

const API_TARGET = process.env.API_PROXY_TARGET || 'http://localhost:8080';

export const handle: Handle = async ({ event, resolve }) => {
  const url = new URL(event.request.url);

  // Proxy /api/* and /health to the backend
  if (url.pathname.startsWith('/api/') || url.pathname === '/health') {
    const target = new URL(url.pathname + url.search, API_TARGET);
    const proxyReq = new Request(target, event.request);
    return fetch(proxyReq);
  }

  return resolve(event);
};
