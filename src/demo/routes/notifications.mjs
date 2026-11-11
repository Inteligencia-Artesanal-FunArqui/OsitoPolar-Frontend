// /notifications. Frontend contract: {description, status read|unread}; PATCH /notifications/:id {status:'read'}.
// The disabled backend controller uses message/isRead + /:id/read, /read-all, /unread-count - those work too.
import { fail } from '../core.mjs';

const find = (state, id) => state.notifications.find(n => String(n.id) === String(id)) || fail(404, 'Aviso no encontrado.');
const mine = (state, query) => state.notifications.filter(n => !query('userId') || String(n.userId) === String(query('userId')));

export default [
  ['GET', '/notifications', ({ state, query }) => {
    let list = mine(state, query).filter(n => !query('status') || n.status === query('status'));
    const dir = String(query('_order') || 'desc').toLowerCase() === 'asc' ? 1 : -1; // json-server legacy params
    return [...list].sort((a, b) => dir * String(a.timestamp).localeCompare(String(b.timestamp)));
  }],
  ['GET', '/notifications/unread-count', ({ state, query }) => ({ unreadCount: mine(state, query).filter(n => n.status === 'unread').length })],
  ['PATCH', '/notifications/read-all', ({ state, query }) => { const list = mine(state, query); list.forEach(n => { n.status = 'read'; }); return { updated: list.length }; }],
  ['PATCH', '/notifications/:id/read', ({ state, params }) => Object.assign(find(state, params.id), { status: 'read' })],
  ['PATCH', '/notifications/:id', ({ state, params, body }) => {
    const n = find(state, params.id);
    if (body.status !== 'read' && body.isRead !== true) fail(400, 'Estado inválido.');
    return Object.assign(n, { status: 'read' });
  }]
];
