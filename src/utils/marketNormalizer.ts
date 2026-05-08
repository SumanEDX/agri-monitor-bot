const MARKET_MAP: Record<string, string[]> = {
  Sinnar: ["Sinner", "Sinnar"],
  Nasik: ["Nashik", "Nasik"],
  Lasalgaon: ["Lasalgaon"],
  Pimpalgaon: ["Pimpalgaon", "Pimpalgaon Baswant"],
  Baswant: ["Baswant"],
  Chandvad: ["Chandwad", "Chandvad"],
  Manmad: ["Manmad"],
  Yeola: ["Yeola"],
  Malegaon: ["Malegaon"],
};

export const ALLOWED_APMCS = Object.keys(MARKET_MAP);

const LOOKUP = new Map<string, string>();
for (const [canonical, aliases] of Object.entries(MARKET_MAP)) {
  for (const alias of aliases) LOOKUP.set(alias.trim().toLowerCase(), canonical);
}

export function normalizeMarket(apiMarketName: string): string | null {
  if (!apiMarketName) return null;
  return LOOKUP.get(apiMarketName.trim().toLowerCase()) ?? null;
}