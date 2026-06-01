const MARKET_MAP: Record<string, string[]> = {
  // Nashik Division
  Sinnar: ["Sinner", "Sinnar"],
  Nashik: ["Nashik", "Nasik"],
  Lasalgaon: ["Lasalgaon"],
  "Pimpalgaon Baswant": ["Pimpalgaon", "Pimpalgaon Baswant", "Baswant"],
  Yeola: ["Yeola"],
  Niphad: ["Niphad"],
  Manmad: ["Manmad"],
  Chandvad: ["Chandwad", "Chandvad"],
  Malegaon: ["Malegaon"],
  // Pune Division
  Pune: ["Pune", "Poona"],
  Baramati: ["Baramati"],
  Indapur: ["Indapur"],
  Bhosari: ["Bhosari"],
  Chakan: ["Chakan"],
  Khadki: ["Khadki"],
  Saswad: ["Saswad"],
  Junnar: ["Junnar"],
  // Nagpur / Amravati Division
  Nagpur: ["Nagpur"],
  Wardha: ["Wardha"],
  Amravati: ["Amravati", "Amrawati"],
  Yavatmal: ["Yavatmal", "Yeotmal"],
  Akola: ["Akola"],
  Achalpur: ["Achalpur"],
  Washim: ["Washim"],
  Hinganghat: ["Hinganghat"],
  // Aurangabad Division
  Aurangabad: ["Aurangabad", "Sambhajinagar"],
  Jalna: ["Jalna"],
  Beed: ["Beed"],
  Latur: ["Latur"],
  Osmanabad: ["Osmanabad", "Dharashiv"],
  Nanded: ["Nanded"],
  Parbhani: ["Parbhani"],
  Hingoli: ["Hingoli"],
  // Kolhapur / Sangli Division
  Kolhapur: ["Kolhapur"],
  Sangli: ["Sangli"],
  Ichalkaranji: ["Ichalkaranji"],
  Karad: ["Karad"],
  Miraj: ["Miraj"],
  Tasgaon: ["Tasgaon"],
  Kagal: ["Kagal"],
  // Solapur Division
  Solapur: ["Solapur", "Sholapur"],
  Pandharpur: ["Pandharpur"],
  Akkalkot: ["Akkalkot"],
  Barshi: ["Barshi"],
  Sangola: ["Sangola"],
  // Ahmednagar Division
  Ahmednagar: ["Ahmednagar", "Ahilyanagar"],
  Shrirampur: ["Shrirampur", "Shree Rampur"],
  Rahuri: ["Rahuri"],
  Pathardi: ["Pathardi"],
  Kopargaon: ["Kopargaon"],
  Shevgaon: ["Shevgaon"],
  // Jalgaon / Dhule Division
  Jalgaon: ["Jalgaon"],
  Bhusawal: ["Bhusawal"],
  Chalisgaon: ["Chalisgaon"],
  Pachora: ["Pachora"],
  Jamner: ["Jamner"],
  Erandol: ["Erandol"],
  Dhule: ["Dhule"],
  Nandurbar: ["Nandurbar"],
  Shirpur: ["Shirpur"],
  Dondaicha: ["Dondaicha"],
  // Mumbai / Thane Division
  Mumbai: ["Mumbai", "Bombay"],
  Vashi: ["Vashi"],
  Thane: ["Thane"],
  Kalyan: ["Kalyan"],
  Bhiwandi: ["Bhiwandi"],
  Vasai: ["Vasai"],
  // Ratnagiri / Sindhudurg
  Ratnagiri: ["Ratnagiri"],
  Sangameshwar: ["Sangameshwar"],
  Kankavli: ["Kankavli"],
  Kudal: ["Kudal"],
  // Satara / Sangli
  Satara: ["Satara"],
  Wai: ["Wai"],
  Phaltan: ["Phaltan"],
  Vita: ["Vita"],
  Islampur: ["Islampur"],
  // Chandrapur / Gadchiroli
  Chandrapur: ["Chandrapur"],
  Ballarpur: ["Ballarpur"],
  Gadchiroli: ["Gadchiroli"],
  Warora: ["Warora"],
  // Gondia / Bhandara
  Gondia: ["Gondia"],
  Bhandara: ["Bhandara"],
  // Buldhana
  Buldhana: ["Buldhana"],
  Malkapur: ["Malkapur"],
  Khamgaon: ["Khamgaon"],
  // Palghar
  Palghar: ["Palghar"],
  Dahanu: ["Dahanu"],
  Boisar: ["Boisar"],
};

export const ALLOWED_APMCS = Object.keys(MARKET_MAP);

const LOOKUP = new Map<string, string>();
for (const [canonical, aliases] of Object.entries(MARKET_MAP)) {
  for (const alias of aliases) LOOKUP.set(alias.trim().toLowerCase(), canonical);
}

export function normalizeMarket(apiMarketName: string): string | null {
  if (!apiMarketName) return null;
  // Strip common suffixes like " APMC", "(Pimpri)" etc.
  const trimmed = apiMarketName
    .replace(/\bAPMC\b/gi, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!trimmed) return null;
  const canonical = LOOKUP.get(trimmed.toLowerCase());
  if (canonical) return canonical;
  // Fallback: accept any Maharashtra market so the dashboard isn't empty
  // when the preferred Nashik APMCs haven't reported yet.
  return trimmed
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}