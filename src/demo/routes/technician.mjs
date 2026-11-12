// /technician/me/*: the field-technician side of the demo. Everything is scoped to the technician behind the Bearer token.
// Token format (see routes/iam.mjs): "demo-only-<accountId>". No token -> 401, a non-technician account -> 403.
import { fail, isBlank, norm, tempStatus } from '../core.mjs';
import { accounts } from '../seed/catalog.mjs';
import { checklistFor } from '../seed/technician.mjs';

const OPEN = ['assigned', 'in_progress', 'on_hold'];
const CLOSED = ['completed', 'resolved', 'cancelled'];
const STATUSES = ['assigned', 'in_progress', 'on_hold', 'completed', 'resolved', 'cancelled'];
// what the technician is allowed to do from each status (resolved/cancelled/completed are terminal on this side)
const TRANSITIONS = { assigned: ['in_progress'], on_hold: ['in_progress'], in_progress: ['on_hold', 'completed'] };

function headerValue(config, name) {
  const h = config?.headers;
  if (!h) return '';
  if (typeof h.get === 'function') return String(h.get(name) ?? '');
  return String(h[name] ?? h[name.toLowerCase()] ?? '');
}

/** Who is calling? Resolves the technician row from the session token, or throws 401/403. */
function currentTech({ state, config }) {
  const m = /^Bearer demo-only-(\d+)$/.exec(headerValue(config, 'Authorization').trim());
  const acc = m && accounts.find(a => String(a.id) === m[1]);
  if (!acc) fail(401, 'Inicia sesión para continuar.');
  if (acc.userType !== 'Technician') fail(403, 'Esta sección es solo para técnicos.');
  return state.technicians.find(t => t.id === acc.technicianId) || fail(404, 'Técnico no encontrado.');
}

const byDate = (a, b) => new Date(a.scheduledDate || a.creationTime) - new Date(b.scheduledDate || b.creationTime);
const mine = (state, tech) => state.workOrders.filter(w => w.assignedTechnicianId === tech.id);
const ensureChecklist = wo => { if (!Array.isArray(wo.checklist)) wo.checklist = checklistFor(wo.serviceType); return wo; };
const view = (state, wo) => {
  const e = state.equipment.find(x => x.id === wo.equipmentId);
  return { ...ensureChecklist(wo), equipment: e ? { id: e.id, name: e.name, model: e.model, code: e.code, locationName: e.locationName, locationAddress: e.locationAddress } : null };
};

function dashboard({ state, now, config }) {
  const tech = currentTech({ state, config });
  const orders = mine(state, tech);
  const endOfToday = new Date(now); endOfToday.setHours(23, 59, 59, 999);
  const counts = { total: orders.length };
  for (const s of ['assigned', 'in_progress', 'on_hold', 'completed', 'cancelled']) counts[s] = orders.filter(w => w.status === s).length;
  const month = now.toISOString().slice(0, 7);
  // "today" = open work due by the end of today (overdue stuff stays visible, that's how a real day works)
  const today = orders.filter(w => OPEN.includes(w.status) && w.scheduledDate && new Date(w.scheduledDate) <= endOfToday).sort(byDate);
  const next = orders.filter(w => w.status === 'assigned' && w.scheduledDate && new Date(w.scheduledDate) > now).sort(byDate)[0];
  return {
    technician: { id: tech.id, name: tech.name, specialization: tech.specialization, availability: tech.availability },
    rating: tech.averageRating, counts, today: today.map(w => view(state, w)),
    completedThisMonth: orders.filter(w => ['completed', 'resolved'].includes(w.status) && String(w.actualCompletionDate).slice(0, 7) === month).length,
    nextVisit: next ? view(state, next) : null
  };
}

function patchWo({ state, params, body, now, config }) {
  const tech = currentTech({ state, config });
  // someone else's order is "not found" on purpose, no leaking ids across technicians
  const wo = mine(state, tech).find(w => String(w.id) === params.id) || fail(404, 'Orden de trabajo no encontrada.');
  ensureChecklist(wo);
  if (CLOSED.includes(wo.status)) fail(409, 'La orden ya está cerrada.');
  const to = 'status' in body ? norm(body.status) : null;
  if (to && !STATUSES.includes(to)) fail(400, 'Estado inválido.');
  if (to && to !== wo.status && !(TRANSITIONS[wo.status] || []).includes(to)) fail(409, `No se puede pasar de "${wo.status}" a "${to}".`);
  const patch = new Map(Array.isArray(body.checklist) ? body.checklist.map(i => [String(i?.id), !!i?.done]) : []);
  if (patch.size && [...patch.keys()].some(id => !wo.checklist.some(i => i.id === id))) fail(400, 'Elemento de checklist inválido.');
  if (to === 'completed' && !wo.checklist.every(i => patch.has(i.id) ? patch.get(i.id) : i.done)) fail(409, 'Completa el checklist antes de finalizar.');
  // validated everything first, now mutate (a failed PATCH never leaves a half-applied order)
  for (const item of wo.checklist) if (patch.has(item.id)) item.done = patch.get(item.id);
  if ('technicianNotes' in body) wo.technicianNotes = String(body.technicianNotes ?? '');
  if ('resolutionDetails' in body && !isBlank(body.resolutionDetails)) wo.resolutionDetails = body.resolutionDetails.trim();
  if (to) wo.status = to;
  if (to === 'completed') wo.actualCompletionDate = now.toISOString();
  return view(state, wo);
}

function equipmentList({ state, config }) {
  const tech = currentTech({ state, config });
  const orders = mine(state, tech);
  const ids = [...new Set(orders.map(w => w.equipmentId))];
  return ids.map(id => state.equipment.find(e => e.id === id)).filter(Boolean).map(e => {
    const own = orders.filter(w => w.equipmentId === e.id);
    const last = own.filter(w => w.actualCompletionDate).sort((a, b) => new Date(b.actualCompletionDate) - new Date(a.actualCompletionDate))[0];
    return {
      id: e.id, name: e.name, type: e.type, model: e.model, manufacturer: e.manufacturer, serialNumber: e.serialNumber, code: e.code, status: e.status,
      currentTemperature: e.currentTemperature, setTemperature: e.setTemperature, optimalTemperatureMin: e.optimalTemperatureMin, optimalTemperatureMax: e.optimalTemperatureMax,
      temperatureStatus: tempStatus(e.currentTemperature, e), locationName: e.locationName, locationAddress: e.locationAddress,
      openOrders: own.filter(w => OPEN.includes(w.status)).length, lastServiceDate: last?.actualCompletionDate ?? null
    };
  });
}

export default [
  ['GET', '/technician/me/dashboard', dashboard],
  ['GET', '/technician/me/work-orders', ({ state, query, config }) => {
    const tech = currentTech({ state, config });
    const status = norm(query('status'));
    return mine(state, tech).filter(w => !status || status === 'all' || w.status === status).sort(byDate).map(w => view(state, w));
  }],
  ['PATCH', '/technician/me/work-orders/:id', patchWo],
  ['GET', '/technician/me/equipment', equipmentList],
  ['GET', '/technician/me/inventory', ({ state, config }) => {
    const tech = currentTech({ state, config });
    return state.technicianInventory.filter(i => i.technicianId === tech.id).map(i => ({ ...i, lowStock: i.quantity < i.minQuantity }));
  }],
  ['GET', '/technician/me/history', ({ state, config }) => {
    const tech = currentTech({ state, config });
    const when = w => new Date(w.actualCompletionDate || w.scheduledDate || w.creationTime);
    return mine(state, tech).filter(w => CLOSED.includes(w.status)).sort((a, b) => when(b) - when(a)).map(w => view(state, w));
  }]
];
