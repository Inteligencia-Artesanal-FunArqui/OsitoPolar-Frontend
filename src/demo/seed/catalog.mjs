// Plans, providers, users and companies. Names/ids follow server/db.json; the sign-in/profile shapes follow the real backend.
// Decision: db.json stores plan features without the leading "Up to N units" line and billingCycle in lowercase;
// GET /subscriptions rebuilds the real backend resource (planName, "Monthly", leading limit line) from these rows.

export const plans = [
  { id: 1, name: 'Basic (Polar Bear)', price: 18.99, billingCycle: 'monthly', maxEquipment: 6, features: ['Real-time temperature monitoring', 'Critical-fault email alerts', 'Remote on/off control', 'Maintenance history log', 'Email support'] },
  { id: 2, name: 'Standard (Snow Bear)', price: 35.13, billingCycle: 'monthly', maxEquipment: 12, features: ['Everything in Basic', 'Advanced monitoring (energy, usage)', 'Remote temperature adjustment', 'Monthly energy reports', 'Scheduled maintenance'] },
  { id: 3, name: 'Premium (Glacial Bear)', price: 67.56, billingCycle: 'monthly', maxEquipment: 24, features: ['Everything in Standard', 'Full monitoring (temp, energy, run-time)', 'Auto-scheduled preventive maintenance', 'Exclusive analytics dashboard'] }
];
export const providerPlans = [
  { id: 1, name: 'Small Company', price: 40.51, billingCycle: 'monthly', maxClients: 10, features: ['Client & unit management', 'Technician visit scheduling', 'Basic technical reports', 'Client-fault notifications', 'Service history log', 'Email support'] },
  { id: 2, name: 'Medium Company', price: 81.08, billingCycle: 'monthly', maxClients: 30, features: ['Everything in Small Company', 'Detailed technical reports', 'Tech performance metrics', 'Client feedback surveys', 'Service dashboard', 'Priority support'] },
  { id: 3, name: 'Enterprise Premium', price: 162.16, billingCycle: 'monthly', maxClients: null, features: ['Everything in Medium Company', 'Advanced admin dashboard', 'Predictive maintenance alerts', 'Historical data exports', 'Custom reporting & branding'] }
];

/** Real backend ids: owner plans 1-3, provider plans 4-6. */
export function subscriptionResources() {
  const owner = plans.map(p => ({ id: p.id, planName: p.name, price: p.price, billingCycle: 'Monthly', maxEquipment: p.maxEquipment, maxClients: null, features: [`Up to ${p.maxEquipment} units`, ...p.features] }));
  const lead = { 1: 'Manage up to 10 clients', 2: 'Up to 30 clients', 3: 'Unlimited clients' };
  const provider = providerPlans.map(p => ({ id: p.id + 3, planName: p.name, price: p.price, billingCycle: 'Monthly', maxEquipment: null, maxClients: p.maxClients, features: [lead[p.id], ...p.features] }));
  return [...owner, ...provider];
}

export const providers = [
  { id: 3, name: 'TecnoFrio S.A.C.', type: 'service_provider', specialization: 'Commercial refrigeration', contactEmail: 'info@tecnofrio.com', contactPhone: '987987987', address: 'Av. Industriales 456, Lima' }
];
export const companies = [
  { id: 1, name: 'Supermercados ABC', email: 'contacto@abc.com', phone: '123456789', businessType: 'retail', location: 'San Isidro, Lima', planId: 1, subscription: { startDate: '2026-02-01', endDate: '2027-02-01', status: 'active', autoRenew: true } }
];

/** Provider company id used by every service request / technician (the wizard hard-codes companyId 1, which would be "Supermercados ABC"). */
export const DEMO_PROVIDER_ID = 3;

// Demo accounts. Passwords never leave this module; `login` is what the sign-in form sends as username.
export const accounts = [
  { id: 1, login: 'pedro@demo.local', username: 'Pedro', userType: 'Owner', profileId: 1, balance: 250.0, planId: 2, maxUnits: 12, email: 'pedro@demo.local', memberSince: '2025-03-12' },
  { id: 2, login: 'tecnofrio@demo.local', username: 'TecnoFrio', userType: 'Provider', profileId: 2, balance: 1280.5, planId: 5, maxClients: 30, companyName: 'TecnoFrio S.A.C.', taxId: '20512345678', email: 'info@tecnofrio.com', memberSince: '2024-08-01' },
  // Female demo users: Lucía (Owner) and Carmen (Provider).
  { id: 5, login: 'lucia@demo.local', username: 'Lucía', userType: 'Owner', profileId: 3, balance: 180.0, planId: 3, maxUnits: 24, email: 'lucia@demo.local', memberSince: '2025-06-20' },
  { id: 6, login: 'carmen@demo.local', username: 'Carmen', userType: 'Provider', profileId: 4, balance: 940.0, planId: 6, maxClients: 60, companyName: 'FríoSur E.I.R.L.', taxId: '20598765432', email: 'carmen@demo.local', memberSince: '2024-11-05' },
  // Technician logins (field staff of TecnoFrio). The real backend only has Owner/Provider types, so this is a demo-only
  // third type; `technicianId` points at the row in state.technicians that owns the work orders.
  { id: 7, login: 'ana.tecnica@demo.local', username: 'Ana García', userType: 'Technician', technicianId: 2, profileId: 2, companyName: 'TecnoFrio S.A.C.', email: 'ana@tecnico.com', memberSince: '2025-01-15' },
  { id: 8, login: 'rosa.tecnica@demo.local', username: 'Rosa Paredes', userType: 'Technician', technicianId: 4, profileId: 4, companyName: 'TecnoFrio S.A.C.', email: 'rosa@tecnico.com', memberSince: '2025-09-01' }
];
export const DEMO_PASSWORD = 'Demo123!';

// db.json `users` rows (legacy individual / company admin). Kept as records; passwords are never exposed.
export const legacyUsers = [
  { id: 3, name: 'Juan Pérez', email: 'juan@ejemplo.com', username: 'juanp', phone: '987654321', type: 'individual', planId: 1, subscription: { startDate: '2026-07-04', endDate: '2027-07-04', status: 'active', autoRenew: true } },
  { id: 4, name: 'María Rodríguez', email: 'maria@empresa.com', username: 'mariar', phone: '987654322', type: 'company_admin', companyId: 1 }
];

export const contactInfo = {
  company: 'CoolFreeze', product: 'OsitoPolar', email: 'contacto@coolfreeze.com', phone: '+51 987 654 321',
  address: 'Av. La Marina 123, Lima, Perú', hours: 'Lun-Vie 9:00-18:00, Sáb 9:00-13:00',
  social: [{ name: 'Facebook', url: 'https://facebook.com/coolfreeze' }, { name: 'Instagram', url: 'https://instagram.com/coolfreeze' }, { name: 'LinkedIn', url: 'https://linkedin.com/company/coolfreeze' }, { name: 'Twitter', url: 'https://twitter.com/coolfreeze' }]
};
