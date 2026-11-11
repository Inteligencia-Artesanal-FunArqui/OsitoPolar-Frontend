// Inline SVG data URIs: the demo never touches the network, and the legacy /assets/images/*.jpg paths do not exist.
const PALETTE = {
  cold_room: ['#0b6fa8', '#7cc4ec'], accessory: ['#4b5d6b', '#aab8c2'], water_cooler: ['#0e8f8a', '#8fdcd6'],
  air_conditioner: ['#5a67c9', '#b4bcf0'], freezer: ['#13478c', '#79a8e6'], refrigerator: ['#2c7a4b', '#9bd8b2']
};
const GLYPH = {
  cold_room: '<rect x="70" y="50" width="100" height="80" rx="6"/><rect x="108" y="70" width="24" height="60" rx="3" fill-opacity=".35"/>',
  accessory: '<rect x="70" y="40" width="100" height="100" rx="4"/><path d="M120 40v100" stroke="#fff" stroke-width="4"/>',
  water_cooler: '<rect x="95" y="40" width="50" height="95" rx="8"/><circle cx="120" cy="65" r="10" fill-opacity=".35"/>',
  air_conditioner: '<rect x="60" y="60" width="120" height="50" rx="10"/><path d="M80 120l-8 14M120 120v16M160 120l8 14" stroke="#fff" stroke-width="4" stroke-linecap="round"/>',
  freezer: '<rect x="55" y="70" width="130" height="60" rx="6"/><path d="M120 70v60" stroke="#fff" stroke-width="3"/>',
  refrigerator: '<rect x="85" y="35" width="70" height="105" rx="6"/><path d="M85 80h70" stroke="#fff" stroke-width="3"/>'
};

/** Decorative placeholder illustration for a rental type. */
export function rentalImage(type, label = '') {
  const [a, b] = PALETTE[type] || PALETTE.freezer;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="240" height="180" fill="url(#g)"/><g fill="#fff" fill-opacity=".9">${GLYPH[type] || GLYPH.freezer}</g><text x="120" y="165" font-family="sans-serif" font-size="11" fill="#fff" text-anchor="middle">${label.replace(/[<&>]/g, '')}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
