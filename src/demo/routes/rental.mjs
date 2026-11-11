// Rental: json-server shapes (no real backend). Requests: draft -> submitted -> (cancelled). Stock is reserved on submit.
// Checkout is SIMULATED: the request is stored locally and "sent"; no payment/Stripe, no contract is signed.
import { fail, created, isBlank, validDate, num, nextId } from '../core.mjs';

const findItem = (state, id) => state.rentalEquipment.find(i => String(i.id) === String(id));
const findReq = (state, id) => state.rentalRequests.find(r => String(r.id) === String(id)) || fail(404, 'Solicitud de alquiler no encontrada.');
const discountFor = (pricing, months) => Math.max(0, ...(pricing?.discounts || []).filter(d => months >= d.months).map(d => d.percentage));
const FLOW = { draft: ['submitted', 'cancelled'], submitted: ['cancelled'], cancelled: [] };

function validate(state, body, now) {
  const item = findItem(state, body.rentalEquipmentId) || fail(400, 'Equipo de alquiler no encontrado.');
  const quantity = num(body.quantity ?? 1, 'Cantidad', { min: 1 });
  const months = num(body.rentalPeriodMonths ?? 1, 'Periodo', { min: 1, max: 36 });
  if (!Number.isInteger(quantity) || !Number.isInteger(months)) fail(400, 'Cantidad y periodo deben ser enteros.');
  if (quantity > item.stock) fail(400, `Solo hay ${item.stock} unidades disponibles.`);
  if (months < item.minimumRentalPeriod) fail(400, `El periodo mínimo es de ${item.minimumRentalPeriod} meses.`);
  if (isBlank(body.deliveryAddress)) fail(400, 'La dirección de entrega es obligatoria.');
  if (!validDate(body.preferredStartDate) || !body.preferredStartDate) fail(400, 'Fecha de inicio inválida.');
  if (String(body.notes || '').length > 500) fail(400, 'Las notas superan 500 caracteres.');
  const pricing = state.rentalPricing.find(p => String(p.rentalEquipmentId) === String(item.id));
  // totals are authoritative on the "server": base * qty * (1 - discount), (setup + delivery) * qty
  const monthly = pricing ? pricing.baseMonthlyPrice * quantity * (1 - discountFor(pricing, months) / 100) : item.monthlyPrice * quantity;
  const setup = pricing ? (pricing.setupFee + pricing.deliveryFee) * quantity : 0;
  return { item, fields: { userId: body.userId ?? 1, rentalEquipmentId: String(item.id), quantity, rentalPeriodMonths: months, deliveryAddress: body.deliveryAddress.trim(), preferredStartDate: body.preferredStartDate, notes: body.notes || '', totalMonthlyPrice: Math.round(monthly * 100) / 100, totalSetupCost: setup }, now };
}

export default [
  ['GET', '/rentalEquipment', ({ state, query }) => state.rentalEquipment.filter(i =>
    (!query('type') || i.type === query('type')) && (query('isAvailable') !== 'true' || i.isAvailable) && (!query('q') || `${i.name} ${i.model}`.toLowerCase().includes(String(query('q')).toLowerCase())))],
  ['GET', '/rentalEquipment/:id', ({ state, params }) => findItem(state, params.id) || fail(404, 'Equipo de alquiler no encontrado.')],
  ['GET', '/rentalPricing', ({ state, query }) => state.rentalPricing.filter(p => !query('rentalEquipmentId') || String(p.rentalEquipmentId) === String(query('rentalEquipmentId')))],
  ['GET', '/rentalRequests', ({ state, query }) => state.rentalRequests.filter(r => !query('userId') || String(r.userId) === String(query('userId')))],
  ['POST', '/rentalRequests', ({ state, body, now }) => {
    const { fields } = validate(state, body, now);
    const req = { id: String(nextId(state.rentalRequests)), ...fields, status: 'draft', createdAt: now.toISOString(), updatedAt: now.toISOString() };
    state.rentalRequests.push(req);
    return created(req);
  }],
  ['GET', '/rentalRequests/:id', ({ state, params }) => findReq(state, params.id)],
  ['PUT', '/rentalRequests/:id', ({ state, params, body, now }) => {
    const req = findReq(state, params.id);
    if (req.status !== 'draft') fail(409, 'Solo se pueden editar borradores.');
    const { fields } = validate(state, { ...req, ...body }, now);
    return Object.assign(req, fields, { updatedAt: now.toISOString() });
  }],
  ['PATCH', '/rentalRequests/:id', ({ state, params, body, now }) => {
    const req = findReq(state, params.id);
    const to = String(body.status || '');
    if (!FLOW[req.status]?.includes(to)) fail(409, `No se puede pasar de "${req.status}" a "${to}".`);
    const item = findItem(state, req.rentalEquipmentId);
    if (to === 'submitted') { if (!item || item.stock < req.quantity) fail(409, 'Ya no hay stock suficiente.'); item.stock -= req.quantity; }
    if (to === 'cancelled' && req.status === 'submitted' && item) item.stock += req.quantity;
    req.status = to; req.updatedAt = now.toISOString();
    return req;
  }]
];
