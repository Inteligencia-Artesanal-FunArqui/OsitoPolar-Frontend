// Endpoint-family tests for the rebuilt demo adapter (backend-shaped seed + mutations + error cases).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoAdapter, resetDemoState } from './mock-api.mjs';

const memory = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), _m: m }; };
const make = (storage = memory()) => {
  const api = createDemoAdapter({ storage });
  const call = (method, url, data) => api({ method, url, data });
  const get = url => call('get', url).then(r => r.data);
  const fails = (p, status) => assert.rejects(p, e => e.response?.status === status, `expected ${status}`);
  return { api, call, get, fails, storage };
};

test('sign-in returns the real Owner shape and a Provider login exists; sign-up is blocked', async () => {
  const { call, fails } = make();
  const owner = (await call('post', '/authentication/sign-in', { username: 'pedro@demo.local', password: 'Demo123!' })).data;
  assert.deepEqual(Object.keys(owner).sort(), ['balance', 'id', 'maxUnits', 'planId', 'profileId', 'token', 'userType', 'username']);
  assert.equal(owner.userType, 'Owner'); assert.equal(owner.planId, 2); assert.equal(owner.maxUnits, 12);
  const provider = (await call('post', '/authentication/sign-in', { username: 'tecnofrio@demo.local', password: 'Demo123!' })).data;
  assert.equal(provider.userType, 'Provider'); assert.equal(provider.companyName, 'TecnoFrio S.A.C.'); assert.equal(provider.maxClients, 30);
  await fails(call('post', '/authentication/sign-up', { username: 'x', password: 'y' }), 403);
  await fails(call('post', '/authentication/sign-in', { username: 'pedro@demo.local', password: 'nope' }), 401);
  await fails(call('post', '/authentication/sign-in', { username: '', password: '' }), 400);
});

test('GET /users/:id follows the real UserResource with live counters', async () => {
  const { get, fails, call } = make();
  const u = await get('/users/1');
  assert.equal(u.userType, 'Owner'); assert.equal(u.ownerProfile.plan.planName, 'Standard (Snow Bear)');
  assert.equal(u.ownerProfile.maxEquipment, 12);
  assert.equal(u.ownerProfile.currentEquipmentCount, (await get('/equipments')).length);
  assert.ok(u.ownerProfile.activeServiceRequests > 0); assert.equal(u.providerProfile, null);
  assert.equal((await get('/users/2')).providerProfile.companyName, 'TecnoFrio S.A.C.');
  assert.equal((await get('/users')).length, 4); // 2 demo accounts + 2 db.json legacy users
  await fails(call('get', '/users/99'), 404);
});

test('the 6 seeded plans are returned verbatim, split by userType', async () => {
  const { get, fails, call } = make();
  const owner = await get('/subscriptions?userType=user');
  assert.deepEqual(owner.map(p => [p.id, p.planName, p.price, p.maxEquipment, p.maxClients]),
    [[1, 'Basic (Polar Bear)', 18.99, 6, null], [2, 'Standard (Snow Bear)', 35.13, 12, null], [3, 'Premium (Glacial Bear)', 67.56, 24, null]]);
  const provider = await get('/subscriptions?userType=provider');
  assert.deepEqual(provider.map(p => [p.id, p.planName, p.price, p.maxClients]),
    [[4, 'Small Company', 40.51, 10], [5, 'Medium Company', 81.08, 30], [6, 'Enterprise Premium', 162.16, null]]);
  assert.ok(provider.every(p => p.billingCycle === 'Monthly' && p.features.length >= 6));
  assert.equal((await get('/subscriptions/3')).planName, 'Premium (Glacial Bear)');
  await fails(call('get', '/subscriptions/99'), 404);
  await fails(call('patch', '/subscriptions/3', { userId: 1, planId: 3 }), 403);
  await fails(call('post', '/subscriptions/upgrade', { userId: 1, planId: 3 }), 403);
  await fails(call('post', '/payments/create-checkout-session', { userId: 1, planId: 3 }), 403);
});

test('equipment seed: 10 units, 5 Lima locations (db.json), backend enums, unique serials, id 1 critical', async () => {
  const { get } = make();
  const list = await get('/equipments');
  assert.equal(list.length, 10);
  assert.equal(new Set(list.map(e => e.serialNumber)).size, 10);
  assert.equal(new Set(list.map(e => e.locationName)).size, 5);
  assert.ok(list.every(e => ['Freezer', 'ColdRoom', 'Refrigerator'].includes(e.type)));
  assert.ok(list.every(e => ['Active', 'Inactive', 'Maintenance', 'OutOfService'].includes(e.status)));
  assert.ok(list.every(e => ['Owned', 'Rented', 'Leased'].includes(e.ownershipType) && e.ownerId === 1 && e.ownerType === 'Owner'));
  assert.equal(list.find(e => e.id === 1).locationName, 'San Isidro Main Warehouse');
  assert.equal(list.filter(e => e.ownershipType === 'Rented').length, 2);
  assert.ok(list.some(e => e.status === 'Maintenance') && list.some(e => e.status === 'OutOfService'));
});

test('equipment CRUD: create validates, enforces plan limit, patch operations, delete', async () => {
  const { call, get, fails } = make();
  await fails(call('post', '/equipments', { name: ' ' }), 400);
  await fails(call('post', '/equipments', { name: 'X', type: 'Toaster' }), 400);
  await fails(call('post', '/equipments', { name: 'X', type: 'Freezer', serialNumber: 'XK400-12345' }), 409);
  const created = (await call('post', '/equipments', { name: 'Nueva', type: 'cold_room', serialNumber: 'NEW-1', currentTemperature: 3, setTemperature: 3, optimalTemperatureMin: 0, optimalTemperatureMax: 5, ownershipType: 'Owned' })).data;
  assert.equal(created.type, 'ColdRoom'); assert.equal(created.status, 'Active'); assert.equal(created.id, 11);
  await call('post', '/equipments', { name: 'Doce', type: 'Freezer', serialNumber: 'NEW-2' });
  await fails(call('post', '/equipments', { name: 'Trece', type: 'Freezer', serialNumber: 'NEW-3' }), 409);
  const op = (await call('patch', '/equipments/1/operations', { temperature: -19 })).data;
  assert.equal(op.setTemperature, -19);
  assert.equal((await call('patch', '/equipments/1/operations', { setTemperature: -20 })).data.setTemperature, -20);
  assert.equal((await call('patch', '/equipments/1/operations', { powerState: 'OFF' })).data.isPoweredOn, false);
  assert.equal((await call('patch', '/equipments/1/operations', { isPoweredOn: true })).data.isPoweredOn, true);
  assert.equal((await call('patch', '/equipments/1/operations', { status: 'maintenance' })).data.status, 'Maintenance');
  await fails(call('patch', '/equipments/1/operations', { temperature: 99 }), 400);
  await fails(call('patch', '/equipments/1/operations', { powerState: 'MAYBE' }), 400);
  await fails(call('patch', '/equipments/999/operations', { temperature: 1 }), 404);
  const put = (await call('put', '/equipments/2', { name: 'Renombrado', notes: 'ok' })).data;
  assert.equal(put.name, 'Renombrado'); assert.equal(put.type, 'ColdRoom');
  await fails(call('put', '/equipments/2', { name: '' }), 400);
  assert.equal((await get('/equipments/owners/1')).length, 12);
  assert.equal((await get('/equipments/owners/9')).length, 0);
  await call('delete', '/equipments/11');
  await fails(call('get', '/equipments/11'), 404);
  await fails(call('delete', '/equipments/11'), 404);
});

test('readings: temperature and energy series are backend-shaped, newest first and coherent with equipment', async () => {
  const { get, call, fails } = make();
  const r = await get('/analytics/equipments/1/readings?type=temperature&hours=24&limit=50');
  assert.equal(r.total, 50); assert.equal(r.equipmentId, 1); assert.equal(r.type, 'temperature'); assert.equal(r.period, '24h');
  assert.ok(r.data[0].timestamp > r.data[1].timestamp);
  assert.equal(r.data[0].unit, 'celsius'); assert.equal(r.data[0].value, (await get('/equipments/1')).currentTemperature);
  assert.equal(r.data[0].status, 'critical');
  const e = await get('/analytics/equipments/1/readings?type=energy&limit=5');
  assert.equal(e.data[0].unit, 'watts'); assert.equal(e.data.length, 5);
  assert.deepEqual(r, await get('/analytics/equipments/1/readings?type=temperature&hours=24&limit=50').then(x => ({ ...x, data: x.data.map((d, i) => ({ ...d, timestamp: r.data[i].timestamp })) })));
  await fails(call('get', '/analytics/equipments/1/readings?type=pressure'), 400);
  await fails(call('get', '/analytics/equipments/999/readings'), 404);
  const s = await get('/analytics/equipments/2/summaries?type=daily-averages&days=7');
  assert.equal(s.data.length, 7); assert.equal(s.days, 7); assert.match(s.data[0].date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(s.data.every(d => d.minTemperature <= d.averageTemperature && d.averageTemperature <= d.maxTemperature));
  const o = await get('/analytics/equipments/overview?ids=1,2&type=current');
  assert.equal(o.equipments.length, 2); assert.equal(o.summary.totalEquipments, 2); assert.equal(o.summary.criticalCount, 1);
  assert.equal(typeof o.equipments[0].lastTemperature, 'number');
});

test('POST readings stores a sample and moves the current value', async () => {
  const { call, get, fails } = make();
  await call('post', '/equipments/2/readings', { type: 'temperature', value: 4.4, unit: 'celsius', status: 'normal' });
  assert.equal((await get('/equipments/2')).currentTemperature, 4.4);
  assert.equal((await get('/analytics/equipments/2/readings?type=temperature&limit=3')).data[0].value, 4.4);
  await fails(call('post', '/equipments/2/readings', { type: 'temperature', value: 'hot' }), 400);
});

test('notifications: sorted newest first, unread count, mark one / all as read, validation', async () => {
  const { get, call, fails } = make();
  const list = await get('/notifications?userId=1&_sort=timestamp&_order=desc');
  assert.ok(list.length >= 8); assert.ok(list.some(n => n.status === 'read') && list.some(n => n.status === 'unread'));
  assert.ok(list.every((n, i) => i === 0 || list[i - 1].timestamp >= n.timestamp));
  assert.equal(list[0].id, 1);
  assert.deepEqual(Object.keys(list[0]).filter(k => ['title', 'description', 'status', 'type', 'equipmentId', 'userId', 'timestamp'].includes(k)).length, 7);
  const unread = (await get('/notifications/unread-count?userId=1')).unreadCount;
  assert.equal(unread, list.filter(n => n.status === 'unread').length);
  assert.equal((await call('patch', '/notifications/1', { status: 'read' })).data.status, 'read');
  assert.equal((await get('/notifications/unread-count?userId=1')).unreadCount, unread - 1);
  await call('patch', '/notifications/read-all?userId=1');
  assert.equal((await get('/notifications/unread-count?userId=1')).unreadCount, 0);
  await fails(call('patch', '/notifications/1', { status: 'bogus' }), 400);
  await fails(call('patch', '/notifications/999', { status: 'read' }), 404);
  assert.equal((await get('/notifications?userId=77')).length, 0);
});

test('service requests: seed covers every status; create validates; lifecycle + rules', async () => {
  const { get, call, fails } = make();
  const all = await get('/service-requests');
  const statuses = new Set(all.map(r => r.status));
  for (const s of ['pending', 'accepted', 'in_progress', 'resolved', 'completed', 'cancelled', 'rejected']) assert.ok(statuses.has(s), s);
  assert.equal(all[0].orderNumber, 'SR-2023-001'); // db.json first record
  assert.ok(all.every(r => /^SR-\d{4}-\d{3}$/.test(r.orderNumber)));
  assert.ok(all.some(r => r.status === 'resolved' && r.customerFeedbackRating === null));
  assert.equal((await get('/service-requests?status=Pending')).every(r => r.status === 'pending'), true);
  assert.ok((await get('/service-requests?userId=1')).length === all.length);
  const body = { title: 'T', description: 'Compresor ruidoso en cámara', issueDetails: 'x', equipmentId: 3, serviceType: 'CorrectiveMaintenance', priority: 'High', urgency: 'Urgent', isEmergency: false, clientId: 1, companyId: 1, scheduledDate: '2026-12-01T10:00:00Z', timeSlot: '08:00 - 10:00' };
  const c = (await call('post', '/service-requests', body)).data;
  assert.equal(c.companyId, 3); assert.equal(c.status, 'pending'); assert.equal(c.priority, 'high'); assert.equal(c.urgency, 'urgent'); assert.equal(c.serviceType, 'CorrectiveMaintenance');
  assert.ok(c.serviceAddress.length > 3);
  await fails(call('post', '/service-requests', { ...body, equipmentId: 999 }), 400);
  await fails(call('post', '/service-requests', { ...body, priority: 'Nuclear' }), 400);
  await fails(call('post', '/service-requests', { ...body, scheduledDate: 'nope' }), 400);
  // assign -> accepted; second assign refused; unknown technician refused
  await fails(call('put', `/service-requests/${c.id}/assign-technician`, { technicianId: 99 }), 404);
  const a = (await call('put', `/service-requests/${c.id}/assign-technician`, { technicianId: 1 })).data;
  assert.equal(a.status, 'accepted'); assert.equal(a.assignedTechnicianId, 1);
  await fails(call('put', `/service-requests/${c.id}/assign-technician`, { technicianId: 2 }), 409);
  await fails(call('put', `/service-requests/${c.id}/reject`), 409);
  // status: string, PascalCase and numeric (4 = Resolved) all accepted
  assert.equal((await call('put', `/service-requests/${c.id}/status`, { newStatus: 'InProgress' })).data.status, 'in_progress');
  await fails(call('put', `/service-requests/${c.id}/feedback`, { rating: 5 }), 409);
  const r = (await call('put', `/service-requests/${c.id}/status`, { newStatus: 4 })).data;
  assert.equal(r.status, 'resolved'); assert.ok(r.actualCompletionDate);
  await fails(call('put', `/service-requests/${c.id}/feedback`, { rating: 9 }), 400);
  assert.equal((await call('put', `/service-requests/${c.id}/feedback`, { rating: 5 })).data.customerFeedbackRating, 5);
  await fails(call('put', `/service-requests/${c.id}/feedback`, { rating: 4 }), 409);
  await fails(call('put', `/service-requests/${c.id}/cancel`), 409);
  await fails(call('put', `/service-requests/${c.id}/status`, { newStatus: 'bogus' }), 400);
  // cancel / reject from pending
  assert.equal((await call('put', '/service-requests/10/reject')).data.status, 'rejected');
  assert.equal((await call('put', '/service-requests/3/cancel')).data.status, 'cancelled');
  await fails(call('put', '/service-requests/999/cancel'), 404);
  assert.equal((await call('put', '/service-requests/3', { description: 'edit' }).catch(e => e.response)).status, 409);
  await call('delete', `/service-requests/${c.id}`);
  await fails(call('get', `/service-requests/${c.id}`), 404);
});

test('lifecycle side effects add notifications', async () => {
  const { get, call } = make();
  const before = (await get('/notifications?userId=1')).length;
  await call('put', '/service-requests/10/assign-technician', { technicianId: 1 });
  assert.equal((await get('/notifications?userId=1')).length, before + 1);
});

test('technicians: seed, create/validate, update, delete with active-work guard', async () => {
  const { get, call, fails } = make();
  const list = await get('/technicians');
  assert.equal(list.length, 4);
  assert.ok(list.every(t => t.name && t.specialization && /^9\d{8}$/.test(t.phone) && t.companyId === 3 && typeof t.averageRating === 'number'));
  assert.deepEqual([...new Set(list.map(t => t.availability))].sort(), ['Available', 'Occupied', 'On Leave']);
  assert.equal((await get('/technicians/2')).id, 2);
  await fails(call('get', '/technicians/99'), 404);
  await fails(call('post', '/technicians', { name: '', email: 'a@b.pe' }), 400);
  await fails(call('post', '/technicians', { name: 'Nuevo', email: 'no-email' }), 400);
  await fails(call('post', '/technicians', { name: 'Nuevo', email: list[0].email }), 409);
  const t = (await call('post', '/technicians', { name: 'Nuevo Técnico', specialization: 'Electrónica', phone: '955111222', email: 'nuevo@tecnofrio.pe' })).data;
  assert.equal(t.id, 5); assert.equal(t.availability, 'Available'); assert.equal(t.companyId, 3); assert.equal(t.averageRating, 0);
  assert.equal((await call('put', '/technicians/5', { availability: 'On Leave' })).data.availability, 'On Leave');
  await fails(call('put', '/technicians/5', { availability: 'Dancing' }), 400);
  await fails(call('delete', '/technicians/2'), 409); // busy with an active work order
  await call('delete', '/technicians/5');
  await fails(call('get', '/technicians/5'), 404);
});

test('work orders: seed, create (both URL spellings), technician, status, resolution, filters', async () => {
  const { get, call, fails } = make();
  const list = await get('/workOrders');
  assert.ok(list.length >= 5);
  assert.deepEqual((await get('/work-orders')).map(w => w.id), list.map(w => w.id));
  assert.ok(list.every(w => /^WO-2026-\d{4}$/.test(w.workOrderNumber)));
  for (const s of ['created', 'assigned', 'in_progress', 'on_hold', 'resolved', 'completed']) assert.ok(list.some(w => w.status === s), s);
  assert.ok(list.every(w => ['Maintenance', 'Repair', 'Installation', 'Inspection', 'Emergency'].includes(w.serviceType)));
  const body = { serviceRequestId: null, title: 'Revisión de compresor', description: 'Ruido anormal', issueDetails: 'Desde ayer', equipmentId: 3, serviceType: 'Repair', priority: 'high', scheduledDate: '2026-12-02T10:00:00Z', timeSlot: '10:00 - 12:00', serviceAddress: 'Av. Larco 1100' };
  const w = (await call('post', '/workOrders', body)).data;
  assert.equal(w.status, 'created'); assert.equal(w.priority, 'high'); assert.match(w.workOrderNumber, /^WO-2026-\d{4}$/);
  await fails(call('post', '/workOrders', { ...body, serviceType: 'PreventiveMaintenance' }), 400);
  await fails(call('post', '/workOrders', { ...body, equipmentId: 999 }), 400);
  await fails(call('post', '/workOrders', { ...body, title: '' }), 400);
  await fails(call('post', '/workOrders', { ...body, serviceRequestId: 999 }), 400);
  await fails(call('put', `/workOrders/${w.id}/technician`, { technicianId: 99 }), 404);
  const as = (await call('put', `/workOrders/${w.id}/technician`, { technicianId: 1 })).data;
  assert.equal(as.status, 'assigned'); assert.equal(as.assignedTechnicianId, 1);
  assert.equal((await call('put', `/workOrders/${w.id}/status`, { newStatus: 'InProgress' })).data.status, 'in_progress');
  await fails(call('put', `/workOrders/${w.id}/status`, { newStatus: 'nope' }), 400);
  const res = (await call('put', `/workOrders/${w.id}/resolution`, { resolutionDetails: 'Cambio de ventilador', technicianNotes: 'ok', cost: 120 })).data;
  assert.equal(res.status, 'resolved'); assert.equal(res.cost, 120); assert.ok(res.actualCompletionDate);
  await fails(call('put', `/workOrders/${w.id}/status`, { newStatus: 'created' }), 409);
  await fails(call('put', `/workOrders/${w.id}/resolution`, {}), 400);
  assert.ok((await get('/workOrders?assignedTechnicianId=1')).every(x => x.assignedTechnicianId === 1));
  assert.equal((await get(`/workOrders/${w.id}`)).id, w.id);
  await call('delete', `/workOrders/${w.id}`);
  await fails(call('get', `/workOrders/${w.id}`), 404);
});

test('rental: catalog, filters, detail, pricing, requests lifecycle with stock', async () => {
  const { get, call, fails } = make();
  const cat = await get('/rentalEquipment?isAvailable=true');
  assert.ok(cat.length >= 6);
  assert.ok(cat.every(i => i.imageUrl.startsWith('data:image/svg+xml')));
  assert.ok(cat.every(i => typeof i.monthlyPrice === 'number' && i.currency === '$' && Array.isArray(i.features) && i.minimumRentalPeriod >= 1));
  for (const t of ['freezer', 'cold_room', 'refrigerator']) assert.ok((await get(`/rentalEquipment?type=${t}&isAvailable=true`)).every(i => i.type === t && true));
  assert.ok((await get('/rentalEquipment?type=freezer&isAvailable=true')).length >= 1);
  assert.equal((await get('/rentalEquipment/1')).model, 'CM-2000');
  await fails(call('get', '/rentalEquipment/999'), 404);
  const pr = await get('/rentalPricing?rentalEquipmentId=1');
  assert.equal(pr.length, 1); assert.equal(pr[0].baseMonthlyPrice, 200); assert.deepEqual(pr[0].discounts, [{ months: 6, percentage: 10 }, { months: 12, percentage: 15 }]);
  assert.equal((await get('/rentalPricing?rentalEquipmentId=999')).length, 0);
  const stock = (await get('/rentalEquipment/1')).stock;
  const body = { userId: 1, rentalEquipmentId: '1', quantity: 2, rentalPeriodMonths: 6, deliveryAddress: 'Av. Larco 1100', preferredStartDate: '2026-12-15T00:00:00.000Z', notes: '', totalMonthlyPrice: 0, totalSetupCost: 0, status: 'draft' };
  const d = (await call('post', '/rentalRequests', body)).data;
  assert.equal(d.status, 'draft'); assert.equal(d.totalMonthlyPrice, 360); assert.equal(d.totalSetupCost, 400); // 2*200*0.9 ; 2*(150+50)
  await fails(call('post', '/rentalRequests', { ...body, quantity: 0 }), 400);
  await fails(call('post', '/rentalRequests', { ...body, quantity: 99 }), 400);
  await fails(call('post', '/rentalRequests', { ...body, rentalPeriodMonths: 1 }), 400); // minimum is 3
  await fails(call('post', '/rentalRequests', { ...body, deliveryAddress: ' ' }), 400);
  await fails(call('post', '/rentalRequests', { ...body, rentalEquipmentId: '999' }), 400);
  const s = (await call('patch', `/rentalRequests/${d.id}`, { status: 'submitted', updatedAt: new Date().toISOString() })).data;
  assert.equal(s.status, 'submitted');
  assert.equal((await get('/rentalEquipment/1')).stock, stock - 2);
  await fails(call('patch', `/rentalRequests/${d.id}`, { status: 'draft' }), 409);
  assert.equal((await call('patch', `/rentalRequests/${d.id}`, { status: 'cancelled' })).data.status, 'cancelled');
  assert.equal((await get('/rentalEquipment/1')).stock, stock);
  await fails(call('patch', '/rentalRequests/zzz', { status: 'submitted' }), 404);
  assert.equal((await get('/rentalRequests?userId=1')).length, 1);
  assert.equal((await get('/rentalRequests?userId=2')).length, 0);
  assert.equal((await call('put', '/rentalRequests/' + (await call('post', '/rentalRequests', body)).data.id, { notes: 'x' })).data.notes, 'x');
});

test('state: persists mutations, old v1 state reseeds, reset restores the seed', async () => {
  const storage = memory();
  storage.setItem('ositopolar-vue-demo-v1', JSON.stringify({ version: 1, equipment: [], notifications: [], requests: [] }));
  let { call, get } = make(storage);
  assert.equal((await get('/equipments')).length, 10);
  await call('patch', '/equipments/1/operations', { temperature: -18 });
  ({ call, get } = make(storage));
  assert.equal((await get('/equipments/1')).setTemperature, -18);
  const bad = memory(); bad.setItem('ositopolar-vue-demo-state', '{"version":1,"equipment":"x"}');
  assert.equal((await make(bad).get('/equipments')).length, 10);
  const junk = memory(); junk.setItem('ositopolar-vue-demo-state', 'not json');
  assert.equal((await make(junk).get('/equipments')).length, 10);
  resetDemoState(storage);
  assert.equal((await make(storage).get('/equipments/1')).setTemperature, -20);
  assert.equal(storage.getItem('ositopolar-vue-demo-v1'), null);
});

test('unknown routes, external URLs and payments stay rejected', async () => {
  const { call, fails } = make();
  await fails(call('get', '/nope'), 404);
  await fails(call('delete', '/subscriptions/1'), 404);
  await fails(call('get', 'https://example.com'), 404);
  await fails(call('post', '/payments/complete-rental', {}), 403);
  await fails(call('post', '/service-payments/create-checkout', {}), 403);
});

test('seed covers every collection of server/db.json and mirrors routes.json', async () => {
  const { readFile } = await import('node:fs/promises');
  const db = JSON.parse(await readFile(new URL('../../server/db.json', import.meta.url), 'utf8'));
  const routesJson = JSON.parse(await readFile(new URL('../../server/routes.json', import.meta.url), 'utf8'));
  assert.deepEqual(routesJson, { '/api/v1/*': '/$1' });
  const { get } = make();
  const empty = ['rentalRequests', 'rentalContracts', 'rentalPayments']; // empty in db.json too
  for (const name of Object.keys(db)) {
    const rows = await get(`/${name}`);
    assert.ok(Array.isArray(rows), name);
    if (!empty.includes(name)) assert.ok(rows.length > 0, `collection ${name} must have synthetic rows`);
    // the /api/v1 prefix is rewritten exactly like routes.json does
    assert.equal((await get(`/api/v1/${name}`)).length, rows.length, name);
    for (const field of Object.keys(db[name][0] || {}).filter(f => ['id'].includes(f))) assert.ok(rows.every(r => field in r));
  }
  const plans = await get('/plans'); const dbPlans = db.plans;
  assert.deepEqual(plans.map(p => [p.name, p.price, p.maxEquipment]), dbPlans.map(p => [p.name, p.price, p.maxEquipment]));
  const names = (await get('/equipments')).map(e => e.name);
  for (const e of db.equipment) assert.ok(names.includes(e.name), e.name); // db.json units are kept by name
  assert.deepEqual((await get('/rentalEquipment')).slice(0, 4).map(r => r.model), db.rentalEquipment.map(r => r.model));
  assert.equal((await get('/technicians')).slice(0, 2).map(t => t.name).join(), db.technicians.map(t => t.name).join());
  assert.equal((await get('/providers'))[0].name, 'TecnoFrio S.A.C.');
  assert.ok((await get('/temperatureReadings?equipmentId=1')).every(r => r.equipmentId === 1 && 'temperature' in r));
  assert.ok((await get('/energyReadings?equipmentId=5')).every(r => 'consumption' in r));
  assert.equal((await get('/dailyTemperatureAverages?equipmentId=2')).length, 7);
  assert.equal((await get('/maintenance/3')).type, 'corrective');
});

test('contact info names the company CoolFreeze and the product OsitoPolar', async () => {
  const { get } = make();
  const c = await get('/contact');
  assert.equal(c.company, 'CoolFreeze'); assert.equal(c.product, 'OsitoPolar'); assert.match(c.email, /@coolfreeze\.com$/);
  assert.ok(c.social.every(s => !/ositopolar/i.test(s.url)));
});
