import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePostLoginTarget } from '../shared/safe-redirect.js';

test('uses the guard redirect when it is an internal path', () => {
  assert.equal(resolvePostLoginTarget('/equipment/3?tab=1'), '/equipment/3?tab=1');
});

test('falls back to the dashboard when redirect is missing or empty', () => {
  assert.equal(resolvePostLoginTarget(undefined), '/dashboard');
  assert.equal(resolvePostLoginTarget(''), '/dashboard');
  assert.equal(resolvePostLoginTarget(['/a', '/b']), '/dashboard');
});

test('rejects open-redirect shapes and bouncing back to sign-in', () => {
  for (const bad of ['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '/sign-in', '/sign-in?redirect=/x']) {
    assert.equal(resolvePostLoginTarget(bad), '/dashboard', bad);
  }
});
