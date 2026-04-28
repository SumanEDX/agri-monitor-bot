import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DATA_GOV_ENDPOINT = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
const DATA_GOV_CSV = "https://data.gov.in/sites/default/files/Date-Wise-Prices-all-Commodity.csv";
const PUBLIC_API_KEY = "579b464db66ec23bdd000001";

type MandiRecord = {
  crop: string;
  market: string;
  district: string;
  state: string;
  date: string;
  modalPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  variety: string;
};

const toIsoDate = (value: string) => {
  const parts = value.split("/");
  if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  return value;
};

const toAgmarkDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
};

const parsePrice = (value: unknown) => {
  const parsed = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const daysBetween = (from: string, to: string) => {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
  const days: string[] = [];
  for (const cursor = new Date(start); cursor <= end && days.length < 31; cursor.setDate(cursor.getDate() + 1)) {
    days.push(cursor.toISOString().slice(0, 10));
  }
  return days;
};

const parseCsvRow = (line: string) => {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else current += char;
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
};

const fetchCsvFallback = async ({ crop, startDate, endDate, state, district, scope }: { crop: string; startDate: string; endDate: string; state: string; district: string; scope: string }) => {
  const response = await fetch(DATA_GOV_CSV);
  if (!response.ok) throw new Error(`data.gov.in CSV request failed with ${response.status}`);
  const [headerLine, ...lines] = (await response.text()).trim().split(/\r?\n/);
  const headers = parseCsvRow(headerLine);
  const cropMatches = lines.map((line) => {
    const cells = parseCsvRow(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  }).filter((item) => {
    const matchesCrop = item.commodity.toLowerCase() === crop.toLowerCase();
    const matchesState = scope === "India" ? true : item.state.toLowerCase() === (state || "Maharashtra").toLowerCase();
    const matchesDistrict = district && district !== "All" ? item.district.toLowerCase() === district.toLowerCase() : true;
    return matchesCrop && matchesState && matchesDistrict;
  });

  const rangeMatches = cropMatches.filter((item) => {
    const itemDate = toIsoDate(item.arrival_date);
    return itemDate >= startDate && itemDate <= endDate;
  });

  const latestAvailableDate = cropMatches.map((item) => toIsoDate(item.arrival_date)).sort().at(-1);
  const allMatches = rangeMatches.length > 0 ? rangeMatches : cropMatches.filter((item) => toIsoDate(item.arrival_date) === latestAvailableDate);

  const records = allMatches.map((item): MandiRecord => ({
    crop: item.commodity,
    market: item.market || "Unknown mandi",
    district: item.district || "Unknown district",
    state: item.state || "Unknown state",
    date: toIsoDate(item.arrival_date),
    modalPrice: parsePrice(item.modal_price),
    minPrice: parsePrice(item.min_price),
    maxPrice: parsePrice(item.max_price),
    variety: item.variety || "",
  })).filter((record) => record.modalPrice !== null);

  return { records, usedLatestAvailable: rangeMatches.length === 0 && records.length > 0, latestAvailableDate };
};

const fetchForDate = async ({ crop, date, state, district, scope }: { crop: string; date: string; state: string; district: string; scope: string }) => {
  const params = new URLSearchParams({
    "api-key": PUBLIC_API_KEY,
    format: "json",
    limit: "1000",
    offset: "0",
    "filters[commodity]": crop,
    "filters[arrival_date]": toAgmarkDate(date),
  });

  if (scope === "Maharashtra" || state) params.set("filters[state]", state || "Maharashtra");
  if (district && district !== "All") params.set("filters[district]", district);

  const response = await fetch(`${DATA_GOV_ENDPOINT}?${params.toString()}`);
  if (!response.ok) throw new Error(`data.gov.in request failed with ${response.status}`);
  const payload = await response.json();
  const records = Array.isArray(payload.records) ? payload.records : [];

  return records.map((item: Record<string, unknown>): MandiRecord => ({
    crop: String(item.commodity ?? crop).trim(),
    market: String(item.market ?? "Unknown mandi").trim(),
    district: String(item.district ?? "Unknown district").trim(),
    state: String(item.state ?? "Unknown state").trim(),
    date: toIsoDate(String(item.arrival_date ?? date)),
    modalPrice: parsePrice(item.modal_price),
    minPrice: parsePrice(item.min_price),
    maxPrice: parsePrice(item.max_price),
    variety: String(item.variety ?? "").trim(),
  })).filter((record: MandiRecord) => record.modalPrice !== null);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const crop = String(body.crop ?? "Onion").trim().slice(0, 80);
    const startDate = String(body.startDate ?? new Date().toISOString().slice(0, 10));
    const endDate = String(body.endDate ?? startDate);
    const state = String(body.state ?? "Maharashtra").trim().slice(0, 80);
    const district = String(body.district ?? "").trim().slice(0, 80);
    const scope = body.scope === "India" ? "India" : "Maharashtra";

    if (!crop || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return new Response(JSON.stringify({ error: "Invalid crop or date input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const days = daysBetween(startDate, endDate);
    if (days.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid date range" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let records: MandiRecord[] = [];
    let source = "data.gov.in AGMARKNET API";
    let usedLatestAvailable = false;
    let latestAvailableDate: string | undefined;
    try {
      records = (await Promise.all(days.map((date) => fetchForDate({ crop, date, state, district, scope })))).flat();

      // If live API returns nothing for the selected range, walk back day-by-day
      // (up to ~45 days) to find the most recent live data instead of using stale CSV fallback.
      if (records.length === 0) {
        const cursor = new Date(`${endDate}T00:00:00`);
        for (let i = 0; i < 45; i++) {
          cursor.setDate(cursor.getDate() - 1);
          const probe = cursor.toISOString().slice(0, 10);
          if (probe < "2024-01-01") break;
          const found = await fetchForDate({ crop, date: probe, state, district, scope });
          if (found.length > 0) {
            records = found;
            usedLatestAvailable = true;
            latestAvailableDate = probe;
            break;
          }
        }
      }
    } catch (apiError) {
      console.warn("Live API failed:", apiError);
      records = [];
    }
    const uniqueRecords = Array.from(new Map(records.map((record) => [`${record.date}-${record.state}-${record.district}-${record.market}-${record.crop}-${record.modalPrice}`, record])).values());

    return new Response(JSON.stringify({ records: uniqueRecords, source, cappedDays: days.length === 31, usedLatestAvailable, latestAvailableDate }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("mandi-prices error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unable to fetch mandi prices" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});