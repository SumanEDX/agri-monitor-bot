import { normalizeMarket } from "./marketNormalizer";

export const ALLOWED_CROPS = [
  "Onion",
  "Tomato",
  "Potato",
  "Wheat",
  "Soybean",
  "Grapes",
  "Pomegranate",
  "Green Chilli",
  "Bajra",
  "Maize",
  "Gram",
];

const CROP_LOOKUP = new Map(ALLOWED_CROPS.map((c) => [c.toLowerCase(), c]));

export interface CleanRecord {
  market: string;
  commodity: string;
  date: Date;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

const toNum = (v: unknown): number => {
  const n = Number(String(v ?? "").replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

const parseDate = (v: unknown): Date | null => {
  const s = String(v ?? "").trim();
  if (!s) return null;
  if (s.includes("/")) {
    const [d, m, y] = s.split("/");
    const dt = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    return isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt;
};

const normalizeCrop = (raw: string): string | null => {
  const lower = raw.trim().toLowerCase();
  if (CROP_LOOKUP.has(lower)) return CROP_LOOKUP.get(lower)!;
  for (const [key, canonical] of CROP_LOOKUP) {
    if (lower.includes(key) || key.includes(lower)) return canonical;
  }
  return null;
};

const median = (arr: number[]): number => {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function cleanRecords(raw: any[]): { records: CleanRecord[]; latestDate: string } {
  const groups = new Map<string, CleanRecord[]>();

  for (const r of raw) {
    const date = parseDate(r.arrival_date);
    if (!date) continue;
    const modalPrice = toNum(r.modal_price);
    if (!modalPrice || isNaN(modalPrice)) continue;
    const market = normalizeMarket(String(r.market ?? ""));
    if (!market) continue;
    const commodity = normalizeCrop(String(r.commodity ?? ""));
    if (!commodity) continue;

    const rec: CleanRecord = {
      market,
      commodity,
      date,
      minPrice: toNum(r.min_price),
      maxPrice: toNum(r.max_price),
      modalPrice,
    };
    const key = `${market}|${commodity}|${date.toISOString().slice(0, 10)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(rec);
  }

  const records: CleanRecord[] = [];
  for (const list of groups.values()) {
    if (list.length === 1) {
      records.push(list[0]);
    } else {
      const modal = median(list.map((r) => r.modalPrice));
      const min = median(list.map((r) => r.minPrice).filter((n) => !isNaN(n)));
      const max = median(list.map((r) => r.maxPrice).filter((n) => !isNaN(n)));
      records.push({ ...list[0], modalPrice: modal, minPrice: min, maxPrice: max });
    }
  }

  let latestDate = "";
  for (const r of records) {
    const iso = r.date.toISOString().slice(0, 10);
    if (iso > latestDate) latestDate = iso;
  }
  return { records, latestDate };
}