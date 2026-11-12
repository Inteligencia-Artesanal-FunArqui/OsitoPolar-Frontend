// /equipments (+operations, readings) and /analytics/equipments
import { fail, created, norm, nextId, isBlank, num, tempStatus } from '../core.mjs';
import { temperatureSeries, energySeries, dailySummaries } from '../analytics.mjs';

const TYPES = { freezer: 'Freezer', cold_room: 'ColdRoom', refrigerator: 'Refrigerator' };
const STATUSES = { active: 'Active', inactive: 'Inactive', maintenance: 'Maintenance', out_of_service: 'OutOfService', error: 'OutOfService' };
const OWNERSHIP = { owned: 'Owned', rented: 'Rented', leased: 'Leased' };
// sensible defaults when the form leaves the thermal fields empty
const DEFAULTS = { Freezer: [-20, -22, -18], ColdRoom: [2, 0, 4], Refrigerator: [4, 2, 8] };
const EDITABLE = ['name', 'model', 'manufacturer', 'serialNumber', 'code', 'cost', 'technicalDetails', 'installationDate', 'notes', 'currentTemperature', 'setTemperature', 'optimalTemperatureMin', 'optimalTemperatureMax', 'locationName', 'locationAddress', 'locationLatitude', 'locationLongitude', 'energyConsumptionCurrent', 'energyConsumptionUnit', 'energyConsumptionAverage'];
const NUMERIC = ['cost', 'currentTemperature', 'setTemperature', 'optimalTemperatureMin', 'optimalTemperatureMax', 'locationLatitude', 'locationLongitude', 'energyConsumptionCurrent', 'energyConsumptionAverage'];

const findEq = (state, id) => state.equipment.find(e => String(e.id) === String(id)) || fail(404, 'Equipo no encontrado.');
const enumOf = (map, value, label) => map[norm(value)] || fail(400, `${label} inválido.`);

function applyFields(item, body) {
  for (const k of EDITABLE) if (Object.hasOwn(body, k)) item[k] = NUMERIC.includes(k) ? num(body[k], k) : body[k];
  if (Object.hasOwn(body, 'type')) item.type = enumOf(TYPES, body.type, 'Tipo');
  if (body.status !== undefined) item.status = enumOf(STATUSES, body.status, 'Estado');
  if (Object.hasOwn(body, 'ownershipType')) item.ownershipType = enumOf(OWNERSHIP, body.ownershipType, 'Tipo de propiedad');
  if (Object.hasOwn(body, 'isPoweredOn')) item.isPoweredOn = Boolean(body.isPoweredOn);
}

function create({ state, body }) {
  if (isBlank(body.name)) fail(400, 'El nombre es obligatorio.');
  const type = enumOf(TYPES, body.type, 'Tipo');
  if (body.serialNumber && state.equipment.some(e => e.serialNumber === body.serialNumber)) fail(409, `Ya existe un equipo con el número de serie ${body.serialNumber}.`);
  const limit = 12; // Pedro's plan (Standard): maxUnits
  if (state.equipment.length >= limit) fail(409, `Alcanzaste el límite de ${limit} equipos de tu plan.`);
  const id = nextId(state.equipment);
  const [set, min, max] = DEFAULTS[type];
  const item = {
    id, name: body.name.trim(), type, model: '', manufacturer: '', serialNumber: `SN-${String(id).padStart(5, '0')}`, code: `EQ-${String(id).padStart(3, '0')}`, cost: 0, technicalDetails: '',
    status: 'Active', isPoweredOn: true, installationDate: new Date().toISOString().slice(0, 10), notes: '', currentTemperature: set, setTemperature: set,
    optimalTemperatureMin: min, optimalTemperatureMax: max, locationName: '', locationAddress: '', locationLatitude: 0, locationLongitude: 0,
    energyConsumptionCurrent: 0, energyConsumptionUnit: 'watts', energyConsumptionAverage: 0, ownerId: Number(body.ownerId) || 1, ownerType: 'Owner', ownershipType: 'Owned'
  };
  applyFields(item, { ...body, status: undefined }); // new units always start Active
  if (!Object.hasOwn(body, 'currentTemperature')) item.currentTemperature = item.setTemperature;
  if (item.optimalTemperatureMin >= item.optimalTemperatureMax) fail(400, 'El rango óptimo de temperatura es inválido.');
  state.equipment.push(item);
  return created(item);
}

function update({ state, params, body }) {
  const item = findEq(state, params.id);
  if (Object.hasOwn(body, 'name') && isBlank(body.name)) fail(400, 'El nombre no puede estar vacío.');
  const draft = { ...item };
  applyFields(draft, body);
  if (draft.optimalTemperatureMin >= draft.optimalTemperatureMax) fail(400, 'El rango óptimo de temperatura es inválido.');
  Object.assign(item, draft, { id: item.id });
  return item;
}

/** Frontend sends {setTemperature}/{isPoweredOn}; the real backend takes {temperature, powerState, status, notes, location}. Both work. */
function operations({ state, params, body }) {
  const item = findEq(state, params.id);
  const patch = {};
  const temp = body.temperature ?? body.setTemperature;
  if (temp !== undefined) patch.setTemperature = num(temp, 'Temperatura', { min: -50, max: 50 });
  if (body.powerState !== undefined) {
    const s = String(body.powerState).toUpperCase();
    if (!['ON', 'OFF', 'STANDBY'].includes(s)) fail(400, 'Estado de energía inválido.');
    patch.isPoweredOn = s === 'ON';
  }
  if (body.isPoweredOn !== undefined) patch.isPoweredOn = Boolean(body.isPoweredOn);
  if (body.status !== undefined) patch.status = enumOf(STATUSES, body.status, 'Estado');
  if (body.notes !== undefined) { if (String(body.notes).length > 500) fail(400, 'Las notas superan 500 caracteres.'); patch.notes = body.notes; }
  const loc = body.location;
  if (loc) {
    if (loc.address !== undefined) patch.locationAddress = loc.address;
    if (loc.latitude !== undefined) patch.locationLatitude = num(loc.latitude, 'Latitud', { min: -90, max: 90 });
    if (loc.longitude !== undefined) patch.locationLongitude = num(loc.longitude, 'Longitud', { min: -180, max: 180 });
  }
  return Object.assign(item, patch);
}

function addReading({ state, params, body, now }) {
  const item = findEq(state, params.id);
  const type = String(body.type || '').toLowerCase();
  if (!['temperature', 'energy'].includes(type)) fail(400, 'Tipo de lectura inválido.');
  const value = num(body.value, 'Valor');
  const status = body.status ? String(body.status).toLowerCase() : (type === 'temperature' ? tempStatus(value, item) : 'normal');
  if (!['normal', 'warning', 'critical'].includes(status)) fail(400, 'Estado de lectura inválido.');
  const reading = { id: nextId(state.readings), equipmentId: item.id, type, value, unit: body.unit || (type === 'temperature' ? 'celsius' : 'watts'), timestamp: body.timestamp || now.toISOString(), status, notes: body.notes || '' };
  state.readings.push(reading);
  if (type === 'temperature') item.currentTemperature = value; else item.energyConsumptionCurrent = value;
  return created(reading);
}

// ---- analytics ----
const window_ = query => {
  const hours = query('hours') === undefined || query('hours') === null ? 24 : num(query('hours'), 'hours', { min: 1, max: 720 });
  const limit = query('limit') === undefined || query('limit') === null ? 100 : Math.floor(num(query('limit'), 'limit', { min: 1, max: 500 }));
  return { hours, limit };
};
function readings({ state, params, query, now }) {
  const e = findEq(state, params.id);
  const type = String(query('type') || 'temperature').toLowerCase();
  if (!['temperature', 'energy'].includes(type)) fail(400, 'Tipo de lectura inválido (temperature | energy).');
  const { hours, limit } = window_(query);
  const generated = (type === 'temperature' ? temperatureSeries : energySeries)(e, { hours, limit, now });
  const since = now.getTime() - hours * 3600000;
  const extras = state.readings.filter(r => r.equipmentId === e.id && r.type === type && Date.parse(r.timestamp) >= since);
  const data = [...extras, ...generated].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
  return { data, total: data.length, equipmentId: e.id, type, period: `${hours}h` };
}
function summaries({ state, params, query, now }) {
  const e = findEq(state, params.id);
  const days = query('days') ? Math.floor(num(query('days'), 'days', { min: 1, max: 90 })) : 7;
  const data = dailySummaries(e, { days, now });
  return { data, total: data.length, equipmentId: e.id, type: 'daily-average', days };
}
function overview({ state, query, now }) {
  const ids = String(query('ids') || '').split(',').filter(Boolean);
  const list = ids.length ? state.equipment.filter(e => ids.includes(String(e.id))) : state.equipment;
  const equipments = list.map(e => ({ equipmentId: e.id, lastTemperature: e.currentTemperature, lastEnergyReading: e.energyConsumptionCurrent, status: tempStatus(e.currentTemperature, e), lastReadingTime: now.toISOString() }));
  const count = s => equipments.filter(x => x.status === s).length;
  return { equipments, summary: { totalEquipments: equipments.length, normalCount: count('normal'), warningCount: count('warning'), criticalCount: count('critical') } };
}

export default [
  ['GET', '/equipments', ({ state }) => state.equipment],
  ['POST', '/equipments', create],
  // legacy json-server style route the frontend still has in EquipmentService
  ['GET', '/equipments/owners/:ownerId', ({ state, params }) => state.equipment.filter(e => String(e.ownerId) === params.ownerId)],
  ['GET', '/equipments/:id', ({ state, params }) => findEq(state, params.id)],
  ['PUT', '/equipments/:id', update],
  ['PATCH', '/equipments/:id', operations],
  ['PATCH', '/equipments/:id/operations', operations],
  ['PUT', '/equipments/:id/operations', operations],
  ['DELETE', '/equipments/:id', ({ state, params }) => { const e = findEq(state, params.id); state.equipment = state.equipment.filter(x => x !== e); return {}; }],
  ['POST', '/equipments/:id/readings', addReading],
  ['GET', '/equipments/:id/readings', readings],
  ['GET', '/analytics/equipments/overview', overview],
  ['GET', '/analytics/equipments/:id/readings', readings],
  ['GET', '/analytics/equipments/:id/summaries', summaries]
];
