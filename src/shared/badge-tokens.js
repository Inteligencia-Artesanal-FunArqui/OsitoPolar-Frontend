/**
 * Pure helpers behind <op-status-badge>: turn whatever the API (or the mock) sends
 * into a stable i18n key + severity, so raw enum strings never reach the UI.
 */

/** 'InProgress' | 'in_progress' | 'On Leave' -> 'in_progress' | 'on_leave' */
export function normalizeToken(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

const SEVERITY = {
  requestStatus: {
    pending: 'warn', accepted: 'info', in_progress: 'info', resolved: 'success',
    completed: 'success', rejected: 'danger', cancelled: 'neutral'
  },
  workOrderStatus: {
    created: 'neutral', assigned: 'info', in_progress: 'info', on_hold: 'warn',
    resolved: 'success', completed: 'success', cancelled: 'neutral'
  },
  priority: { low: 'success', medium: 'info', high: 'warn', critical: 'danger' },
  urgency: { normal: 'neutral', urgent: 'warn', emergency: 'danger' },
  serviceType: {
    preventive_maintenance: 'info', corrective_maintenance: 'warn', installation: 'neutral',
    diagnostic: 'neutral', maintenance: 'info', repair: 'warn', inspection: 'neutral', emergency: 'danger'
  },
  availability: { available: 'success', occupied: 'warn', on_leave: 'warn', unknown: 'neutral' },
  equipmentStatus: {
    active: 'success', inactive: 'neutral', maintenance: 'warn', error: 'danger', out_of_service: 'danger'
  },
  temperature: { normal: 'success', warning: 'warn', critical: 'danger' }
};

/**
 * @param {string} kind - one of the keys of SEVERITY
 * @param {unknown} value - raw enum value from the API
 * @returns {{key: string, severity: 'success'|'info'|'warn'|'danger'|'neutral'}}
 */
export function badgeMeta(kind, value) {
  const token = normalizeToken(value);
  const severity = SEVERITY[kind]?.[token];
  if (!severity) return { key: 'badge.unknown', severity: 'neutral' };
  return { key: `badge.${kind}.${token}`, severity };
}

/** 'ColdRoom' | 'cold_room' -> 'equipment.types.cold_room' (callers check $te before $t and fall back to raw text). */
export function equipmentTypeKey(type) {
  return `equipment.types.${normalizeToken(type)}`;
}
