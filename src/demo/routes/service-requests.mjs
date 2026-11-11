// /service-requests. Status is lowercase_underscore on the wire (the frontend compares it literally; the real backend emits
// PascalCase). `completed` is frontend-only (resolved + rated). Business rules mirror the backend domain:
// assign/reject only from Pending, cancel not from terminal states, feedback only when Resolved.
import { fail, created, norm, nextId, isBlank, validDate, notify } from '../core.mjs';
import { DEMO_PROVIDER_ID } from '../seed/catalog.mjs';

const SERVICE_TYPES = { preventive_maintenance: 'PreventiveMaintenance', corrective_maintenance: 'CorrectiveMaintenance', installation: 'Installation', diagnostic: 'Diagnostic' };
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const URGENCIES = ['normal', 'urgent', 'emergency'];
const BACKEND_CODES = { 1: 'pending', 2: 'accepted', 3: 'in_progress', 4: 'resolved', 5: 'cancelled', 6: 'rejected' };
const STATUSES = ['pending', 'accepted', 'in_progress', 'resolved', 'completed', 'cancelled', 'rejected'];
const NEXT = { pending: ['accepted', 'rejected', 'cancelled'], accepted: ['in_progress', 'resolved', 'cancelled'], in_progress: ['resolved', 'cancelled'], resolved: ['completed'], completed: [], cancelled: [], rejected: [] };

const find = (state, id) => state.serviceRequests.find(r => String(r.id) === String(id)) || fail(404, 'Solicitud no encontrada.');
export const parseStatus = value => {
  const s = typeof value === 'number' || /^\d+$/.test(String(value)) ? BACKEND_CODES[Number(value)] : norm(value);
  return STATUSES.includes(s) ? s : fail(400, 'Estado inválido.');
};
function move(state, now, r, to) {
  if (!NEXT[r.status].includes(to)) fail(409, `No se puede pasar de "${r.status}" a "${to}".`);
  r.status = to;
  if (to === 'resolved') {
    r.actualCompletionDate = now.toISOString();
    notify(state, now, { title: 'Service request resolved', description: `Tu solicitud ${r.orderNumber} fue resuelta. Califica el servicio cuando puedas.`, type: 'service_request', equipmentId: r.equipmentId });
  }
  return r;
}
const pick = (value, allowed, label, fallback) => { const v = value === undefined || value === null || value === '' ? fallback : norm(value); return allowed.includes(v) ? v : fail(400, `${label} inválido.`); };

function create({ state, body, now }) {
  const equipment = state.equipment.find(e => e.id === Number(body.equipmentId));
  const serviceType = SERVICE_TYPES[norm(body.serviceType)];
  if (!equipment || typeof body.description !== 'string' || body.description.trim().length < 5 || body.description.length > 1000 || !serviceType) fail(400, 'Selecciona un equipo y describe la solicitud con entre 5 y 1000 caracteres.');
  if (!validDate(body.scheduledDate)) fail(400, 'Fecha programada inválida.');
  const id = nextId(state.serviceRequests);
  const item = {
    id, orderNumber: `SR-${now.getUTCFullYear()}-${String(id).padStart(3, '0')}`, title: body.title || body.description.trim().slice(0, 60), description: body.description.trim(),
    issueDetails: body.issueDetails || body.description.trim(), clientId: 1,
    companyId: DEMO_PROVIDER_ID, // the wizard hard-codes companyId 1; there is a single demo provider
    equipmentId: equipment.id, requestTime: now.toISOString(), status: 'pending',
    priority: pick(body.priority, PRIORITIES, 'Prioridad', 'medium'), urgency: pick(body.urgency, URGENCIES, 'Urgencia', 'normal'), isEmergency: Boolean(body.isEmergency),
    serviceType, scheduledDate: body.scheduledDate || null, timeSlot: body.timeSlot || '', serviceAddress: body.serviceAddress || equipment.locationAddress,
    desiredCompletionDate: null, actualCompletionDate: null, customerFeedbackRating: null, assignedTechnicianId: null
  };
  state.serviceRequests.push(item);
  return created(item);
}

function assign({ state, params, body, now }) {
  const r = find(state, params.id);
  const tech = state.technicians.find(t => String(t.id) === String(body.technicianId)) || fail(404, 'Técnico no encontrado.');
  if (r.status !== 'pending') fail(409, 'Solo se puede asignar técnico a solicitudes pendientes.');
  r.assignedTechnicianId = tech.id; r.status = 'accepted';
  notify(state, now, { title: 'Technician assigned', description: `${tech.name} fue asignado a tu solicitud ${r.orderNumber}.`, type: 'service_request', equipmentId: r.equipmentId });
  return r;
}

export default [
  ['GET', '/service-requests', ({ state, query }) => state.serviceRequests.filter(r =>
    (!query('status') || r.status === norm(query('status'))) && (!query('equipmentId') || String(r.equipmentId) === String(query('equipmentId')))
    && (!query('companyId') || String(r.companyId) === String(query('companyId'))) && (!query('userId') || String(r.clientId) === String(query('userId')))
    && (!query('clientId') || String(r.clientId) === String(query('clientId'))))],
  ['POST', '/service-requests', create],
  ['GET', '/service-requests/:id', ({ state, params }) => find(state, params.id)],
  ['PUT', '/service-requests/:id', ({ state, params, body }) => {
    const r = find(state, params.id);
    if (r.status !== 'pending') fail(409, 'Solo se pueden editar solicitudes pendientes.');
    for (const k of ['title', 'description', 'issueDetails', 'scheduledDate', 'timeSlot', 'serviceAddress']) if (Object.hasOwn(body, k)) r[k] = body[k];
    if (isBlank(r.description) || r.description.trim().length < 5) fail(400, 'La descripción es demasiado corta.');
    return r;
  }],
  ['DELETE', '/service-requests/:id', ({ state, params }) => { const r = find(state, params.id); state.serviceRequests = state.serviceRequests.filter(x => x !== r); return {}; }],
  ['PUT', '/service-requests/:id/assign-technician', assign],
  ['PUT', '/service-requests/:id/technician', assign], // backend spelling
  ['POST', '/service-requests/:id/accept', ({ state, params, now }) => move(state, now, find(state, params.id), 'accepted')],
  ['PUT', '/service-requests/:id/reject', ({ state, params, now }) => { const r = find(state, params.id); if (r.status !== 'pending') fail(409, 'Solo se pueden rechazar solicitudes pendientes.'); return move(state, now, r, 'rejected'); }],
  ['PUT', '/service-requests/:id/cancel', ({ state, params, now }) => {
    const r = find(state, params.id);
    if (!['pending', 'accepted', 'in_progress'].includes(r.status)) fail(409, 'Esta solicitud ya no se puede cancelar.');
    return move(state, now, r, 'cancelled');
  }],
  ['PUT', '/service-requests/:id/status', ({ state, params, body, now }) => { const to = parseStatus(body.newStatus); return move(state, now, find(state, params.id), to); }],
  ['PUT', '/service-requests/:id/feedback', ({ state, params, body }) => {
    const r = find(state, params.id);
    if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) fail(400, 'Calificación inválida (1 a 5).');
    if (r.status !== 'resolved') fail(409, 'Solo se puede calificar una solicitud resuelta.');
    if (r.customerFeedbackRating) fail(409, 'Esta solicitud ya fue calificada.');
    r.customerFeedbackRating = body.rating;
    return r;
  }]
];
