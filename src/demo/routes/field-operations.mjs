// /technicians and /workOrders (the real backend path is /work-orders; the adapter folds both spellings).
// Work order service types follow the work-order backend enum (Maintenance|Repair|Installation|Inspection|Emergency),
// status is lowercase_underscore like the frontend model, priority lowercase (what the wizard sends).
import { fail, created, norm, nextId, isBlank, validDate, num, notify } from '../core.mjs';
import { DEMO_PROVIDER_ID } from '../seed/catalog.mjs';

const AVAILABILITY = { available: 'Available', occupied: 'Occupied', busy: 'Occupied', on_leave: 'On Leave' };
const SERVICE_TYPES = { maintenance: 'Maintenance', repair: 'Repair', installation: 'Installation', inspection: 'Inspection', emergency: 'Emergency' };
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['created', 'assigned', 'in_progress', 'on_hold', 'resolved', 'completed', 'cancelled'];
const DONE = ['resolved', 'completed', 'cancelled'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const findTech = (state, id) => state.technicians.find(t => String(t.id) === String(id)) || fail(404, 'Técnico no encontrado.');
const findWo = (state, id) => state.workOrders.find(w => String(w.id) === String(id)) || fail(404, 'Orden de trabajo no encontrada.');

function techFields(state, body, current) {
  const out = {};
  if (!current || 'name' in body) { if (isBlank(body.name)) fail(400, 'El nombre es obligatorio.'); out.name = body.name.trim(); }
  if (!current || 'email' in body) {
    if (isBlank(body.email) || !EMAIL.test(body.email.trim())) fail(400, 'Correo electrónico inválido.');
    const email = body.email.trim().toLowerCase();
    if (state.technicians.some(t => t !== current && t.email.toLowerCase() === email)) fail(409, 'Ya existe un técnico con ese correo.');
    out.email = body.email.trim();
  }
  if ('specialization' in body) out.specialization = String(body.specialization || '').trim();
  if ('phone' in body) out.phone = String(body.phone || '').trim();
  if ('availability' in body) out.availability = AVAILABILITY[norm(body.availability)] || fail(400, 'Disponibilidad inválida.');
  if ('averageRating' in body) out.averageRating = num(body.averageRating, 'Calificación', { min: 0, max: 5 });
  return out;
}
const techBusy = (state, id) => state.workOrders.some(w => w.assignedTechnicianId === id && ['assigned', 'in_progress', 'on_hold'].includes(w.status))
  || state.serviceRequests.some(r => r.assignedTechnicianId === id && ['accepted', 'in_progress'].includes(r.status));

function createWo({ state, body, now }) {
  if (isBlank(body.title) || body.title.trim().length < 3) fail(400, 'El título es obligatorio.');
  const equipment = state.equipment.find(e => e.id === Number(body.equipmentId)) || fail(400, 'Equipo no encontrado.');
  const serviceType = SERVICE_TYPES[norm(body.serviceType)] || fail(400, 'Tipo de servicio inválido.');
  const priority = body.priority ? norm(body.priority) : 'medium';
  if (!PRIORITIES.includes(priority)) fail(400, 'Prioridad inválida.');
  if (!validDate(body.scheduledDate)) fail(400, 'Fecha programada inválida.');
  if (body.serviceRequestId && !state.serviceRequests.some(r => String(r.id) === String(body.serviceRequestId))) fail(400, 'Solicitud de servicio no encontrada.');
  const id = nextId(state.workOrders);
  const wo = {
    id, workOrderNumber: `WO-${now.getUTCFullYear()}-${String(id).padStart(4, '0')}`, serviceRequestId: body.serviceRequestId ? Number(body.serviceRequestId) : null,
    title: body.title.trim(), description: body.description || '', issueDetails: body.issueDetails || body.description || '', creationTime: now.toISOString(), status: 'created', priority,
    assignedTechnicianId: null, scheduledDate: body.scheduledDate || null, timeSlot: body.timeSlot || '', serviceAddress: body.serviceAddress || equipment.locationAddress,
    desiredCompletionDate: null, actualCompletionDate: null, resolutionDetails: '', technicianNotes: '', cost: null, customerFeedbackRating: null, feedbackSubmissionDate: null,
    equipmentId: equipment.id, serviceType
  };
  state.workOrders.push(wo);
  notify(state, now, { title: 'Work order created', description: `Se creó la orden ${wo.workOrderNumber} para ${equipment.name}.`, type: 'service_request', equipmentId: equipment.id });
  return created(wo);
}

function assignWo({ state, params, body }) {
  const wo = findWo(state, params.id);
  const tech = findTech(state, body.technicianId);
  if (DONE.includes(wo.status)) fail(409, 'La orden ya está cerrada.');
  wo.assignedTechnicianId = tech.id;
  if (wo.status === 'created') wo.status = 'assigned';
  return wo;
}

function statusWo({ state, params, body, now }) {
  const wo = findWo(state, params.id);
  const to = norm(body.newStatus);
  if (!STATUSES.includes(to)) fail(400, 'Estado inválido.');
  const reopening = ['created', 'assigned', 'in_progress', 'on_hold'].includes(to);
  if ((wo.status === 'cancelled' || wo.status === 'completed') || (wo.status === 'resolved' && reopening)) fail(409, `No se puede pasar de "${wo.status}" a "${to}".`);
  if (to === 'assigned' && !wo.assignedTechnicianId) fail(409, 'Asigna un técnico primero.');
  wo.status = to;
  if (['resolved', 'completed'].includes(to) && !wo.actualCompletionDate) wo.actualCompletionDate = now.toISOString();
  return wo;
}

function resolveWo({ state, params, body, now }) {
  const wo = findWo(state, params.id);
  if (['completed', 'cancelled'].includes(wo.status)) fail(409, 'La orden ya está cerrada.');
  if (isBlank(body.resolutionDetails)) fail(400, 'Describe la resolución.');
  wo.resolutionDetails = body.resolutionDetails.trim();
  if ('technicianNotes' in body) wo.technicianNotes = String(body.technicianNotes ?? '');
  if ('cost' in body && body.cost !== null) wo.cost = num(body.cost, 'Costo', { min: 0 });
  wo.status = 'resolved'; wo.actualCompletionDate = now.toISOString();
  return wo;
}

export default [
  ['GET', '/technicians', ({ state }) => state.technicians],
  ['POST', '/technicians', ({ state, body }) => {
    const t = { id: nextId(state.technicians), specialization: '', phone: '', availability: 'Available', averageRating: 0, companyId: DEMO_PROVIDER_ID, ...techFields(state, body, null) };
    state.technicians.push(t);
    return created(t);
  }],
  ['GET', '/technicians/:id', ({ state, params }) => findTech(state, params.id)],
  ['PUT', '/technicians/:id', ({ state, params, body }) => { const t = findTech(state, params.id); return Object.assign(t, techFields(state, body, t)); }],
  ['DELETE', '/technicians/:id', ({ state, params }) => {
    const t = findTech(state, params.id);
    if (techBusy(state, t.id)) fail(409, 'El técnico tiene trabajo activo asignado.');
    state.technicians = state.technicians.filter(x => x !== t);
    return {};
  }],
  ['GET', '/workOrders', ({ state, query }) => state.workOrders.filter(w => ['assignedTechnicianId', 'status', 'equipmentId', 'serviceRequestId'].every(k => !query(k) || String(w[k]) === String(query(k))))],
  ['POST', '/workOrders', createWo],
  ['GET', '/workOrders/:id', ({ state, params }) => findWo(state, params.id)],
  ['PUT', '/workOrders/:id', ({ state, params, body }) => {
    const wo = findWo(state, params.id);
    if (DONE.includes(wo.status)) fail(409, 'La orden ya está cerrada.');
    for (const k of ['title', 'description', 'issueDetails', 'scheduledDate', 'timeSlot', 'serviceAddress', 'technicianNotes']) if (k in body) wo[k] = body[k];
    if (isBlank(wo.title)) fail(400, 'El título es obligatorio.');
    return wo;
  }],
  ['DELETE', '/workOrders/:id', ({ state, params }) => { const wo = findWo(state, params.id); state.workOrders = state.workOrders.filter(x => x !== wo); return {}; }],
  ['PUT', '/workOrders/:id/technician', assignWo],
  ['PUT', '/workOrders/:id/status', statusWo],
  ['PUT', '/workOrders/:id/resolution', resolveWo]
];
