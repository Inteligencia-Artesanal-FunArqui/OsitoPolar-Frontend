/**
 * Role-based redirect rules, kept pure so node tests can hit them without a router.
 * Technicians live in their own shell (/technician/*); owners/providers never see it.
 * @param {string|null} userType 'Owner' | 'Provider' | 'Technician' (from the sign-in payload)
 * @param {{name?: string, meta?: object}} to target route
 * @returns {{name: string}|null} a redirect location, or null to let the navigation through
 */
export function roleRedirect(userType, to) {
    const isTechnician = userType === 'Technician';
    const isTechnicianRoute = to.meta?.role === 'technician';
    // technicians bounce off every authenticated owner/provider page (and the sign-in screen once logged in)
    if (isTechnician && !isTechnicianRoute && (to.meta?.requiresAuth === true || to.name === 'sign-in')) return { name: 'technician-today' };
    // ...and nobody else gets into the technician shell
    if (!isTechnician && isTechnicianRoute) return { name: 'dashboard' };
    return null;
}
