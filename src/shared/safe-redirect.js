/**
 * Picks where to send the user after a successful sign-in.
 * Only same-origin internal paths are trusted (no open redirects, no loop back to sign-in).
 * @param {unknown} redirect - raw `?redirect=` query value from the router guard
 * @param {string} fallback - landing page when redirect is missing or unsafe
 * @returns {string}
 */
export function resolvePostLoginTarget(redirect, fallback = '/dashboard') {
  if (typeof redirect !== 'string') return fallback;
  const target = redirect.trim();
  const internal = target.startsWith('/') && !target.startsWith('//') && !target.includes('\\');
  const loopsBack = /^\/sign-in(?:[/?#]|$)/.test(target);
  return internal && !loopsBack ? target : fallback;
}
