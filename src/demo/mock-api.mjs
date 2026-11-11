// Axios adapter for demo mode (VITE_DEMO_MODE=true): every request resolves locally or rejects, never touches the network.
// Layout: core.mjs (helpers) | seed/* (data) | routes/* (endpoint families) | analytics.mjs (synthetic telemetry).
import { DemoHttpError, clone, compileRoutes, matchRoute } from './core.mjs';
import { buildSeed, STATE_VERSION } from './seed/index.mjs';
import iam from './routes/iam.mjs';
import equipment from './routes/equipment.mjs';
import notifications from './routes/notifications.mjs';
import serviceRequests from './routes/service-requests.mjs';
import fieldOperations from './routes/field-operations.mjs';
import rental from './routes/rental.mjs';
import legacy from './routes/legacy.mjs';

export const STORAGE_KEY = 'ositopolar-vue-demo-state';
const LEGACY_KEYS = ['ositopolar-vue-demo-v1']; // v1 state (equipment/notifications/requests only): dropped, we reseed
const COLLECTIONS = ['users', 'equipment', 'notifications', 'serviceRequests', 'technicians', 'workOrders', 'rentalEquipment', 'rentalPricing', 'rentalRequests', 'readings', 'maintenance', 'plans', 'providerPlans', 'providers', 'companies', 'rentalContracts', 'rentalPayments'];
const routes = compileRoutes([...iam, ...equipment, ...notifications, ...serviceRequests, ...fieldOperations, ...rental, ...legacy]);

/** Forget the saved demo state (next adapter / page load reseeds). */
export function resetDemoState(storage) {
  for (const key of [STORAGE_KEY, ...LEGACY_KEYS]) { try { storage?.removeItem(key); } catch { /* storage blocked: nothing to reset */ } }
}

function loadState(storage) {
  for (const key of LEGACY_KEYS) { try { storage?.removeItem(key); } catch { /* ignore */ } }
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) || 'null');
    if (saved?.version === STATE_VERSION && COLLECTIONS.every(k => Array.isArray(saved[k]))) return saved;
  } catch { /* corrupted or unavailable storage: reseed */ }
  return buildSeed();
}

// payments / Stripe / external registration are never available offline
const BLOCKED = /^\/(payments|service-payments|rental-payments|payment-history)(\/|$)|checkout|complete-registration|\/authentication\/register$/;

/** Axios adapter: every request resolves locally or rejects; never falls back to network. */
export function createDemoAdapter({ storage } = {}) {
  let state = loadState(storage);
  const save = () => { try { storage?.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* in-memory demo still works */ } };
  const adapter = async config => {
    const response = (data, status = 200) => ({ data: clone(data), status, statusText: status === 201 ? 'Created' : 'OK', headers: {}, config, request: { demo: true } });
    const reject = (message, status = 404) => { const error = new Error(message); error.isAxiosError = true; error.config = config; error.response = { ...response({ message }, status), statusText: 'Demo request rejected' }; throw error; };
    const rawUrl = config.url || '';
    if (/^[a-z][a-z\d+.-]*:/i.test(rawUrl) || rawUrl.startsWith('//')) return reject('URL externa bloqueada en modo de demostración.');
    const url = new URL(rawUrl || '/', 'http://demo.local');
    // routes.json mirror: /api/v1/* -> /$1 ; the real backend spells work orders /work-orders
    const path = (url.pathname.replace(/^\/api\/v1/, '').replace(/\/$/, '') || '/').replace(/^\/work-orders/, '/workOrders')
      // db.json collection names that differ from the backend controller routes
      .replace(/^\/equipment(?=\/|$)/, '/equipments').replace(/^\/serviceRequests(?=\/|$)/, '/service-requests');
    const method = (config.method || 'get').toUpperCase();
    let body = config.data ?? {};
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { return reject('JSON inválido.', 400); } }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return reject('Objeto de datos inválido.', 400);
    if (BLOCKED.test(path)) return reject('Pagos, registro externo y Stripe desactivados en esta demostración.', 403);
    if (method === 'POST' && path === '/authentication/sign-up') return reject('El registro está desactivado en esta demostración.', 403);
    const hit = matchRoute(routes, method, path);
    if (!hit) return reject(`Operación no incluida en la demostración: ${method} ${path}`);
    const query = key => url.searchParams.get(key) ?? config.params?.[key];
    try {
      const out = hit.handler({ state, params: hit.params, query, body, now: new Date(), config });
      if (method !== 'GET') save();
      return out?.__status ? response(out.data, out.__status) : response(out);
    } catch (error) {
      if (error instanceof DemoHttpError) return reject(error.message, error.status);
      throw error;
    }
  };
  adapter.reset = () => { state = buildSeed(); save(); };
  return adapter;
}
