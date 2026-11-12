// Technician-side seed: per service type checklists and a synthetic tools/parts stock per technician.
// ngl the stock is pure made-up demo data, nothing here comes from db.json or the backend.

const STEPS = {
  Maintenance: ['Revisar el estado general del equipo', 'Limpiar condensador y evaporador', 'Verificar sellos y puertas', 'Medir temperatura y consumo', 'Registrar lecturas finales'],
  Repair: ['Diagnosticar la falla reportada', 'Aislar el equipo y asegurar la mercadería', 'Reemplazar el componente dañado', 'Probar el ciclo de enfriamiento', 'Confirmar con el cliente'],
  Installation: ['Verificar espacio y conexión eléctrica', 'Instalar y nivelar el equipo', 'Cargar refrigerante y probar fugas', 'Calibrar el termostato', 'Capacitar al cliente'],
  Inspection: ['Revisar el historial del equipo', 'Medir temperatura interna', 'Medir consumo eléctrico', 'Inspeccionar el compresor', 'Redactar el informe'],
  Emergency: ['Evaluar la falla en sitio', 'Proteger la mercadería almacenada', 'Aplicar la reparación de contingencia', 'Verificar la temperatura estable', 'Programar seguimiento']
};

/** Checklist rows for a service type; `done` ticks the first N items (seed only). */
export function checklistFor(serviceType, done = 0) {
  return (STEPS[serviceType] || STEPS.Maintenance).map((label, i) => ({ id: `c${i + 1}`, label, done: i < done }));
}
/** How many items a seeded order already has ticked, by status. */
export const doneFor = (status, serviceType) => ['completed', 'resolved'].includes(status) ? (STEPS[serviceType] || STEPS.Maintenance).length : status === 'in_progress' ? 2 : 0;

// [technicianId, kind, name, sku, quantity, minQuantity, unit]
const STOCK = [
  [2, 'tool', 'Manómetros de refrigerante (juego)', 'TL-MAN-01', 2, 1, 'u'],
  [2, 'tool', 'Detector electrónico de fugas', 'TL-DET-02', 1, 1, 'u'],
  [2, 'tool', 'Multímetro con pinza', 'TL-MUL-03', 1, 1, 'u'],
  [2, 'tool', 'Bomba de vacío 5 CFM', 'TL-VAC-04', 1, 1, 'u'],
  [2, 'part', 'Contactor 2P 25 A', 'PT-CON-10', 3, 2, 'u'],
  [2, 'part', 'Motor de ventilador del evaporador', 'PT-VEN-11', 1, 2, 'u'],
  [2, 'part', 'Filtro deshidratador 3/8"', 'PT-FIL-12', 8, 4, 'u'],
  [2, 'part', 'Gas refrigerante R404A', 'PT-R404-13', 6.5, 3, 'kg'],
  [4, 'tool', 'Kit de abocardador y cortatubos', 'TL-ABO-21', 1, 1, 'u'],
  [4, 'tool', 'Soldadora oxiacetilénica portátil', 'TL-SOL-22', 1, 1, 'u'],
  [4, 'tool', 'Termómetro infrarrojo', 'TL-TER-23', 2, 1, 'u'],
  [4, 'tool', 'Balanza de carga de gas', 'TL-BAL-24', 1, 1, 'u'],
  [4, 'part', 'Gas refrigerante R134a', 'PT-R134-30', 2, 4, 'kg'],
  [4, 'part', 'Aislante de espuma 3/4"', 'PT-AIS-31', 24, 10, 'm'],
  [4, 'part', 'Termostato digital con sonda', 'PT-TER-32', 4, 2, 'u'],
  [4, 'part', 'Burlete de puerta (cámara)', 'PT-BUR-33', 1, 3, 'm']
];
export const technicianInventory = () => STOCK.map(([technicianId, kind, name, sku, quantity, minQuantity, unit], i) => ({ id: i + 1, technicianId, kind, name, sku, quantity, minQuantity, unit }));
