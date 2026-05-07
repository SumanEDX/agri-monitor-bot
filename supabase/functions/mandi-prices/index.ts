import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  const bases = ["onion", "tomato", "potato", "wheat", "soybean", "cotton", "bajra", "gram", "maize", "jowar", "rice", "groundnut", "sugarcane"];
  for (const b of bases) if (lower.includes(b)) return b.charAt(0).toUpperCase() + b.slice(1);
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
    if (i === 0) console.log("data.gov.in", res.status, "keylen", API_KEY.length, "preview", text.slice(0, 200));
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
      "sort[0][field]": "arrival_date",
      "sort[0][order]": "desc",
    });
    const rows = await fetchPage(params);
    out.push(...rows.map(map).filter((r) => r.modal_price !== null && r.arrival_date));
    if (rows.length < 1000) break;
    await sleep(150);
  }
  return out;
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
        "sort[0][field]": "arrival_date", "sort[0][order]": "desc",
      });
      const rows = (await fetchPage(params)).map(map);
      const set = new Set(rows.map((r) => r.commodity).filter(Boolean));
      return Response.json(
        { commodities: Array.from(set).sort() },
        { headers: corsHeaders },
      );
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
