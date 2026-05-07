// Mandi data service – mock-first, easy to swap with real AGMARKNET API later.
// All data is scoped to Maharashtra.

export type Trend = "increasing" | "decreasing" | "stable";

export interface MandiPriceRecord {
  crop: string;
  apmc: string;
  date: string; // ISO
  modal: number;
  min: number;
  max: number;
}

export const CROPS = ["Onion", "Tomato", "Wheat", "Soybean", "Cotton", "Potato", "Bajra", "Gram"];

export const APMCS = [
  "Pune",
  "Nashik",
  "Aurangabad",
  "Nagpur",
  "Mumbai",
  "Kolhapur",
  "Solapur",
  "Ahmednagar",
  "Latur",
  "Amravati",
];

// Crop base price (₹/quintal) – realistic 2024-ish ranges
const CROP_BASE: Record<string, number> = {
  Onion: 1800,
  Tomato: 1500,
  Wheat: 2400,
  Soybean: 4600,
  Cotton: 7200,
  Potato: 1300,
  Bajra: 2200,
  Gram: 5400,
};

// APMC multiplier – some markets pay more
const APMC_MULT: Record<string, number> = {
  Pune: 1.08,
  Nashik: 1.12,
  Aurangabad: 0.96,
  Nagpur: 0.98,
  Mumbai: 1.18,
  Kolhapur: 1.04,
  Solapur: 0.94,
  Ahmednagar: 1.0,
  Latur: 0.92,
  Amravati: 0.97,
};

// deterministic pseudo-random
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function dateNDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Time series for a crop+apmc over last `days` days (modal price). */
export async function getCropTrend(crop: string, days: number, apmc?: string): Promise<{ date: string; modal: number }[]> {
  const base = CROP_BASE[crop] ?? 2000;
  const mult = apmc ? (APMC_MULT[apmc] ?? 1) : 1;
  const rnd = seeded(hash(crop + (apmc ?? "MH")));
  const points: { date: string; modal: number }[] = [];
  // gentle trend direction
  const drift = (rnd() - 0.5) * 0.012; // up to ±0.6% per day
  for (let i = days - 1; i >= 0; i--) {
    const noise = (rnd() - 0.5) * 0.06;
    const factor = 1 + drift * (days - i) + noise;
    const modal = Math.round(base * mult * factor);
    points.push({ date: fmt(dateNDaysAgo(i)), modal });
  }
  return points;
}

/** Latest snapshot across all APMCs for the given crop. */
export async function getLatestByApmc(crop: string): Promise<MandiPriceRecord[]> {
  const base = CROP_BASE[crop] ?? 2000;
  const today = fmt(new Date());
  return APMCS.map((apmc) => {
    const rnd = seeded(hash(crop + apmc + today));
    const mult = APMC_MULT[apmc] ?? 1;
    const modal = Math.round(base * mult * (1 + (rnd() - 0.5) * 0.08));
    const spread = Math.round(modal * (0.06 + rnd() * 0.06));
    return {
      crop,
      apmc,
      date: today,
      modal,
      min: modal - spread,
      max: modal + spread,
    };
  });
}

/** Single APMC latest record. */
export async function getLatestForApmc(crop: string, apmc: string): Promise<MandiPriceRecord> {
  const all = await getLatestByApmc(crop);
  return all.find((r) => r.apmc === apmc) ?? all[0];
}

/** Compute trend label from a series. */
export function computeTrend(series: { modal: number }[]): Trend {
  if (series.length < 2) return "stable";
  const first = series.slice(0, Math.max(1, Math.floor(series.length / 3))).reduce((a, b) => a + b.modal, 0) /
    Math.max(1, Math.floor(series.length / 3));
  const last = series.slice(-Math.max(1, Math.floor(series.length / 3))).reduce((a, b) => a + b.modal, 0) /
    Math.max(1, Math.floor(series.length / 3));
  const pct = (last - first) / first;
  if (pct > 0.02) return "increasing";
  if (pct < -0.02) return "decreasing";
  return "stable";
}

export const STATE_NAME = "Maharashtra";