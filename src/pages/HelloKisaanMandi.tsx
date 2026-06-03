import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  Cell,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Award,
  Building2,
  CalendarDays,
  Loader2,
  MapPin,
  Minus,
  Search,
  Sprout,
  TrendingDown,
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
import cropOnion from "@/assets/crop-onion.jpg";
import cropTomato from "@/assets/crop-tomato.jpg";
import cropPotato from "@/assets/crop-potato.jpg";
import cropWheat from "@/assets/crop-wheat.jpg";
import cropSoybean from "@/assets/crop-soybean.jpg";
import cropCotton from "@/assets/crop-cotton.jpg";
import cropMaize from "@/assets/crop-maize.jpg";
import cropRice from "@/assets/crop-rice.jpg";
import cropBajra from "@/assets/crop-bajra.jpg";
import cropGram from "@/assets/crop-gram.jpg";
import cropJowar from "@/assets/crop-jowar.jpg";

const CROP_ICONS: Record<string, string> = {
  onion: cropOnion, tomato: cropTomato, potato: cropPotato,
  wheat: cropWheat, soybean: cropSoybean, soyabean: cropSoybean,
  cotton: cropCotton, maize: cropMaize, rice: cropRice, paddy: cropRice,
  bajra: cropBajra, gram: cropGram, chana: cropGram,
  jowar: cropJowar, sorghum: cropJowar,
};
const getCropIcon = (name?: string): string | undefined => {
  if (!name) return undefined;
  const key = name.toLowerCase().trim();
  if (CROP_ICONS[key]) return CROP_ICONS[key];
  const match = Object.keys(CROP_ICONS).find((k) => key.includes(k));
  return match ? CROP_ICONS[match] : undefined;
};
const CropIcon = ({ name, size = 20, className = "" }: { name?: string; size?: number; className?: string }) => {
  const src = getCropIcon(name);
  if (!src) return null;
  return (
    <img
      src={src}
      alt={name ?? ""}
      loading="lazy"
      className={`inline-block rounded-full object-cover ring-1 ring-white/40 bg-white shadow-sm ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

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

// Comprehensive list of Maharashtra APMCs to display.
const ALLOWED_MARKETS = [
  // Nashik Division
  "Sinnar APMC",
  "Lasalgaon APMC",
  "Pimpalgaon Baswant APMC",
  "Nashik APMC",
  "Yeola APMC",
  "Niphad APMC",
  "Manmad APMC",
  "Chandvad APMC",
  "Malegaon APMC",
  // Pune Division
  "Pune APMC",
  "Baramati APMC",
  "Indapur APMC",
  "Bhosari APMC",
  "Chakan APMC",
  "Khadki APMC",
  "Saswad APMC",
  "Junnar APMC",
  // Nagpur / Amravati Division
  "Nagpur APMC",
  "Wardha APMC",
  "Amravati APMC",
  "Yavatmal APMC",
  "Akola APMC",
  "Achalpur APMC",
  "Washim APMC",
  "Hinganghat APMC",
  // Aurangabad Division
  "Aurangabad APMC",
  "Jalna APMC",
  "Beed APMC",
  "Latur APMC",
  "Osmanabad APMC",
  "Nanded APMC",
  "Parbhani APMC",
  "Hingoli APMC",
  // Kolhapur / Sangli Division
  "Kolhapur APMC",
  "Sangli APMC",
  "Ichalkaranji APMC",
  "Karad APMC",
  "Miraj APMC",
  "Tasgaon APMC",
  "Kagal APMC",
  // Solapur Division
  "Solapur APMC",
  "Pandharpur APMC",
  "Akkalkot APMC",
  "Barshi APMC",
  "Sangola APMC",
  // Ahmednagar Division
  "Ahmednagar APMC",
  "Shrirampur APMC",
  "Rahuri APMC",
  "Pathardi APMC",
  "Kopargaon APMC",
  "Shevgaon APMC",
  // Jalgaon / Dhule Division
  "Jalgaon APMC",
  "Bhusawal APMC",
  "Chalisgaon APMC",
  "Pachora APMC",
  "Jamner APMC",
  "Erandol APMC",
  "Dhule APMC",
  "Nandurbar APMC",
  "Shirpur APMC",
  "Dondaicha APMC",
  // Mumbai / Thane Division
  "Mumbai APMC",
  "Vashi APMC",
  "Thane APMC",
  "Kalyan APMC",
  "Bhiwandi APMC",
  "Vasai APMC",
  // Ratnagiri / Sindhudurg
  "Ratnagiri APMC",
  "Sangameshwar APMC",
  "Kankavli APMC",
  "Kudal APMC",
  // Satara / Sangli
  "Satara APMC",
  "Wai APMC",
  "Phaltan APMC",
  "Vita APMC",
  "Islampur APMC",
  // Chandrapur / Gadchiroli
  "Chandrapur APMC",
  "Ballarpur APMC",
  "Gadchiroli APMC",
  "Warora APMC",
  // Gondia / Bhandara
  "Gondia APMC",
  "Bhandara APMC",
  // Buldhana
  "Buldhana APMC",
  "Malkapur APMC",
  "Khamgaon APMC",
  // Palghar
  "Palghar APMC",
  "Dahanu APMC",
  "Boisar APMC",
] as const;

function canonicalizeMarket(name: string): string | null {
  const n = name.trim().toLowerCase();
  for (const allowed of ALLOWED_MARKETS) {
    const key = allowed.toLowerCase();
    const stem = key.replace(/\s+apmc$/, "");
    if (n === key || n === stem || n.startsWith(stem)) return allowed;
  }
  return null;
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
  const cleaned = cleanRecords(((data as { records?: RawRecord[] })?.records) ?? []);
  // Restrict to the whitelisted Nashik APMCs only.
  const filtered: MandiRecord[] = [];
  for (const r of cleaned) {
    const canon = canonicalizeMarket(r.market);
    if (canon) filtered.push({ ...r, market: canon });
  }
  return filtered;
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
  const [nearbySort, setNearbySort] = useState<"high" | "low" | "name">("high");

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

  // Historical trend series (per-day modal avg) fetched directly from AGMARKNET
  // via the mandi-prices edge function, which queries each day individually so
  // we actually get back a multi-day series instead of just today's snapshot.
  const trendQuery = useQuery({
    queryKey: ["mh-trend", commodity, trendDays],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("mandi-prices", {
        body: { action: "historical", commodity, days: trendDays },
      });
      if (error) throw new Error(error.message);
      return ((data as { series?: { date: string; modal: number }[] })?.series) ?? [];
    },
    staleTime: 1000 * 60 * 10,
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
    const fromApi = trendQuery.data ?? [];
    if (fromApi.length >= 2) return fromApi;
    // Fallback: derive from already-loaded records if the historical call fails
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
  }, [trendQuery.data, allRecords, trendDays]);

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

  // All reporting mandis (latest date) — for the interactive comparison bar chart
  const allReportingMandis = useMemo(() => {
    if (!latestDate) return [] as { market: string; district: string; modalPrice: number }[];
    const byMarket = new Map<string, { sum: number; n: number; district: string }>();
    for (const r of allRecords) {
      if (r.date !== latestDate) continue;
      const cur = byMarket.get(r.market) ?? { sum: 0, n: 0, district: r.district };
      cur.sum += r.modalPrice;
      cur.n += 1;
      cur.district = r.district || cur.district;
      byMarket.set(r.market, cur);
    }
    return Array.from(byMarket.entries())
      .map(([market, v]) => ({ market, district: v.district, modalPrice: Math.round(v.sum / v.n) }))
      .sort((a, b) => b.modalPrice - a.modalPrice);
  }, [allRecords, latestDate]);

  const bestMandi = allReportingMandis[0];
  const lowestMandi = allReportingMandis[allReportingMandis.length - 1];

  const sortedNearby = useMemo(() => {
    const list = [...nearbyMandis];
    if (nearbySort === "high") list.sort((a, b) => b.modalPrice - a.modalPrice);
    else if (nearbySort === "low") list.sort((a, b) => a.modalPrice - b.modalPrice);
    else list.sort((a, b) => a.market.localeCompare(b.market));
    return list;
  }, [nearbyMandis, nearbySort]);

  // Trend chart with day-over-day delta for richer tooltips
  const trendDataEnriched = useMemo(
    () =>
      trendData.map((d, i) => {
        const prev = trendData[i - 1]?.modal;
        const delta = prev ? d.modal - prev : 0;
        const pct = prev ? (delta / prev) * 100 : 0;
        return { ...d, delta, pct };
      }),
    [trendData],
  );
  const trendAvg = useMemo(
    () => (trendData.length ? Math.round(trendData.reduce((s, d) => s + d.modal, 0) / trendData.length) : 0),
    [trendData],
  );

  const QUICK_PICK = ["Onion", "Tomato", "Potato", "Wheat", "Soybean", "Cotton", "Maize", "Gram"];

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
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight flex items-center gap-3 flex-wrap">
            <CropIcon name={commodity} size={48} />
            <span>{commodity} Mandi Rate Today {market ? `in ${market}` : "in Maharashtra"}</span>
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

        {/* No-data banner */}
        {!isLoading && allRecords.length === 0 && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>No data today.</strong> None of the tracked Maharashtra APMCs have reported <em>{commodity}</em> prices to AGMARKNET yet.
            Reporting usually appears later in the day or the next working day.
          </div>
        )}

        {/* Commodity quick-pick chips */}
        <div className="flex flex-wrap gap-2">
          {QUICK_PICK.map((c) => {
            const active = c === commodity;
            return (
              <button
                key={c}
                onClick={() => setCommodity(c)}
                className={`inline-flex items-center gap-1.5 pl-1.5 pr-3.5 py-1 rounded-full text-sm font-medium border transition-all duration-200 active:scale-95 ${
                  active
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/20"
                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:text-emerald-700"
                }`}
              >
                <CropIcon name={c} size={22} className="ring-1 ring-black/5" />
                {c}
              </button>
            );
          })}
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
                  <SelectTrigger className="bg-white">
                    <div className="flex items-center gap-2">
                      <CropIcon name={commodity} size={20} />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {(commoditiesQuery.data ?? DEFAULT_COMMODITIES).map((c) => (
                      <SelectItem key={c} value={c}>
                        <span className="flex items-center gap-2">
                          <CropIcon name={c} size={18} />
                          {c}
                        </span>
                      </SelectItem>
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
              {isLoading || trendQuery.isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-700" />
                </div>
              ) : trendData.length < 2 ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-500">
                  Not enough historical data for trend.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendDataEnriched} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
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
                      cursor={{ stroke: "#059669", strokeWidth: 1, strokeDasharray: "4 4" }}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", padding: "8px 12px" }}
                      labelFormatter={(l) => fmtDateLong(String(l))}
                      formatter={(v: number, _n, p: { payload?: { delta?: number; pct?: number } }) => {
                        const d = p?.payload?.delta ?? 0;
                        const pc = p?.payload?.pct ?? 0;
                        const arrow = d > 0 ? "▲" : d < 0 ? "▼" : "→";
                        return [
                          `${formatINR(v)}  ${arrow} ${d ? `${d > 0 ? "+" : ""}${Math.round(d)} (${pc.toFixed(1)}%)` : "no change"}`,
                          "Modal Price",
                        ];
                      }}
                    />
                    {trendAvg > 0 && (
                      <ReferenceLine
                        y={trendAvg}
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                        label={{ value: `Avg ₹${trendAvg}`, position: "right", fontSize: 10, fill: "#64748b" }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="modal"
                      stroke="#047857"
                      strokeWidth={2.5}
                      fill="url(#gPrice)"
                      dot={{ r: 3, fill: "#047857" }}
                      activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2, fill: "#047857" }}
                      animationDuration={800}
                    />
                    {trendDataEnriched.length > 8 && (
                      <Brush
                        dataKey="date"
                        height={22}
                        stroke="#047857"
                        travellerWidth={10}
                        tickFormatter={(s) => String(s).slice(5)}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interactive APMC comparison bar chart */}
        {allReportingMandis.length > 1 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Compare APMC Prices Today</h2>
                  <p className="text-sm text-slate-600">
                    Tap a bar to see that mandi's details. Highest in green, lowest in rose.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-600" /> Best</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-amber-500" /> Selected</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-rose-500" /> Lowest</span>
                </div>
              </div>
              <div style={{ height: Math.max(220, allReportingMandis.length * 32) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={allReportingMandis}
                    layout="vertical"
                    margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
                  >
                    <CartesianGrid stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `₹${v}`} />
                    <YAxis
                      type="category"
                      dataKey="market"
                      width={120}
                      tick={{ fontSize: 12, fill: "#0f172a" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(16,185,129,0.08)" }}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                      formatter={(v: number) => [formatINR(v), "Modal Price"]}
                    />
                    <Bar
                      dataKey="modalPrice"
                      radius={[0, 6, 6, 0]}
                      animationDuration={700}
                      onClick={(d: { market?: string }) => d?.market && setMarket(d.market)}
                      cursor="pointer"
                    >
                      {allReportingMandis.map((r) => {
                        const color =
                          r.market === bestMandi?.market
                            ? "#059669"
                            : r.market === lowestMandi?.market
                              ? "#f43f5e"
                              : r.market === market
                                ? "#f59e0b"
                                : "#10b981aa";
                        return <Cell key={r.market} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nearby mandis */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Nearby Mandis for {commodity} Prices {selected?.district ? `In ${selected.district}` : ""}
              </h2>
              <p className="text-sm text-slate-600">
                Compare {commodity} mandi prices in nearby markets to find the best selling price today.
              </p>
            </div>
            <div className="inline-flex rounded-lg border bg-slate-100 p-1 text-xs font-medium self-start">
              {[
                { k: "high" as const, label: "Price ↓" },
                { k: "low" as const, label: "Price ↑" },
                { k: "name" as const, label: "A–Z" },
              ].map((opt) => (
                <button
                  key={opt.k}
                  onClick={() => setNearbySort(opt.k)}
                  className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                    nearbySort === opt.k ? "bg-emerald-700 text-white shadow" : "text-slate-700 hover:bg-white"
                  }`}
                >
                  <ArrowUpDown className="h-3 w-3" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : sortedNearby.length === 0 ? (
            <p className="text-sm text-slate-500">No other reporting mandis on {fmtDateLong(latestDate)}.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sortedNearby.map((m) => {
                const isBest = bestMandi && m.market === bestMandi.market;
                const isLowest = lowestMandi && m.market === lowestMandi.market;
                const isSelected = m.market === market;
                return (
                  <button
                    key={m.market}
                    onClick={() => setMarket(m.market)}
                    className={`relative text-left rounded-xl border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] group ${
                      isSelected
                        ? "border-emerald-600 ring-2 ring-emerald-500/30 shadow-md"
                        : "border-slate-200 hover:border-emerald-400"
                    }`}
                  >
                    {isBest && (
                      <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                        <Award className="h-3 w-3" /> Best
                      </span>
                    )}
                    {isLowest && !isBest && (
                      <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-[10px] font-bold">
                        <TrendingDown className="h-3 w-3" /> Lowest
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <Sprout className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      {m.market}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{m.district || "Maharashtra"}</div>
                    <div className="mt-2 text-lg font-bold text-slate-900">
                      {formatINR(m.modalPrice)}
                      <span className="text-xs font-normal text-slate-500"> /qtl</span>
                    </div>
                    {bestMandi && (
                      <div className="mt-1 text-[11px] text-slate-500">
                        {m.modalPrice === bestMandi.modalPrice
                          ? "Top price today"
                          : `${formatINR(bestMandi.modalPrice - m.modalPrice)} below top`}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* All Maharashtra mandis grid */}
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
    <Card className="border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-300 cursor-default group">
      <CardContent className="p-5 space-y-2">
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 group-hover:text-emerald-700 transition-colors">{label}</div>
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