// Technician-side demo API: own login type, per-technician data, work order lifecycle, persistence.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoAdapter } from './mock-api.mjs';

const memory = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), _m: m }; };
const make = (storage = memory()) => {
  const api = createDemoAdapter({ storage });
  const call = (method, url, data, headers) => api({ method, url, data, headers });
  const signIn = async username => (await call('post', '/authentication/sign-in', { username, password: 'Demo123!' })).data;
  // lowkey the same thing the axios interceptor does: Bearer <token> on every request
  const as = async username => { const { token } = await signIn(username); const h = { Authorization: `Bearer ${token}` }; return { get: url => call('get', url, undefined, h).then(r => r.data), patch: (url, body) => call('patch', url, body, h).then(r => r.data), raw: (m, url, body) => call(m, url, body, h) }; };
  const fails = (p, status) => assert.rejects(p, e => e.response?.status === status, `expected ${status}`);
  return { api, call, signIn, as, fails, storage };
};

test('Technician sign-in payload and technician-shaped profile', async () => {
  const { call, signIn, fails } = make();
  const ana = await signIn('ana.tecnica@demo.local');
  assert.equal(ana.userType, 'Technician'); assert.equal(ana.technicianId, 2); assert.equal(ana.companyName, 'TecnoFrio S.A.C.'); assert.equal(ana.username, 'Ana García');
  assert.ok(ana.token.startsWith('demo-only-'));
  const rosa = await signIn('rosa.tecnica@demo.local');
  assert.equal(rosa.userType, 'Technician'); assert.equal(rosa.technicianId, 4); assert.notEqual(rosa.token, ana.token);
  await fails(call('post', '/authentication/sign-in', { username: 'rosa.tecnica@demo.local', password: 'nope' }), 401);
  const profile = (await call('get', `/users/${ana.id}`)).data;
  assert.equal(profile.userType, 'Technician'); assert.equal(profile.ownerProfile, null); assert.equal(profile.providerProfile, null);
  assert.equal(profile.technicianProfile.technicianId, 2); assert.equal(profile.technicianProfile.specialization, 'Commercial refrigeration');
  assert.equal(profile.technicianProfile.companyName, 'TecnoFrio S.A.C.');
  // the other logins keep working
  for (const u of ['pedro@demo.local', 'tecnofrio@demo.local', 'lucia@demo.local', 'carmen@demo.local']) assert.notEqual((await signIn(u)).userType, 'Technician');
});

test('technician routes need a Technician session', async () => {
  const { call, signIn, fails } = make();
  await fails(call('get', '/technician/me/dashboard'), 401);
  const pedro = await signIn('pedro@demo.local');
  await fails(call('get', '/technician/me/work-orders', undefined, { Authorization: `Bearer ${pedro.token}` }), 403);
  await fails(call('get', '/technician/me/work-orders', undefined, { Authorization: 'Bearer demo-only-not-a-real-token' }), 401);
});

test('each technician only sees her own, distinct work orders', async () => {
  const { as } = make();
  const ana = await as('ana.tecnica@demo.local'), rosa = await as('rosa.tecnica@demo.local');
  const a = await ana.get('/technician/me/work-orders'), r = await rosa.get('/technician/me/work-orders');
  for (const list of [a, r]) { assert.ok(list.length >= 4 && list.length <= 6); assert.ok(new Set(list.map(w => w.status)).size >= 3); }
  assert.ok(a.every(w => w.assignedTechnicianId === 2)); assert.ok(r.every(w => w.assignedTechnicianId === 4));
  assert.equal(a.filter(w => r.some(x => x.id === w.id)).length, 0);
  assert.ok(a.every(w => w.equipment?.name && Array.isArray(w.checklist) && w.checklist.length >= 3));
  const open = await ana.get('/technician/me/work-orders?status=assigned');
  assert.ok(open.length >= 1 && open.every(w => w.status === 'assigned'));
  assert.equal((await ana.get('/technician/me/work-orders?status=all')).length, a.length);
});

test('PATCH work order: start, checklist, notes, finish, with guards', async () => {
  const { as, fails, api, storage } = make();
  const ana = await as('ana.tecnica@demo.local'), rosa = await as('rosa.tecnica@demo.local');
  const target = (await ana.get('/technician/me/work-orders?status=assigned'))[0];
  // finishing straight from "assigned" is not a thing
  await fails(ana.raw('patch', `/technician/me/work-orders/${target.id}`, { status: 'completed' }), 409);
  await fails(ana.raw('patch', `/technician/me/work-orders/${target.id}`, { status: 'dancing' }), 400);
  // someone else's order looks like it does not exist
  await fails(rosa.raw('patch', `/technician/me/work-orders/${target.id}`, { status: 'in_progress' }), 404);
  const started = await ana.patch(`/technician/me/work-orders/${target.id}`, { status: 'in_progress' });
  assert.equal(started.status, 'in_progress');
  // checklist incomplete -> cannot finish
  await fails(ana.raw('patch', `/technician/me/work-orders/${target.id}`, { status: 'completed' }), 409);
  const noted = await ana.patch(`/technician/me/work-orders/${target.id}`, { technicianNotes: 'Sello cambiado', checklist: [{ id: started.checklist[0].id, done: true }] });
  assert.equal(noted.technicianNotes, 'Sello cambiado'); assert.equal(noted.checklist[0].done, true);
  await fails(ana.raw('patch', `/technician/me/work-orders/${target.id}`, { checklist: [{ id: 'nope', done: true }] }), 400);
  const allDone = await ana.patch(`/technician/me/work-orders/${target.id}`, { checklist: started.checklist.map(i => ({ id: i.id, done: true })) });
  assert.ok(allDone.checklist.every(i => i.done));
  const finished = await ana.patch(`/technician/me/work-orders/${target.id}`, { status: 'completed', resolutionDetails: 'Todo ok' });
  assert.equal(finished.status, 'completed'); assert.ok(finished.actualCompletionDate); assert.equal(finished.resolutionDetails, 'Todo ok');
  await fails(ana.raw('patch', `/technician/me/work-orders/${target.id}`, { technicianNotes: 'tarde' }), 409);
  // state persists across adapters on the same storage, and reset restores the seed
  const again = createDemoAdapter({ storage });
  const read = () => again({ method: 'get', url: '/technician/me/work-orders?status=completed', headers: { Authorization: 'Bearer demo-only-7' } }).then(r => r.data);
  assert.ok((await read()).some(w => w.id === target.id));
  again.reset();
  assert.ok(!(await read()).some(w => w.id === target.id));
  void api;
});

test('dashboard summarises the day, counts and next visit', async () => {
  const { as } = make();
  const ana = await as('ana.tecnica@demo.local');
  const d = await ana.get('/technician/me/dashboard');
  const all = await ana.get('/technician/me/work-orders');
  assert.equal(d.technician.id, 2); assert.equal(d.technician.name, 'Ana García'); assert.equal(d.rating, 4.9);
  assert.equal(d.counts.total, all.length);
  for (const s of ['assigned', 'in_progress', 'on_hold', 'completed', 'cancelled']) assert.equal(d.counts[s], all.filter(w => w.status === s).length, s);
  assert.ok(d.today.length >= 1 && d.today.every(w => ['assigned', 'in_progress', 'on_hold'].includes(w.status)));
  const month = new Date().toISOString().slice(0, 7);
  assert.equal(d.completedThisMonth, all.filter(w => ['completed', 'resolved'].includes(w.status) && String(w.actualCompletionDate).slice(0, 7) === month).length);
  assert.ok(d.nextVisit && d.nextVisit.status === 'assigned' && new Date(d.nextVisit.scheduledDate) > new Date());
});

test('equipment, inventory and history are per technician', async () => {
  const { as } = make();
  const ana = await as('ana.tecnica@demo.local'), rosa = await as('rosa.tecnica@demo.local');
  const ids = async t => (await t.get('/technician/me/equipment')).map(e => e.id).sort();
  const aEq = await ana.get('/technician/me/equipment'), aOrders = await ana.get('/technician/me/work-orders');
  assert.deepEqual(await ids(ana), [...new Set(aOrders.map(w => w.equipmentId))].sort());
  assert.ok(aEq.every(e => e.name && e.locationAddress && ['normal', 'warning', 'critical'].includes(e.temperatureStatus) && typeof e.openOrders === 'number'));
  assert.notDeepEqual(await ids(ana), await ids(rosa));
  const aInv = await ana.get('/technician/me/inventory'), rInv = await rosa.get('/technician/me/inventory');
  assert.ok(aInv.length >= 5 && rInv.length >= 5);
  assert.notDeepEqual(aInv.map(i => i.name), rInv.map(i => i.name));
  assert.ok(aInv.every(i => ['tool', 'part'].includes(i.kind) && typeof i.lowStock === 'boolean'));
  assert.ok(aInv.some(i => i.kind === 'tool') && aInv.some(i => i.kind === 'part'));
  const h = await ana.get('/technician/me/history');
  assert.ok(h.length >= 2 && h.every(w => ['completed', 'resolved', 'cancelled'].includes(w.status)));
  assert.ok(h.every(w => w.assignedTechnicianId === 2));
});

test('role guard keeps technicians in their own shell and everyone else out of it', async () => {
  const { roleRedirect } = await import('../router/role-guard.js');
  const owner = { name: 'dashboard', meta: { requiresAuth: true } }, tech = { name: 'technician-orders', meta: { requiresAuth: true, role: 'technician' } };
  const open = { name: 'home', meta: { requiresAuth: false } }, signIn = { name: 'sign-in', meta: { requiresAuth: false } };
  assert.deepEqual(roleRedirect('Technician', owner), { name: 'technician-today' });
  assert.deepEqual(roleRedirect('Technician', signIn), { name: 'technician-today' });
  assert.equal(roleRedirect('Technician', tech), null); assert.equal(roleRedirect('Technician', open), null);
  for (const type of ['Owner', 'Provider']) { assert.deepEqual(roleRedirect(type, tech), { name: 'dashboard' }); assert.equal(roleRedirect(type, owner), null); }
});
