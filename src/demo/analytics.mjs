// Deterministic synthetic telemetry, always anchored on "now" so the 24 h / 7 day charts are never stale.
// Series end exactly at the equipment's current values, so cards, gauges and charts agree.
import { tempStatus } from './core.mjs';

const rnd = n => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }; // [0,1)
const r1 = v => Math.round(v * 10) / 10;
const smooth = x => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };

/** Newest first. `t` runs 0 (oldest) -> 1 (newest). Excursions ramp up over the last third of the window. */
export function temperatureSeries(e, { hours = 24, limit = 100, now = new Date() }) {
  const step = (hours * 3600000) / limit;
  return Array.from({ length: limit }, (_, i) => {
    const t = limit === 1 ? 1 : 1 - i / (limit - 1);
    const amp = Math.abs(e.setTemperature) > 10 ? 0.6 : 0.35;
    let value;
    if (i === 0) value = e.currentTemperature;
    else if (!e.isPoweredOn) value = e.currentTemperature + (rnd(e.id * 31 + i) - 0.5) * 0.2;
    else value = e.setTemperature + (e.currentTemperature - e.setTemperature) * smooth((t - 0.6) / 0.4)
      + Math.sin(t * Math.PI * 6 + e.id) * amp + (rnd(e.id * 97 + i) - 0.5) * amp;
    value = r1(value);
    return { id: e.id * 1000 + i + 1, equipmentId: e.id, type: 'temperature', value, unit: 'celsius', timestamp: new Date(now.getTime() - i * step).toISOString(), status: tempStatus(value, e) };
  });
}

export function energySeries(e, { hours = 24, limit = 100, now = new Date() }) {
  const step = (hours * 3600000) / limit;
  return Array.from({ length: limit }, (_, i) => {
    const t = limit === 1 ? 1 : 1 - i / (limit - 1);
    let value = i === 0 ? e.energyConsumptionCurrent
      : !e.isPoweredOn ? 0
      : e.energyConsumptionAverage * (1 + Math.sin(t * Math.PI * 4 + e.id) * 0.08 + (rnd(e.id * 53 + i) - 0.5) * 0.06)
        + (e.energyConsumptionCurrent - e.energyConsumptionAverage) * smooth((t - 0.75) / 0.25);
    value = Math.round(value);
    return { id: e.id * 1000 + i + 1, equipmentId: e.id, type: 'energy', value, unit: 'watts', timestamp: new Date(now.getTime() - i * step).toISOString(), status: value > e.energyConsumptionAverage * 1.3 ? 'warning' : 'normal' };
  });
}

/** Newest first, one row per day; only today (and a bit of yesterday) carries the current excursion. */
export function dailySummaries(e, { days = 7, now = new Date() }) {
  return Array.from({ length: days }, (_, d) => {
    const date = new Date(now.getTime() - d * 86400000).toISOString().slice(0, 10);
    const drift = d === 0 ? 1 : d === 1 ? 0.4 : 0;
    const noise = rnd(e.id * 11 + d) - 0.5;
    const avg = r1(e.isPoweredOn ? e.setTemperature + (e.currentTemperature - e.setTemperature) * drift + noise * 0.4 : e.currentTemperature);
    const spread = r1(0.5 + rnd(e.id * 7 + d) * 0.5);
    const eAvg = Math.round(e.isPoweredOn ? e.energyConsumptionAverage * (1 + noise * 0.05) : 0);
    return { id: e.id * 100 + d + 1, equipmentId: e.id, date, type: 'daily-average', averageTemperature: avg, minTemperature: r1(avg - spread), maxTemperature: r1(avg + spread), averageEnergy: eAvg, peakEnergy: Math.round(eAvg * 1.18) };
  });
}
