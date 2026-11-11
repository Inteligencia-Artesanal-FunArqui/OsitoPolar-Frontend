/**
 * Locale-aware date helpers so pages stop hard-coding 'es-PE' / 'en-US'.
 * `locale` is the vue-i18n code ('es' | 'en'); falls back to the browser when the date is invalid.
 */
const INTL = { es: 'es-PE', en: 'en-US' };

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, locale = 'es') {
  const date = toDate(value);
  return date ? date.toLocaleDateString(INTL[locale] || locale, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
}

export function formatDateTime(value, locale = 'es') {
  const date = toDate(value);
  return date
    ? date.toLocaleString(INTL[locale] || locale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '';
}
