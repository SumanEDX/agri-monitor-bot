import { supabase } from "@/integrations/supabase/client";
import { cleanRecords, type CleanRecord } from "@/utils/dataCleaner";

async function fetchRaw(crop: string, pages: number, limit = 500): Promise<any[]> {
  const { data, error } = await supabase.functions.invoke("nashik-mandi-proxy", {
    body: { commodity: crop, pages, limit },
  });
  if (error) throw new Error(error.message);
  return (data as any)?.records ?? [];
}

export async function fetchLatestData(crop: string): Promise<{ records: CleanRecord[]; latestDate: string }> {
  const raw = await fetchRaw(crop, 3, 500);
  const { records, latestDate } = cleanRecords(raw);
  if (!latestDate) return { records: [], latestDate: "" };
  const filtered = records.filter((r) => r.date.toISOString().slice(0, 10) === latestDate);
  return { records: filtered, latestDate };
}

export interface HistoricalPoint {
  date: string;
  avgModalPrice: number;
}

export async function fetchHistoricalData(crop: string, days: number): Promise<HistoricalPoint[]> {
  const raw = await fetchRaw(crop, 6, 500);
  const { records } = cleanRecords(raw);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const byDate = new Map<string, number[]>();
  for (const r of records) {
    if (r.date < cutoff) continue;
    const iso = r.date.toISOString().slice(0, 10);
    if (!byDate.has(iso)) byDate.set(iso, []);
    byDate.get(iso)!.push(r.modalPrice);
  }

  return Array.from(byDate.entries())
    .map(([date, prices]) => ({
      date,
      avgModalPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}