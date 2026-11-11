import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeToken, badgeMeta } from '../shared/badge-tokens.js';

test('normalizeToken folds backend PascalCase and frontend snake_case to one key', () => {
  assert.equal(normalizeToken('InProgress'), 'in_progress');
  assert.equal(normalizeToken('in_progress'), 'in_progress');
  assert.equal(normalizeToken('On Leave'), 'on_leave');
  assert.equal(normalizeToken('OutOfService'), 'out_of_service');
  assert.equal(normalizeToken('Pending'), 'pending');
  assert.equal(normalizeToken(null), '');
  assert.equal(normalizeToken(4), '4');
});

test('badgeMeta returns an i18n key and a severity per kind', () => {
  assert.deepEqual(badgeMeta('requestStatus', 'Resolved'), { key: 'badge.requestStatus.resolved', severity: 'success' });
  assert.deepEqual(badgeMeta('priority', 'critical'), { key: 'badge.priority.critical', severity: 'danger' });
  assert.deepEqual(badgeMeta('urgency', 'Emergency'), { key: 'badge.urgency.emergency', severity: 'danger' });
  assert.deepEqual(badgeMeta('serviceType', 'PreventiveMaintenance'), { key: 'badge.serviceType.preventive_maintenance', severity: 'info' });
  assert.deepEqual(badgeMeta('availability', 'on leave'), { key: 'badge.availability.on_leave', severity: 'warn' });
  assert.deepEqual(badgeMeta('workOrderStatus', 'OnHold'), { key: 'badge.workOrderStatus.on_hold', severity: 'warn' });
});

test('unknown values degrade to a neutral "unknown" label instead of raw enum text', () => {
  assert.deepEqual(badgeMeta('priority', 'wat'), { key: 'badge.unknown', severity: 'neutral' });
  assert.deepEqual(badgeMeta('nonsense', 'pending'), { key: 'badge.unknown', severity: 'neutral' });
  assert.deepEqual(badgeMeta('requestStatus', undefined), { key: 'badge.unknown', severity: 'neutral' });
});
