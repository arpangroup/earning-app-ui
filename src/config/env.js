/**
 * Runtime environment, resolved at build time from the .env.<mode> files.
 *
 *   npm run dev        -> .env.development  (local, mock data)
 *   npm run dev:api    -> .env.dev          (local UI against the DEV backend)
 *   npm run build:dev  -> .env.dev
 *   npm run build:uat  -> .env.uat
 *   npm run build      -> .env.production
 *
 * Put personal overrides in `.env.development.local` (git-ignored).
 */
const e = import.meta.env;

export const env = Object.freeze({
  name: e.VITE_APP_ENV || 'production',
  useMock: e.VITE_USE_MOCK === 'true',
  apiBaseUrl: (e.VITE_API_BASE_URL || '').replace(/\/$/, ''),
  apiTimeoutMs: Number(e.VITE_API_TIMEOUT_MS || 15000),
  mockLatencyMs: Number(e.VITE_MOCK_LATENCY_MS || 0),
  isProduction: (e.VITE_APP_ENV || 'production') === 'production',
});

if (!env.useMock && !env.apiBaseUrl) {
  throw new Error(`[env] VITE_API_BASE_URL is required when VITE_USE_MOCK=false (env "${env.name}")`);
}
