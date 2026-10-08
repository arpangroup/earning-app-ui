/**
 * The ONLY entry point the UI uses for data:  import { api } from '../api';
 *
 * The adapter is chosen at build time from VITE_USE_MOCK (see src/config/env.js).
 * The comparison is written inline so Vite/Rollup can drop the unused adapter
 * (no mock data ships in dev/uat/prod builds).
 */
import { API_METHODS } from './contract';
import { httpApi } from './http/httpApi';
import { mockApi, restoreMockSession } from './mock/mockApi';
import { session } from './session';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const api = USE_MOCK ? mockApi : httpApi;

if (USE_MOCK && session.isLoggedIn()) restoreMockSession(session.getToken());

if (import.meta.env.DEV) {
  // Keep both adapters in lock-step with the contract.
  for (const [name, impl] of [['mock', mockApi], ['http', httpApi]]) {
    const missing = API_METHODS.filter((m) => typeof impl[m] !== 'function');
    if (missing.length) console.error(`[api] ${name} adapter is missing contract methods: ${missing.join(', ')}`);
  }
  console.info(`[api] using ${USE_MOCK ? 'MOCK' : 'HTTP'} adapter (env: ${import.meta.env.VITE_APP_ENV})`);
}

export { ApiError, ErrorCodes } from './errors';
export { session, AUTH_EXPIRED_EVENT } from './session';
