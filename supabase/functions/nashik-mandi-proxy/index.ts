import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ENDPOINT = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
const API_KEY = Deno.env.get("DATA_GOV_IN_API_KEY") ?? "579b464db66ec23bdd000001e1767211684c4183694c41da743079b6";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(params: URLSearchParams, retries = 4): Promise<any[]> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(`${ENDPOINT}?${params}`);
    const text = await res.text();
    let payload: any = {};
    try { payload = JSON.parse(text); } catch { /* ignore */ }
    if (res.status === 429) { await sleep(1000 * (i + 1)); continue; }
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    return Array.isArray(payload.records) ? payload.records : [];
  }
  return [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action = String(body.action ?? "records");

    if (action === "commodities") {
      // Sample latest 1000 records to derive distinct commodity list for Maharashtra
      const params = new URLSearchParams({
        "api-key": API_KEY,
        format: "json",
        limit: "1000",
        offset: "0",
        "filters[state.keyword]": "Maharashtra",
      });
      const rows = await fetchPage(params);
      const set = new Set<string>();
      for (const r of rows) if (r?.commodity) set.add(String(r.commodity).trim());
      return new Response(
        JSON.stringify({ commodities: Array.from(set).sort((a, b) => a.localeCompare(b)) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const commodity = String(body.commodity ?? "Onion").trim().slice(0, 80);
    const pages = Math.max(1, Math.min(6, Number(body.pages ?? 3)));
    const limit = Math.max(1, Math.min(1000, Number(body.limit ?? 500)));

    const all: any[] = [];
    for (let p = 0; p < pages; p++) {
      const params = new URLSearchParams({
        "api-key": API_KEY,
        format: "json",
        limit: String(limit),
        offset: String(p * limit),
        "filters[state.keyword]": "Maharashtra",
        "filters[commodity]": commodity,
      });
      const rows = await fetchPage(params);
      all.push(...rows);
      if (rows.length < limit) break;
      await sleep(120);
    }
    return new Response(JSON.stringify({ records: all }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});