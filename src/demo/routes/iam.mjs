// /authentication, /users, /subscriptions, /contact
import { fail } from '../core.mjs';
import { accounts, DEMO_PASSWORD, subscriptionResources, contactInfo } from '../seed/catalog.mjs';

const OPEN = ['pending', 'accepted', 'in_progress'];
const plan = id => subscriptionResources().find(p => p.id === id);

const signIn = ({ body }) => {
  const login = String(body.username ?? '').trim().toLowerCase();
  if (!login || !body.password) fail(400, 'Usuario y contraseña son obligatorios.');
  const acc = accounts.find(a => a.login === login);
  if (!acc || body.password !== DEMO_PASSWORD) fail(401, 'Usa pedro@demo.local o tecnofrio@demo.local con la contraseña Demo123!.');
  // real backend sign-in payloads: Owner {…maxUnits} / Provider {…maxClients, companyName}
  const common = { id: acc.id, username: acc.username, token: 'demo-only-not-a-real-token', userType: acc.userType, profileId: acc.profileId, balance: acc.balance, planId: acc.planId };
  return acc.userType === 'Owner' ? { ...common, maxUnits: acc.maxUnits } : { ...common, maxClients: acc.maxClients, companyName: acc.companyName };
};

/** Real UserResource shape; counters come from live state. */
const userResource = (state, acc) => {
  const open = state.serviceRequests.filter(r => OPEN.includes(r.status)).length;
  const p = plan(acc.planId);
  const owner = acc.userType === 'Owner';
  return {
    id: acc.id, username: acc.username, userType: acc.userType, email: acc.email, memberSince: acc.memberSince, twoFactorEnabled: false,
    ownerProfile: owner ? { profileId: acc.profileId, balance: acc.balance, plan: { ...p, planType: 'Owner' }, maxEquipment: acc.maxUnits, currentEquipmentCount: state.equipment.length, activeServiceRequests: open } : null,
    providerProfile: owner ? null : { profileId: acc.profileId, companyName: acc.companyName, taxId: acc.taxId, balance: acc.balance, plan: { ...p, planType: 'Provider' }, maxClients: acc.maxClients, currentClientCount: 7, activeServiceRequests: open }
  };
};

const paymentNeeded = () => fail(403, 'Los cambios de plan requieren un pago, desactivado en esta demostración.');

export default [
  ['POST', '/authentication/sign-in', signIn],
  ['POST', '/authentication/sign-up', () => fail(403, 'El registro está desactivado en esta demostración.')],
  ['GET', '/users', ({ state }) => [...accounts.map(a => ({ id: a.id, username: a.username, userType: null, ownerProfile: null, providerProfile: null })),
    ...state.users.map(u => ({ id: u.id, username: u.username, userType: null, ownerProfile: null, providerProfile: null }))]],
  ['GET', '/users/:id', ({ state, params }) => {
    const acc = accounts.find(a => String(a.id) === params.id);
    if (acc) return userResource(state, acc);
    const legacy = state.users.find(u => String(u.id) === params.id);
    if (!legacy) fail(404, `User with id ${params.id} not found`);
    return { id: legacy.id, username: legacy.username, userType: null, memberSince: null, twoFactorEnabled: false, ownerProfile: null, providerProfile: null };
  }],
  ['GET', '/subscriptions', ({ query }) => subscriptionResources().filter(p => String(query('userType') || '').toLowerCase() === 'provider' ? p.id >= 4 : p.id <= 3)],
  ['POST', '/subscriptions/upgrade', paymentNeeded],
  ['GET', '/subscriptions/:id', ({ params }) => plan(Number(params.id)) || fail(404, 'Plan no encontrado.')],
  ['PATCH', '/subscriptions/:id', paymentNeeded],
  ['GET', '/contact', () => contactInfo]
];
