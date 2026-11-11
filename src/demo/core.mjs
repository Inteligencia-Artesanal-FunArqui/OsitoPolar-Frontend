// Tiny toolbox shared by the demo adapter: errors, enum normalisers, route table compiler.

export class DemoHttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const fail = (status, message) => { throw new DemoHttpError(status, message); };
/** Wrap a handler result so the adapter answers 201. */
export const created = data => ({ __status: 201, data });
export const clone = value => JSON.parse(JSON.stringify(value));

/** 'InProgress' | 'in progress' | 'On Leave' -> 'in_progress' | 'on_leave'. */
export const norm = value => String(value ?? '').trim()
  .replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase();

export const nextId = list => Math.max(0, ...list.map(item => Number(item.id) || 0)) + 1;
export const isBlank = value => typeof value !== 'string' || value.trim() === '';
export const validDate = value => value === null || value === undefined || value === '' || !Number.isNaN(Date.parse(value));

/** Finite number or 400. */
export function num(value, label, { min = -Infinity, max = Infinity } = {}) {
  const n = typeof value === 'string' && value.trim() === '' ? NaN : Number(value);
  if (!Number.isFinite(n) || n < min || n > max) fail(400, `${label} inválido.`);
  return n;
}

/**
 * Exact mirror of the frontend Equipment.getTemperatureStatus() so readings and cards never disagree.
 * (Quirk: the far bound is always > 20% of the range away, so anything out of range is "critical".)
 */
export function tempStatus(value, e) {
  if (value >= e.optimalTemperatureMin && value <= e.optimalTemperatureMax) return 'normal';
  const threshold = Math.abs(e.optimalTemperatureMax - e.optimalTemperatureMin) * 0.2;
  const minDiff = Math.abs(value - e.optimalTemperatureMin), maxDiff = Math.abs(value - e.optimalTemperatureMax);
  return minDiff > threshold || maxDiff > threshold ? 'critical' : 'warning';
}

/** '/equipments/:id/readings' -> matcher. First registered match wins, so register static paths before param ones. */
export function compileRoutes(table) {
  return table.map(([method, pattern, handler]) => {
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
    return { method, re, keys, handler };
  });
}
export function matchRoute(routes, method, path) {
  for (const r of routes) {
    if (r.method !== method) continue;
    const m = r.re.exec(path);
    if (m) return { handler: r.handler, params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) };
  }
  return null;
}

/** Open a notification for the demo user (side effect of lifecycle changes). */
export function notify(state, now, { title, description, type = 'info', equipmentId = null }) {
  state.notifications.push({ id: nextId(state.notifications), userId: 1, equipmentId, title, description, status: 'unread', timestamp: now.toISOString(), type });
}
