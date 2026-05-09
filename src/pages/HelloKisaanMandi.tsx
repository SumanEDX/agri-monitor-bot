import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  CalendarDays,
  Loader2,
  MapPin,
  Minus,
  Search,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

// ---------------- Types ----------------
interface RawRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety?: string;
  grade?: string;
  arrival_date: string;
  min_price: string | number;
  max_price: string | number;
  modal_price: string | number;
}
interface MandiRecord {
  market: string;
  district: string;
  commodity: string;
  date: string; // ISO yyyy-mm-dd
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

// ---------------- Helpers ----------------
const toNum = (v: unknown): number => {
  const n = Number(String(v ?? "").replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

const parseDate = (s: string): string | null => {
  if (!s) return null;
  if (s.includes("/")) {
    const [d, m, y] = s.split("/");
    if (!d || !m || !y) return null;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
};

const formatINR = (n: number | null | undefined) =>
  n == null || isNaN(n) ? "—" : `₹ ${Math.round(n).toLocaleString("en-IN")}`;

const fmtDateLong = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function cleanRecords(raw: RawRecord[]): MandiRecord[] {
  const out: MandiRecord[] = [];
  for (const r of raw) {
    const date = parseDate(r.arrival_date);
    if (!date) continue;
    const modalPrice = toNum(r.modal_price);
    if (!modalPrice || isNaN(modalPrice)) continue;
    const market = String(r.market ?? "").trim();
    if (!market) continue;
    out.push({
      market,
      district: String(r.district ?? "").trim(),
      commodity: String(r.commodity ?? "").trim(),
      date,
      minPrice: toNum(r.min_price),
      maxPrice: toNum(r.max_price),
      modalPrice,
    });
  }
  return out;
}

// Default fallback list (used until API returns)
const DEFAULT_COMMODITIES = [
  "Onion", "Tomato", "Potato", "Wheat", "Soyabean", "Cotton", "Maize",
  "Bajra(Pearl Millet/Cumbu)", "Jowar(Sorghum)", "Green Chilli", "Grapes",
  "Pomegranate", "Banana", "Mango", "Garlic", "Gram", "Rice",
];

// ---------------- Data fetching ----------------
async function fetchCommodityRecords(commodity: string): Promise<MandiRecord[]> {
  const { data, error } = await supabase.functions.invoke("nashik-mandi-proxy", {
    body: { commodity, pages: 6, limit: 1000 },
  });
  if (error) throw new Error(error.message);
  return cleanRecords(((data as { records?: RawRecord[] })?.records) ?? []);
}

async function fetchAvailableCommodities(): Promise<string[]> {
  const { data } = await supabase.functions.invoke("nashik-mandi-proxy", {
    body: { action: "commodities" },
  });
  const list = (data as { commodities?: string[] })?.commodities ?? [];
  return list.length ? list : DEFAULT_COMMODITIES;
}

// ---------------- Component ----------------
type TrendKind = "rising" | "falling" | "stable";

function computeTrend(records: MandiRecord[], market: string): {
  kind: TrendKind;
  delta: number;
  pct: number;
} {
  const byDate = new Map<string, number[]>();
  for (const r of records.filter((x) => x.market === market)) {
    if (!byDate.has(r.date)) byDate.set(r.date, []);
    byDate.get(r.date)!.push(r.modalPrice);
  }
  const dates = Array.from(byDate.keys()).sort();
  if (dates.length < 2) return { kind: "stable", delta: 0, pct: 0 };
  const last = dates[dates.length - 1];
  const prev = dates[dates.length - 2];
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const lastAvg = avg(byDate.get(last)!);
  const prevAvg = avg(byDate.get(prev)!);
  const delta = lastAvg - prevAvg;
  const pct = prevAvg ? (delta / prevAvg) * 100 : 0;
  if (Math.abs(pct) < 2) return { kind: "stable", delta, pct };
  return { kind: pct > 0 ? "rising" : "falling", delta, pct };
}

export default function HelloKisaanMandi() {
  const [commodity, setCommodity] = useState<string>("Onion");
  const [market, setMarket] = useState<string>("");
  const [trendDays, setTrendDays] = useState<7 | 15 | 30>(7);

  const commoditiesQuery = useQuery({
    queryKey: ["mh-commodities"],
    queryFn: fetchAvailableCommodities,
    staleTime: 1000 * 60 * 30,
  });

  const recordsQuery = useQuery({
    queryKey: ["mh-records", commodity],
    queryFn: () => fetchCommodityRecords(commodity),
    staleTime: 1000 * 60 * 5,
  });

  const allRecords = recordsQuery.data ?? [];

  // Latest available date (across Maharashtra for this commodity)
  const latestDate = useMemo(() => {
    let max = "";
    for (const r of allRecords) if (r.date > max) max = r.date;
    return max;
  }, [allRecords]);

  // Markets that reported on the latest date
  const latestMarkets = useMemo(() => {
    if (!latestDate) return [];
    const set = new Set<string>();
    for (const r of allRecords) if (r.date === latestDate) set.add(r.market);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allRecords, latestDate]);

  // All markets (any date) — for dropdown
  const allMarkets = useMemo(() => {
    const set = new Set<string>();
    for (const r of allRecords) set.add(r.market);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allRecords]);

  // Auto-select market when records load
  useEffect(() => {
    if (!latestMarkets.length) return;
    if (!market || !latestMarkets.includes(market)) {
      setMarket(latestMarkets[0]);
    }
  }, [latestMarkets, market]);

  // Selected market record (latest date snapshot)
  const selected = useMemo(() => {
    if (!market || !latestDate) return null;
    const rows = allRecords.filter((r) => r.market === market && r.date === latestDate);
    if (!rows.length) return null;
    // average if multiple varieties on same day
    const avg = (k: keyof MandiRecord) =>
      rows.reduce((a, b) => a + (Number(b[k]) || 0), 0) / rows.length;
    return {
      market: rows[0].market,
      district: rows[0].district,
      modalPrice: avg("modalPrice"),
      minPrice: avg("minPrice"),
      maxPrice: avg("maxPrice"),
    };
  }, [allRecords, market, latestDate]);

  const trend = useMemo(() => (market ? computeTrend(allRecords, market) : { kind: "stable" as TrendKind, delta: 0, pct: 0 }), [allRecords, market]);

  // Trend chart data — state-wide daily average for selected commodity
  const trendData = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - trendDays);
    const cutoffIso = cutoff.toISOString().slice(0, 10);
    const byDate = new Map<string, number[]>();
    for (const r of allRecords) {
      if (r.date < cutoffIso) continue;
      if (!byDate.has(r.date)) byDate.set(r.date, []);
      byDate.get(r.date)!.push(r.modalPrice);
    }
    return Array.from(byDate.entries())
      .map(([date, prices]) => ({
        date,
        modal: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allRecords, trendDays]);

  // Nearby mandis = same district as selected market, then fill with most active markets
  const nearbyMandis = useMemo(() => {
    if (!selected) return [] as { market: string; district: string; modalPrice: number }[];
    const latestRows = allRecords.filter((r) => r.date === latestDate && r.market !== selected.market);
    const sameDistrict = latestRows.filter((r) => r.district === selected.district);
    const others = latestRows.filter((r) => r.district !== selected.district);
    const dedupe = (arr: MandiRecord[]) => {
      const seen = new Set<string>();
      const out: MandiRecord[] = [];
      for (const r of arr) {
        if (seen.has(r.market)) continue;
        seen.add(r.market);
        out.push(r);
      }
      return out;
    };
    const merged = [...dedupe(sameDistrict), ...dedupe(others)].slice(0, 8);
    return merged.map((r) => ({ market: r.market, district: r.district, modalPrice: r.modalPrice }));
  }, [allRecords, selected, latestDate]);

  const isLoading = recordsQuery.isLoading;
  const trendInfo: Record<TrendKind, { label: string; cls: string; icon: typeof ArrowUp; emoji: string; sub: string }> = {
    rising: { label: "Rising", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: ArrowUp, emoji: "📈", sub: "Prices trending higher" },
    falling: { label: "Falling", cls: "text-rose-700 bg-rose-50 border-rose-200", icon: ArrowDown, emoji: "📉", sub: "Prices trending lower" },
    stable: { label: "Stable", cls: "text-slate-700 bg-slate-50 border-slate-200", icon: Minus, emoji: "➖", sub: "No major price change reported" },
  };
  const tInfo = trendInfo[trend.kind];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 flex flex-wrap items-center gap-1">
          <span>Home</span>
          <span>›</span>
          <span>Mandi Rates</span>
          <span>›</span>
          <span>Maharashtra</span>
          {market && <>
            <span>›</span>
            <span>{market}</span>
          </>}
          {commodity && <>
            <span>›</span>
            <span className="text-slate-900 font-medium">{commodity}</span>
          </>}
        </nav>

        {/* Hero banner */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-emerald-50 px-6 py-8 md:px-10 md:py-10 shadow-lg">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
            {commodity} Mandi Rate Today {market ? `in ${market}` : "in Maharashtra"}
          </h1>
          <p className="mt-3 text-sm md:text-base text-emerald-100/90 max-w-3xl">
            Live {commodity} prices from {market || "Maharashtra"} mandi. Compare today's minimum, maximum and modal {commodity} rates updated daily.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/40 ring-1 ring-emerald-400/30 px-3 py-1 text-xs">
              <MapPin className="h-3.5 w-3.5" /> {market || "Maharashtra"}, Maharashtra
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/40 ring-1 ring-emerald-400/30 px-3 py-1 text-xs">
              <Building2 className="h-3.5 w-3.5" /> Official AGMARKNET Data
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/40 ring-1 ring-emerald-400/30 px-3 py-1 text-xs">
              <CalendarDays className="h-3.5 w-3.5" /> Last Updated {latestDate || "—"}
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label={`${commodity.toUpperCase()} MODAL PRICE TODAY`}
            primary={
              isLoading ? <Skeleton className="h-9 w-32" /> : (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-bold text-slate-900">{formatINR(selected?.modalPrice)}</span>
                  <span className="text-sm text-slate-500">/ Quintal</span>
                </div>
              )
            }
            line1={selected ? `${selected.market}, Maharashtra` : "—"}
            line2={`Official APMC modal price updated on ${latestDate || "—"}`}
          />
          <StatCard
            label={`${commodity.toUpperCase()} PRICE RANGE TODAY`}
            primary={
              isLoading ? <Skeleton className="h-9 w-44" /> : (
                <div className="text-3xl md:text-4xl font-bold text-slate-900">
                  {formatINR(selected?.minPrice)} <span className="text-slate-400 font-normal">–</span> {formatINR(selected?.maxPrice)}
                </div>
              )
            }
            line1={`Min to max prices in ${selected?.market ?? "—"} mandi`}
            line2="Based on today's trading transactions"
          />
          <StatCard
            label={`${commodity.toUpperCase()} MARKET TREND`}
            primary={
              isLoading ? <Skeleton className="h-9 w-32" /> : (
                <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-2xl md:text-3xl font-bold ${tInfo.cls}`}>
                  <span>{tInfo.emoji}</span>
                  <span>{tInfo.label}</span>
                </div>
              )
            }
            line1={tInfo.sub}
            line2="Compared with previous trading day"
          />
        </div>

        {/* Search panel */}
        <Card className="border-emerald-100">
          <CardContent className="p-6 space-y-4 bg-emerald-50/40 rounded-xl">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Search Mandi Prices</h2>
              <p className="text-sm text-slate-600">Filter commodity prices by market and commodity</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <FilterField label="Select State">
                <Select value="Maharashtra" disabled>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                  </SelectContent>
                </Select>
              </FilterField>
              <FilterField label="Select Market">
                <Select value={market} onValueChange={setMarket} disabled={!allMarkets.length}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={allMarkets.length ? "Select market" : "Loading..."} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {allMarkets.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
              <FilterField label="Select Commodity">
                <Select value={commodity} onValueChange={setCommodity}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {(commoditiesQuery.data ?? DEFAULT_COMMODITIES).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
              <FilterField label=" ">
                <Button
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={() => recordsQuery.refetch()}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </FilterField>
            </div>
          </CardContent>
        </Card>

        {/* Trend chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{commodity} Price Trend in Maharashtra</h2>
                <p className="text-sm text-slate-600">Historical {commodity} mandi price movement (₹ / Quintal)</p>
              </div>
              <div className="inline-flex rounded-lg border bg-slate-100 p-1 text-xs font-medium">
                {[7, 15, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setTrendDays(d as 7 | 15 | 30)}
                    className={`px-3 py-1.5 rounded-md transition ${
                      trendDays === d ? "bg-emerald-700 text-white shadow" : "text-slate-700 hover:bg-white"
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-700" />
                </div>
              ) : trendData.length < 2 ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-500">
                  Not enough historical data for trend.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(s) => s.slice(5)} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                      formatter={(v: number) => [formatINR(v), "Modal Price"]}
                    />
                    <Area type="monotone" dataKey="modal" stroke="#047857" strokeWidth={2.5} fill="url(#gPrice)" dot={{ r: 3, fill: "#047857" }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Nearby mandis */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Nearby Mandis for {commodity} Prices {selected?.district ? `In ${selected.district}` : ""}
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Compare {commodity} mandi prices in nearby markets to find the best selling price today.
          </p>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : nearbyMandis.length === 0 ? (
            <p className="text-sm text-slate-500">No other reporting mandis on {fmtDateLong(latestDate)}.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {nearbyMandis.map((m) => (
                <button
                  key={m.market}
                  onClick={() => setMarket(m.market)}
                  className="text-left rounded-xl border bg-white p-4 hover:border-emerald-500 hover:shadow-md transition group"
                >
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <Sprout className="h-4 w-4" />
                    {m.market}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{m.district || "Maharashtra"}</div>
                  <div className="mt-2 text-lg font-bold text-slate-900">{formatINR(m.modalPrice)}<span className="text-xs font-normal text-slate-500"> /qtl</span></div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* All Maharashtra mandis grid */}
        {allMarkets.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">{commodity} Prices Across Major Mandis in Maharashtra</h2>
            <p className="text-sm text-slate-600 mb-4">
              Check today's {commodity} mandi prices across important APMC markets in Maharashtra. Compare rates to find the best nearby market.
            </p>
            <div className="rounded-xl border bg-white p-4 columns-2 md:columns-4 gap-4">
              {allMarkets.map((m) => (
                <button
                  key={m}
                  onClick={() => setMarket(m)}
                  className={`block w-full text-left text-sm py-1 hover:text-emerald-700 ${
                    m === market ? "text-emerald-700 font-semibold" : "text-slate-700"
                  }`}
                >
                  {commodity} price in <span className="underline decoration-dotted">{m}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  primary,
  line1,
  line2,
}: {
  label: string;
  primary: React.ReactNode;
  line1: string;
  line2: string;
}) {
  return (
    <Card className="border-slate-200">
      <CardContent className="p-5 space-y-2">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500">{label}</div>
        <div>{primary}</div>
        <div className="text-sm font-medium text-slate-700">{line1}</div>
        <div className="text-xs text-slate-500">{line2}</div>
      </CardContent>
    </Card>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}