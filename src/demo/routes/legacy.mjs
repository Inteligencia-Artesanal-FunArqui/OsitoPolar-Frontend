// Read-only json-server collections from db.json that have no dedicated family (GET /collection[?field=value], /collection/:id).
// temperatureReadings / energyReadings / dailyTemperatureAverages keep their legacy field names but are generated live.
import { fail } from '../core.mjs';
import { temperatureSeries, energySeries, dailySummaries } from '../analytics.mjs';

const STORED = ['companies', 'plans', 'providerPlans', 'providers', 'maintenance', 'rentalContracts', 'rentalPayments'];
const VIRTUAL = {
  temperatureReadings: (e, now) => temperatureSeries(e, { hours: 24, limit: 12, now }).map(r => ({ id: r.id, equipmentId: e.id, temperature: r.value, timestamp: r.timestamp, status: r.status })),
  energyReadings: (e, now) => energySeries(e, { hours: 24, limit: 12, now }).map(r => ({ id: r.id, equipmentId: e.id, consumption: r.value, timestamp: r.timestamp, status: r.status })),
  dailyTemperatureAverages: (e, now) => dailySummaries(e, { days: 7, now }).map(d => ({ id: d.id, equipmentId: e.id, date: d.date, averageTemperature: d.averageTemperature, minTemperature: d.minTemperature, maxTemperature: d.maxTemperature }))
};
const matches = (row, query) => Object.keys(row).every(k => query(k) === undefined || query(k) === null || String(row[k]) === String(query(k)));

export function legacyCollection(name, state, query, now) {
  if (STORED.includes(name)) return state[name].filter(r => matches(r, query));
  const rows = state.equipment.flatMap(e => VIRTUAL[name](e, now));
  return rows.filter(r => matches(r, query));
}
export const LEGACY_NAMES = [...STORED, ...Object.keys(VIRTUAL)];

export default LEGACY_NAMES.flatMap(name => [
  ['GET', `/${name}`, ({ state, query, now }) => legacyCollection(name, state, query, now)],
  ['GET', `/${name}/:id`, ({ state, params, query, now }) => legacyCollection(name, state, () => undefined, now).find(r => String(r.id) === params.id) || fail(404, 'Not Found')]
]);
