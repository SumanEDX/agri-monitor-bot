// Mandi data service – AGMARKNET (data.gov.in) via Supabase Edge Function proxy.
// Scoped to Maharashtra.

import { supabase } from "@/integrations/supabase/client";

export type Trend = "increasing" | "decreasing" | "stable";

export interface RawApiRecord {
  commodity: string;
  commodityRaw: string;
  variety: string;
  market: string;
  district: string;
  state: string;
  arrival_date: string; // ISO yyyy-mm-dd
  modal_price: number | null;
  min_price: number | null;
  max_price: number | null;
}

export interface MandiPriceRecord {
  crop: string;
  apmc: string;
  district: string;
  date: string;
  modal: number;
  min: number;
  max: number;
  variety: string;
}

export const STATE_NAME = "Maharashtra";

// Fallback list (used if the dynamic commodity fetch fails)
export const FALLBACK_CROPS = ["Onion", "Tomato", "Potato", "Wheat", "Soybean", "Cotton", "Bajra", "Gram", "Maize", "Jowar"];

interface FetchResult {
  records: RawApiRecord[];
  latestDate: string | null;
  markets: string[];
}

const cache = new Map<string, { ts: number; data: FetchResult }>();
const TTL_MS = 5 * 60 * 1000;

async function callEdge<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("mandi-prices", { body });
  if (error) throw new Error(error.message ?? "Edge function failed");
  if (data?.error) throw new Error(data.error);
  return data as T;
}

/** Fetch all Maharashtra records for a commodity, normalized & cleaned. */
export async function fetchCommodityData(commodity: string): Promise<FetchResult> {
  const key = commodity.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL_MS) return hit.data;

  const res = await callEdge<{ records: RawApiRecord[]; latestDate: string | null; markets: string[] }>({
    action: "data",
    commodity,
  });
  const cleaned = (res.records ?? [])
    .filter((r) => r.modal_price != null && r.arrival_date && r.market && r.district)
    .map((r) => ({
      ...r,
      modal_price: Number(r.modal_price),
      min_price: r.min_price != null ? Number(r.min_price) : null,
      max_price: r.max_price != null ? Number(r.max_price) : null,
    }));
  const latestDate = cleaned.reduce<string | null>((acc, r) => (!acc || r.arrival_date > acc ? r.arrival_date : acc), null);
  const markets = Array.from(new Set(cleaned.map((r) => r.market))).sort();
  const out = { records: cleaned, latestDate, markets };
  cache.set(key, { ts: Date.now(), data: out });
  return out;
}

/** Available commodities currently reported in Maharashtra. */
export async function fetchCommodities(): Promise<string[]> {
  try {
    const res = await callEdge<{ commodities: string[] }>({ action: "commodities" });
    const list = res.commodities ?? [];
    return list.length ? list : FALLBACK_CROPS;
  } catch {
    return FALLBACK_CROPS;
  }
}

const toRecord = (r: RawApiRecord): MandiPriceRecord => ({
  crop: r.commodity,
  apmc: r.market,
  district: r.district,
  date: r.arrival_date,
  modal: r.modal_price as number,
  min: r.min_price ?? (r.modal_price as number),
  max: r.max_price ?? (r.modal_price as number),
  variety: r.variety,
});

/** Latest snapshot (only most recent arrival_date) for the commodity, one row per APMC. */
export async function getLatestByApmc(commodity: string): Promise<MandiPriceRecord[]> {
  const { records, latestDate } = await fetchCommodityData(commodity);
  if (!latestDate) return [];
  const latest = records.filter((r) => r.arrival_date === latestDate);
  // collapse to one row per market (avg modal across varieties)
  const byMarket = new Map<string, RawApiRecord[]>();
  for (const r of latest) {
    const arr = byMarket.get(r.market) ?? [];
    arr.push(r);
    byMarket.set(r.market, arr);
  }
  return Array.from(byMarket.entries()).map(([market, rows]) => {
    const modal = Math.round(rows.reduce((s, r) => s + (r.modal_price ?? 0), 0) / rows.length);
    const min = Math.min(...rows.map((r) => r.min_price ?? r.modal_price ?? Infinity));
    const max = Math.max(...rows.map((r) => r.max_price ?? r.modal_price ?? 0));
    const sample = rows[0];
    return {
      crop: sample.commodity,
      apmc: market,
      district: sample.district,
      date: sample.arrival_date,
      modal,
      min: Number.isFinite(min) ? min : modal,
      max: max || modal,
      variety: sample.variety,
    };
  });
}

/** Latest record for a specific APMC. */
export async function getLatestForApmc(commodity: string, apmc: string): Promise<MandiPriceRecord | null> {
  const all = await getLatestByApmc(commodity);
  return all.find((r) => r.apmc === apmc) ?? all[0] ?? null;
}

/** Historical state-wide average trend (last `days` days), optionally restricted to one APMC. */
export async function getCropTrend(
  commodity: string,
  days: number,
  apmc?: string,
): Promise<{ date: string; modal: number }[]> {
  const { records, latestDate } = await fetchCommodityData(commodity);
  if (!latestDate) return [];
  const cutoff = new Date(latestDate);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const filtered = records.filter((r) => r.arrival_date >= cutoffStr && (!apmc || r.market === apmc));
  // average per day
  const byDay = new Map<string, number[]>();
  for (const r of filtered) {
    const arr = byDay.get(r.arrival_date) ?? [];
    arr.push(r.modal_price as number);
    byDay.set(r.arrival_date, arr);
  }
  return Array.from(byDay.entries())
    .map(([date, prices]) => ({ date, modal: Math.round(prices.reduce((s, p) => s + p, 0) / prices.length) }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

/** Available APMCs reporting the given commodity. */
export async function getApmcs(commodity: string): Promise<string[]> {
  const { markets } = await fetchCommodityData(commodity);
  return markets;
}

/** Trend label from a series. */
export function computeTrend(series: { modal: number }[]): Trend {
  if (series.length < 2) return "stable";
  const head = Math.max(1, Math.floor(series.length / 3));
  const first = series.slice(0, head).reduce((a, b) => a + b.modal, 0) / head;
  const last = series.slice(-head).reduce((a, b) => a + b.modal, 0) / head;
  const pct = (last - first) / first;
  if (pct > 0.02) return "increasing";
  if (pct < -0.02) return "decreasing";
  return "stable";
}
