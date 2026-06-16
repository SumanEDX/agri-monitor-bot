import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ENDPOINT = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
const API_KEY = Deno.env.get("DATA_GOV_IN_API_KEY") ?? "579b464db66ec23bdd000001";

type Raw = Record<string, unknown>;
type Record_ = {
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
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const toIso = (v: string) => {
  const p = v.split("/");
  if (p.length === 3) return `${p[2]}-${p[1].padStart(2, "0")}-${p[0].padStart(2, "0")}`;
  return v;
};
const num = (v: unknown) => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

// Normalize commodity variants (e.g. "Onion Red" -> "Onion")
const normalizeCommodity = (raw: string) => {
  const r = raw.trim();
  const lower = r.toLowerCase();
  const bases = ["onion", "tomato", "potato", "wheat", "pearl millet", "bajra", "gram", "maize", "jowar", "rice", "groundnut", "sugarcane"];
  for (const b of bases) if (lower.includes(b)) return b.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return r;
};

const map = (r: Raw): Record_ => {
  const raw = String(r.commodity ?? "").trim();
  return {
    commodityRaw: raw,
    commodity: normalizeCommodity(raw),
    variety: String(r.variety ?? "").trim(),
    market: String(r.market ?? "").trim(),
    district: String(r.district ?? "").trim(),
    state: String(r.state ?? "").trim(),
    arrival_date: toIso(String(r.arrival_date ?? "")),
    modal_price: num(r.modal_price),
    min_price: num(r.min_price),
    max_price: num(r.max_price),
  };
};

async function fetchPage(params: URLSearchParams, retries = 4): Promise<Raw[]> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(`${ENDPOINT}?${params}`);
    const text = await res.text();
    let payload: { records?: unknown[]; error?: string } = {};
    try { payload = JSON.parse(text); } catch { /* */ }
    if (res.status === 429 || (payload.error && /rate limit/i.test(payload.error))) {
      await sleep(1200 * (i + 1));
      continue;
    }
    if (!res.ok) throw new Error(`data.gov.in ${res.status}`);
    return Array.isArray(payload.records) ? (payload.records as Raw[]) : [];
  }
  return [];
}

async function fetchAllForCommodity(commodity: string, maxPages = 6): Promise<Record_[]> {
  // Server-side filter by state=Maharashtra + commodity, sorted desc by arrival_date.
  const out: Record_[] = [];
  for (let p = 0; p < maxPages; p++) {
    const params = new URLSearchParams({
      "api-key": API_KEY,
      format: "json",
      limit: "1000",
      offset: String(p * 1000),
      "filters[state]": "Maharashtra",
      "filters[commodity]": commodity,
    });
    const rows = await fetchPage(params);
    out.push(...rows.map(map).filter((r) => r.modal_price !== null && r.arrival_date));
    if (rows.length < 1000) break;
    await sleep(150);
  }
  return out;
}

const toDdmmyyyy = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

async function fetchHistorical(commodity: string, days: number, apmc?: string): Promise<Record_[]> {
  // data.gov.in resource only keeps a small window per request; fetch each date explicitly.
  const today = new Date();
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const results: Record_[] = [];
  // Run in small concurrent batches to avoid rate limits
  const batchSize = 4;
  for (let i = 0; i < dates.length; i += batchSize) {
    const batch = dates.slice(i, i + batchSize);
    const pages = await Promise.all(
      batch.map((iso) => {
        const params = new URLSearchParams({
          "api-key": API_KEY,
          format: "json",
          limit: "1000",
          offset: "0",
          "filters[state]": "Maharashtra",
          "filters[commodity]": commodity,
          "filters[arrival_date]": toDdmmyyyy(iso),
        });
        if (apmc) params.append("filters[market]", apmc);
        return fetchPage(params).catch(() => []);
      }),
    );
    for (const rows of pages) {
      results.push(...rows.map(map).filter((r) => r.modal_price !== null && r.arrival_date));
    }
    await sleep(120);
  }
  return results;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action = String(body.action ?? "data");

    if (action === "commodities") {
      // List commodities currently reported in Maharashtra (most recent page)
      const params = new URLSearchParams({
        "api-key": API_KEY, format: "json", limit: "1000", offset: "0",
      "filters[state]": "Maharashtra",
      });
      const rows = (await fetchPage(params)).map(map);
      const set = new Set(rows.map((r) => r.commodity).filter(Boolean));
      return Response.json(
        { commodities: Array.from(set).sort() },
        { headers: corsHeaders },
      );
    }

    if (action === "historical") {
      const commodity = String(body.commodity ?? "Onion").trim().slice(0, 80);
      const days = Math.min(60, Math.max(1, Number(body.days ?? 30)));
      const apmc = body.apmc ? String(body.apmc).trim().slice(0, 80) : undefined;

      // Read from our own snapshot table — the upstream API only serves today's data.
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const since = new Date();
      since.setDate(since.getDate() - (days - 1));
      const sinceIso = since.toISOString().slice(0, 10);

      let q = supabase
        .from("mandi_price_history")
        .select("arrival_date, modal_price, market")
        .eq("commodity", commodity)
        .gte("arrival_date", sinceIso)
        .order("arrival_date", { ascending: true })
        .limit(10000);
      if (apmc) q = q.eq("market", apmc);
      const { data: rows, error } = await q;
      if (error) throw new Error(error.message);

      const byDay = new Map<string, number[]>();
      for (const r of rows ?? []) {
        const arr = byDay.get(r.arrival_date as string) ?? [];
        if (r.modal_price != null) arr.push(r.modal_price as number);
        byDay.set(r.arrival_date as string, arr);
      }
      const series = Array.from(byDay.entries())
        .map(([date, prices]) => ({
          date,
          modal: Math.round(prices.reduce((s, p) => s + p, 0) / prices.length),
        }))
        .sort((a, b) => (a.date < b.date ? -1 : 1));
      return new Response(JSON.stringify({ series, count: rows?.length ?? 0, source: "snapshot" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: fetch records for a commodity in Maharashtra
    const commodity = String(body.commodity ?? body.crop ?? "Onion").trim().slice(0, 80);
    if (!commodity) {
      return new Response(JSON.stringify({ error: "commodity required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const records = await fetchAllForCommodity(commodity);
    const latestDate = records.reduce<string | null>((acc, r) => (!acc || r.arrival_date > acc ? r.arrival_date : acc), null);
    const markets = Array.from(new Set(records.map((r) => r.market).filter(Boolean))).sort();

    return new Response(
      JSON.stringify({
        records,
        latestDate,
        markets,
        count: records.length,
        source: "data.gov.in AGMARKNET",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("mandi-prices error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
