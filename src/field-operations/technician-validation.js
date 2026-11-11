// Pure validation for the technician form. Errors are i18n sub-keys (technicians.form.errors.<key>), never raw text.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s-]{7,20}$/;

export function validateTechnician(form) {
  const errors = {};
  const name = String(form.name ?? '').trim();
  const email = String(form.email ?? '').trim();
  const phone = String(form.phone ?? '').trim();
  const specialization = String(form.specialization ?? '').trim();
  if (!name) errors.name = 'required'; else if (name.length < 2) errors.name = 'tooShort';
  if (!email) errors.email = 'required'; else if (!EMAIL.test(email)) errors.email = 'invalid';
  if (phone && !PHONE.test(phone)) errors.phone = 'invalid';
  if (!specialization) errors.specialization = 'required';
  return { valid: Object.keys(errors).length === 0, errors, payload: { name, email, phone, specialization, availability: form.availability || 'Available' } };
}
