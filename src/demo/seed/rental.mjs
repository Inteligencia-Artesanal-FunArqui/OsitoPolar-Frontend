// Rental has NO real backend: legacy json-server shapes from db.json (/rentalEquipment, /rentalPricing, /rentalRequests).
// db.json items 1-4 are kept verbatim except imageUrl (inline SVG, the .jpg files do not exist). 5-6 add freezer and
// refrigerator rows so every catalog type filter returns something.
import { rentalImage } from './images.mjs';

const item = (id, name, type, model, manufacturer, monthlyPrice, description, technicalSpecs, minimumRentalPeriod, stock, features) =>
  ({ id: String(id), name, type, model, manufacturer, monthlyPrice, currency: '$', imageUrl: rentalImage(type, model), isAvailable: true, description, technicalSpecs, minimumRentalPeriod, stock, features });

export const rentalEquipment = [
  item(1, 'Cámara frigorífica modular', 'cold_room', 'CM-2000', 'CoolTech', 200, 'Cámara modular de fácil instalación', 'Capacidad 2000L, temperatura -5°C a 5°C', 3, 5, ['Instalación rápida', 'Bajo consumo', 'Control digital']),
  item(2, 'Puerta Corredera Frigorífica', 'accessory', 'PCF-100', 'FrigoTech', 99, 'Puerta corredera para cámaras frigoríficas', 'Ancho 1.2m, alto 2.1m, aislamiento 80mm', 1, 8, ['Cierre hermético', 'Fácil instalación', 'Ahorro energético']),
  item(3, 'Enfriadora de agua', 'water_cooler', 'EA-500', 'AquaCool', 200, 'Sistema de enfriamiento de agua industrial', 'Capacidad 500L/h, temperatura 2°C a 8°C', 6, 3, ['Alta capacidad', 'Eficiencia energética', 'Mantenimiento simple']),
  item(4, 'Climatizador de agua', 'air_conditioner', 'CA-300', 'ClimateTech', 99, 'Climatizador evaporativo para espacios industriales', 'Cobertura 300m², consumo 1.5kW', 1, 10, ['Bajo consumo', 'Ecológico', 'Silencioso']),
  item(5, 'Congeladora horizontal', 'freezer', 'CH-400', 'CoolTech', 130, 'Congeladora de cofre para cocinas y almacenes', 'Capacidad 400L, temperatura -24°C a -18°C', 3, 6, ['Congelación rápida', 'Cierre con llave', 'Ruedas']),
  item(6, 'Refrigerador vertical', 'refrigerator', 'RV-350', 'FrigoTech', 90, 'Refrigerador vertical de puerta de vidrio', 'Capacidad 350L, temperatura 2°C a 8°C', 1, 7, ['Puerta de vidrio', 'Iluminación LED', 'Termostato digital'])
];

const pricing = (id, rentalEquipmentId, baseMonthlyPrice, discounts, setupFee, deliveryFee, insuranceMonthlyFee) =>
  ({ id: String(id), rentalEquipmentId: String(rentalEquipmentId), baseMonthlyPrice, currency: '$', discounts, setupFee, deliveryFee, insuranceMonthlyFee });
export const rentalPricing = [
  pricing(1, 1, 200, [{ months: 6, percentage: 10 }, { months: 12, percentage: 15 }], 150, 50, 20),
  pricing(2, 2, 99, [{ months: 3, percentage: 5 }, { months: 6, percentage: 10 }], 50, 25, 10),
  pricing(3, 3, 200, [{ months: 6, percentage: 10 }, { months: 12, percentage: 15 }], 150, 50, 20),
  pricing(4, 4, 99, [{ months: 3, percentage: 5 }, { months: 6, percentage: 10 }], 50, 25, 10),
  pricing(5, 5, 130, [{ months: 6, percentage: 8 }, { months: 12, percentage: 12 }], 90, 40, 15),
  pricing(6, 6, 90, [{ months: 3, percentage: 5 }, { months: 6, percentage: 8 }], 40, 30, 10)
];
