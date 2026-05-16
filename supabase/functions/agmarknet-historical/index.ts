import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.100.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ENDPOINT = "https://api.data.gov.in/resource/9ef84268-d588-465a-a5c0-3b641c4f61e6";
const API_KEY = Deno.env.get("DATA_GOV_IN_API_KEY") ?? "579b464db66ec23bdd000001";

interface RawRecord {
  commodity: string;
  market: string;
  district: string;
  state: string;
  arrival_date: string;
  min_price?: string | number;
  max_price?: string | number;
  modal_price?: string | number;
  arrival_quantity?: string | number;
}

interface HistoricalRecord {
  date: string;
  commodity: string;
  market: string;
  state: string;
  district: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  arrival_quantity?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const toIso = (v: string): string => {
  if (!v) return "";
  const p = v.split("/");
  if (p.length === 3) return `${p[2]}-${p[1].padStart(2, "0")}-${p[0].padStart(2, "0")}`;
  return v;
};

const parseNum = (v: unknown): number => {
  if (v === null || v === undefined) return 0;
  const n = Number(String(v).replace(/[,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const mapRecord = (r: RawRecord): HistoricalRecord | null => {
  const date = toIso(String(r.arrival_date ?? ""));
  if (!date) return null;

  const modalPrice = parseNum(r.modal_price);
  if (!modalPrice) return null;

  return {
    date,
    commodity: String(r.commodity ?? "").trim(),
    market: String(r.market ?? "").trim(),
    state: String(r.state ?? "").trim(),
    district: String(r.district ?? "").trim(),
    min_price: parseNum(r.min_price),
    max_price: parseNum(r.max_price),
    modal_price: modalPrice,
    arrival_quantity: r.arrival_quantity ? parseNum(r.arrival_quantity) : undefined,
  };
};

async function fetchPage(params: URLSearchParams, retries = 4): Promise<RawRecord[]> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${ENDPOINT}?${params}`);
      const text = await res.text();
      let payload: { records?: unknown[]; error?: string } = {};
      try {
        payload = JSON.parse(text);
      } catch {
        // Continue
      }

      if (res.status === 429) {
        await sleep(1200 * (i + 1));
        continue;
      }

      if (!res.ok) throw new Error(`data.gov.in ${res.status}`);
      return Array.isArray(payload.records) ? (payload.records as RawRecord[]) : [];
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1000 * (i + 1));
    }
  }
  return [];
}

async function fetchHistoricalData(
  commodity: string,
  market?: string,
  maxPages = 10
): Promise<HistoricalRecord[]> {
  const out: HistoricalRecord[] = [];

  for (let p = 0; p < maxPages; p++) {
    const params = new URLSearchParams({
      "api-key": API_KEY,
      format: "json",
      limit: "1000",
      offset: String(p * 1000),
      "filters[state]": "Maharashtra",
      "filters[commodity]": commodity,
    });

    if (market) {
      params.set("filters[market]", market);
    }

    const rows = await fetchPage(params);
    const mapped = rows.map(mapRecord).filter((r): r is HistoricalRecord => r !== null);
    out.push(...mapped);

    if (rows.length < 1000) break;
    await sleep(200);
  }

  return out;
}

async function storeHistoricalData(
  supabase: ReturnType<typeof createClient>,
  records: HistoricalRecord[]
): Promise<void> {
  if (records.length === 0) return;

  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    const { error } = await supabase.from("mandi_price_history").upsert(
      batch.map((r) => ({
        date: r.date,
        commodity: r.commodity,
        market: r.market,
        state: r.state,
        district: r.district,
        min_price: r.min_price,
        max_price: r.max_price,
        modal_price: r.modal_price,
        arrival_quantity: r.arrival_quantity || null,
      })),
      {
        onConflict: "date,commodity,market",
      }
    );

    if (error) {
      console.error("Error upserting batch:", error);
      throw error;
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action = String(body.action ?? "fetch");

    if (action === "fetch") {
      const commodity = String(body.commodity ?? "Onion").trim();
      const market = body.market ? String(body.market).trim() : undefined;

      const records = await fetchHistoricalData(commodity, market);

      return new Response(
        JSON.stringify({
          success: true,
          count: records.length,
          records,
          commodity,
          market: market || "all",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "store") {
      const commodity = String(body.commodity ?? "Onion").trim();
      const market = body.market ? String(body.market).trim() : undefined;

      const records = await fetchHistoricalData(commodity, market);
      await storeHistoricalData(supabase, records);

      return new Response(
        JSON.stringify({
          success: true,
          stored: records.length,
          commodity,
          market: market || "all",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "query") {
      const commodity = body.commodity ? String(body.commodity).trim() : undefined;
      const market = body.market ? String(body.market).trim() : undefined;
      const startDate = body.startDate ? String(body.startDate).trim() : undefined;
      const endDate = body.endDate ? String(body.endDate).trim() : undefined;

      let query = supabase.from("mandi_price_history").select("*");

      if (commodity) query = query.eq("commodity", commodity);
      if (market) query = query.eq("market", market);
      if (startDate) query = query.gte("date", startDate);
      if (endDate) query = query.lte("date", endDate);

      query = query.order("date", { ascending: false }).limit(1000);

      const { data, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          count: data?.length || 0,
          records: data || [],
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Unknown action. Use 'fetch', 'store', or 'query'",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
