import { plans, providerPlans, providers, companies, legacyUsers } from './catalog.mjs';
import { equipment } from './equipment.mjs';
import { rentalEquipment, rentalPricing } from './rental.mjs';
import { buildOperations } from './operations.mjs';

export const STATE_VERSION = 3 // v3: work orders carry checklists + technicianInventory collection;

/**
 * Every collection of server/db.json is present. temperatureReadings / energyReadings / dailyTemperatureAverages are
 * generated on demand (see analytics.mjs) so charts always cover "the last 24 h / 7 days"; `readings` keeps the samples
 * the user POSTs.
 */
export function buildSeed(now = new Date()) {
  return {
    version: STATE_VERSION, seededAt: now.toISOString(),
    users: legacyUsers, companies, plans, providerPlans, providers,
    equipment: equipment.map(e => ({ ...e })), rentalEquipment: rentalEquipment.map(r => ({ ...r })), rentalPricing,
    rentalRequests: [], rentalContracts: [], rentalPayments: [], readings: [],
    ...buildOperations(now)
  };
}
