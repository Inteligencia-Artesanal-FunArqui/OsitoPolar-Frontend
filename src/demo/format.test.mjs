import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, formatDateTime } from '../shared/format.js';

test('empty or invalid dates render as an empty string, never "Invalid Date"', () => {
  assert.equal(formatDate(null), '');
  assert.equal(formatDate('nope'), '');
  assert.equal(formatDateTime(undefined), '');
});

test('valid dates keep day/month/year and respect the locale choice', () => {
  assert.match(formatDate('2026-11-15T12:00:00Z', 'es'), /15\/11\/2026/);
  assert.match(formatDate('2026-11-15T12:00:00Z', 'en'), /11\/15\/2026/);
  assert.match(formatDateTime('2026-11-15T12:00:00Z', 'es'), /15\/11\/2026/);
});
