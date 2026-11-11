import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTechnician } from '../field-operations/technician-validation.js';

test('valid technician passes and is trimmed', () => {
  const { valid, errors, payload } = validateTechnician({ name: ' Ana ', email: ' ana@x.pe ', phone: '987 123 456', specialization: ' Frío ', availability: 'Available' });
  assert.equal(valid, true); assert.deepEqual(errors, {});
  assert.deepEqual(payload, { name: 'Ana', email: 'ana@x.pe', phone: '987 123 456', specialization: 'Frío', availability: 'Available' });
});
test('required fields and formats are reported by field key', () => {
  const { valid, errors } = validateTechnician({ name: ' ', email: 'nope', phone: 'abc', specialization: '', availability: 'Available' });
  assert.equal(valid, false);
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'name', 'phone', 'specialization']);
  assert.equal(validateTechnician({ name: 'A', email: 'a@b.pe', phone: '', specialization: 'x' }).errors.name, 'tooShort');
});
test('phone is optional but must look like a phone when present', () => {
  assert.equal(validateTechnician({ name: 'Ana', email: 'a@b.pe', specialization: 'x', phone: '' }).valid, true);
  assert.equal(validateTechnician({ name: 'Ana', email: 'a@b.pe', specialization: 'x', phone: '+51 987 654 321' }).valid, true);
});
