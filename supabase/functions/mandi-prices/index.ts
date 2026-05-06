import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DATA_GOV_ENDPOINT = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
const PUBLIC_API_KEY = Deno.env.get("DATA_GOV_IN_API_KEY") ?? "579b464db66ec23bdd000001";

type MandiRecord = {
  crop: string; market: string; district: string; state: string; date: string;
  modalPrice: number | null; minPrice: number | null; maxPrice: number | null; variety: string;
};

const toIsoDate = (value: string) => {
  const parts = value.split("/");
  if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  return value;
};
const toAgmarkDate = (value: string) => {
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};
const parsePrice = (v: unknown) => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mapRecord = (item: Record<string, unknown>, fallbackCrop: string): MandiRecord => ({
  crop: String(item.commodity ?? fallbackCrop).trim(),
  market: String(item.market ?? "Unknown mandi").trim(),
  district: String(item.district ?? "Unknown district").trim(),
  state: String(item.state ?? "Unknown state").trim(),
  date: toIsoDate(String(item.arrival_date ?? "")),
  modalPrice: parsePrice(item.modal_price),
  minPrice: parsePrice(item.min_price),
  maxPrice: parsePrice(item.max_price),
  variety: String(item.variety ?? "").trim(),
});

const fetchPage = async (params: URLSearchParams, retries = 3): Promise<Record<string, unknown>[]> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(`${DATA_GOV_ENDPOINT}?${params.toString()}`);
    if (res.status === 429) {
      await sleep(600 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`data.gov.in ${res.status}`);
    const payload = await res.json();
    return Array.isArray(payload.records) ? payload.records : [];
  }
  return [];
};

const buildParams = (crop: string, scope: string, state: string, district: string, extras: Record<string, string> = {}) => {
  const p = new URLSearchParams({
    "api-key": PUBLIC_API_KEY,
    format: "json",
    limit: "1000",
    offset: "0",
    "filters[commodity]": crop,
    ...extras,
  });
  if (scope !== "India" && state) p.set("filters[state]", state);
  if (district && district !== "All") p.set("filters[district]", district);
  return p;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const crop = String(body.crop ?? "Onion").trim().slice(0, 80);
    const startDate = String(body.startDate ?? "");
    const endDate = String(body.endDate ?? "");
    const state = String(body.state ?? "").trim().slice(0, 80);
    const district = String(body.district ?? "").trim().slice(0, 80);
    const scope = body.scope === "India" ? "India" : "State";

    if (!crop) {
      return new Response(JSON.stringify({ error: "Crop required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 1) LATEST snapshot for comparison: fetch without date filter (API returns recent records)
    const latestRows = await fetchPage(buildParams(crop, scope, state, district));
    let latestDate: string | undefined;
    for (const r of latestRows) {
      const d = toIsoDate(String(r.arrival_date ?? ""));
      if (d && (!latestDate || d > latestDate)) latestDate = d;
    }
    const latestRecords = latestRows
      .map((r) => mapRecord(r, crop))
      .filter((r) => r.modalPrice !== null && r.date === latestDate);

    // 2) HISTORICAL trend: sequentially walk dates in range (max 14 days) with delay
    const historicalRecords: MandiRecord[] = [];
    if (/^\d{4}-\d{2}-\d{2}$/.test(startDate) && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T00:00:00`);
      const days: string[] = [];
      for (const c = new Date(start); c <= end && days.length < 14; c.setDate(c.getDate() + 1)) {
        days.push(c.toISOString().slice(0, 10));
      }
      for (const day of days) {
        try {
          const rows = await fetchPage(buildParams(crop, scope, state, district, { "filters[arrival_date]": toAgmarkDate(day) }));
          historicalRecords.push(...rows.map((r) => mapRecord(r, crop)).filter((r) => r.modalPrice !== null));
          await sleep(150);
        } catch (e) {
          console.warn(`day ${day} failed`, e);
        }
      }
    }

    const all = [...latestRecords, ...historicalRecords];
    const unique = Array.from(new Map(all.map((r) => [`${r.date}-${r.state}-${r.district}-${r.market}-${r.variety}-${r.modalPrice}`, r])).values());

    return new Response(JSON.stringify({
      records: unique,
      source: "data.gov.in AGMARKNET API",
      latestAvailableDate: latestDate,
      usedLatestAvailable: latestDate ? latestDate < endDate : false,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("mandi-prices error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
