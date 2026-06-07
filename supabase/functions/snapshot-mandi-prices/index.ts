import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ENDPOINT = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
const API_KEY = Deno.env.get("DATA_GOV_IN_API_KEY") ?? "579b464db66ec23bdd000001";

const COMMODITIES = [
  "Onion", "Tomato", "Potato", "Wheat", "Soybean", "Cotton",
  "Bajra", "Gram", "Maize", "Jowar", "Rice", "Grapes",
  "Pomegranate", "Green Chilli",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const toIso = (v: string) => {
  const p = v.split("/");
  if (p.length === 3) return `${p[2]}-${p[1].padStart(2, "0")}-${p[0].padStart(2, "0")}`;
  return v;
};
const num = (v: unknown): number | null => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};
const normalizeCommodity = (raw: string) => {
  const lower = raw.trim().toLowerCase();
  const bases = ["onion", "tomato", "potato", "wheat", "soybean", "cotton", "bajra", "gram", "maize", "jowar", "rice", "groundnut", "sugarcane", "grapes", "pomegranate", "green chilli"];
  for (const b of bases) if (lower.includes(b)) return b.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return raw.trim();
};

async function fetchCommodity(commodity: string) {
  const all: any[] = [];
  for (let page = 0; page < 4; page++) {
    const params = new URLSearchParams({
      "api-key": API_KEY, format: "json", limit: "1000", offset: String(page * 1000),
      "filters[state]": "Maharashtra", "filters[commodity]": commodity,
    });
    const res = await fetch(`${ENDPOINT}?${params}`);
    if (!res.ok) { await res.text(); break; }
    const json = await res.json().catch(() => ({}));
    const rows = Array.isArray(json.records) ? json.records : [];
    all.push(...rows);
    if (rows.length < 1000) break;
    await sleep(150);
  }
  return all;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let totalInserted = 0;
    const perCommodity: Record<string, number> = {};

    for (const commodity of COMMODITIES) {
      const raw = await fetchCommodity(commodity);
      const rows = raw
        .map((r: any) => {
          const modal = num(r.modal_price);
          const iso = toIso(String(r.arrival_date ?? ""));
          if (!modal || !iso || !r.market) return null;
          return {
            commodity: normalizeCommodity(String(r.commodity ?? commodity)),
            variety: String(r.variety ?? "").trim(),
            market: String(r.market).trim(),
            district: String(r.district ?? "").trim(),
            state: String(r.state ?? "Maharashtra").trim(),
            arrival_date: iso,
            modal_price: modal,
            min_price: num(r.min_price),
            max_price: num(r.max_price),
          };
        })
        .filter(Boolean) as any[];

      if (rows.length === 0) continue;

      // upsert in batches of 500 on the unique constraint
      for (let i = 0; i < rows.length; i += 500) {
        const batch = rows.slice(i, i + 500);
        const { error } = await supabase
          .from("mandi_price_history")
          .upsert(batch, { onConflict: "commodity,variety,market,arrival_date" });
        if (error) {
          console.error("upsert error", commodity, error.message);
        } else {
          totalInserted += batch.length;
        }
      }
      perCommodity[commodity] = rows.length;
      await sleep(200);
    }

    return new Response(
      JSON.stringify({ ok: true, totalInserted, perCommodity, at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("snapshot-mandi-prices error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});