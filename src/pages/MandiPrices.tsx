import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ArrowDown, ArrowUp, BarChart3, CalendarDays, Download, IndianRupee, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";

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

type DistrictSummary = {
  district: string;
  state: string;
  markets: number;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  absoluteDiff: number;
  percentDiff: number;
};

const crops = ["Onion", "Sugarcane", "Wheat", "Rice", "Maize", "Cotton", "Soyabean", "Tomato", "Potato", "Gram", "Bajra", "Jowar", "Banana", "Apple", "Mango", "Garlic", "Ginger"];
const states = ["Maharashtra", "Gujarat", "Karnataka", "Madhya Pradesh", "Punjab", "Rajasthan", "Uttar Pradesh", "Tamil Nadu", "Telangana", "West Bengal", "Andhra Pradesh", "Bihar", "Haryana", "Kerala", "Odisha"];

const chartConfig = {
  modalPrice: { label: "Modal price", color: "hsl(var(--primary))" },
  districtPrice: { label: "District price", color: "hsl(var(--secondary))" },
} satisfies ChartConfig;

const currency = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const today = new Date().toISOString().slice(0, 10);
const monthAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const stddev = (values: number[]) => {
  if (values.length < 2) return 0;
  const mean = average(values);
  return Math.sqrt(average(values.map((v) => (v - mean) ** 2)));
};

const MandiPrices = () => {
  const [crop, setCrop] = useState("Onion");
  const [scope, setScope] = useState<"State" | "India">("State");
  const [state, setState] = useState("Maharashtra");
  const [baseDistrict, setBaseDistrict] = useState("Nashik");
  const [startDate, setStartDate] = useState(monthAgo);
  const [endDate, setEndDate] = useState(today);

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["mandi-prices", crop, state, scope, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("mandi-prices", {
        body: { crop, state: scope === "India" ? "" : state, district: "", scope, startDate, endDate },
      });
      if (error) throw error;
      return data as { records: MandiRecord[]; source: string; cappedDays?: boolean; usedLatestAvailable?: boolean; latestAvailableDate?: string };
    },
  });

  const records = data?.records ?? [];
  const latestDate = records.map((r) => r.date).sort().at(-1) ?? "";

  const districtSummaries = useMemo<DistrictSummary[]>(() => {
    const latestRecords = records.filter((r) => r.date === latestDate && r.modalPrice);
    const grouped = latestRecords.reduce<Record<string, MandiRecord[]>>((acc, r) => {
      const key = `${r.state}-${r.district}`;
      acc[key] = [...(acc[key] ?? []), r];
      return acc;
    }, {});

    const baseRecords = latestRecords.filter((r) => r.district.toLowerCase() === baseDistrict.toLowerCase());
    const basePrice = average(baseRecords.map((r) => r.modalPrice ?? 0).filter(Boolean));

    return Object.values(grouped)
      .map((items) => {
        const modalPrice = average(items.map((i) => i.modalPrice ?? 0).filter(Boolean));
        const absoluteDiff = modalPrice - basePrice;
        return {
          district: items[0].district,
          state: items[0].state,
          markets: items.length,
          modalPrice,
          minPrice: Math.min(...items.map((i) => i.minPrice ?? modalPrice)),
          maxPrice: Math.max(...items.map((i) => i.maxPrice ?? modalPrice)),
          absoluteDiff,
          percentDiff: basePrice ? (absoluteDiff / basePrice) * 100 : 0,
        };
      })
      .sort((a, b) => b.modalPrice - a.modalPrice);
  }, [baseDistrict, latestDate, records]);

  const baseSummary = districtSummaries.find((i) => i.district.toLowerCase() === baseDistrict.toLowerCase());
  const highest = districtSummaries[0];
  const lowest = districtSummaries.at(-1);

  const timeSeries = useMemo(() => {
    const grouped = records.reduce<Record<string, number[]>>((acc, r) => {
      if (r.district.toLowerCase() === baseDistrict.toLowerCase() && r.modalPrice) {
        acc[r.date] = [...(acc[r.date] ?? []), r.modalPrice];
      }
      return acc;
    }, {});
    return Object.entries(grouped).map(([date, prices]) => ({ date, modalPrice: Math.round(average(prices)) })).sort((a, b) => a.date.localeCompare(b.date));
  }, [baseDistrict, records]);

  const trend = timeSeries.length > 1 ? timeSeries.at(-1)!.modalPrice - timeSeries[0].modalPrice : 0;
  const volatility = Math.round(stddev(timeSeries.map((p) => p.modalPrice)));
  const barData = districtSummaries.slice(0, 12).map((i) => ({ district: i.district, districtPrice: Math.round(i.modalPrice) }));

  const downloadCsv = () => {
    const headers = ["District", "State", "Markets", "Modal Price", "Min Price", "Max Price", "Diff vs Base", "Diff %"];
    const rows = districtSummaries.map((i) => [i.district, i.state, i.markets, Math.round(i.modalPrice), Math.round(i.minPrice), Math.round(i.maxPrice), Math.round(i.absoluteDiff), i.percentDiff.toFixed(2)]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mandi-${crop}-${latestDate || today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mandi Price Intelligence</h1>
          <p className="mt-1 text-muted-foreground">AGMARKNET prices · comparisons use latest available date · trends use historical range.</p>
          {latestDate ? <Badge variant="secondary" className="mt-2"><CalendarDays className="mr-1 h-3 w-3" />Data as of {latestDate}{data?.usedLatestAvailable ? " (latest available)" : ""}</Badge> : null}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadCsv} disabled={!districtSummaries.length}><Download className="mr-2 h-4 w-4" />CSV</Button>
          <Button onClick={() => refetch()} disabled={isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />Refresh</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Filters</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="space-y-2"><Label>Crop</Label><Select value={crop} onValueChange={setCrop}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{crops.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Scope</Label><ToggleGroup type="single" value={scope} onValueChange={(v) => v && setScope(v as "State" | "India")} className="justify-start"><ToggleGroupItem value="State">State</ToggleGroupItem><ToggleGroupItem value="India">India</ToggleGroupItem></ToggleGroup></div>
          <div className="space-y-2"><Label>State</Label><Select value={state} onValueChange={setState} disabled={scope === "India"}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Base district</Label><Input value={baseDistrict} onChange={(e) => setBaseDistrict(e.target.value)} placeholder="Nashik" /></div>
          <div className="space-y-2"><Label>From (trend)</Label><Input type="date" value={startDate} max={endDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          <div className="space-y-2"><Label>To (trend)</Label><Input type="date" value={endDate} min={startDate} max={today} onChange={(e) => setEndDate(e.target.value)} /></div>
        </CardContent>
      </Card>

      {error ? <Card className="border-destructive/30"><CardContent className="p-4 text-sm text-destructive">Unable to fetch mandi prices. Try a different crop, scope, or date.</CardContent></Card> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><IndianRupee className="h-5 w-5 text-primary" /><div><p className="text-sm text-muted-foreground">{baseDistrict} modal price</p><p className="text-2xl font-bold">₹{currency.format(baseSummary?.modalPrice ?? 0)}</p><p className="text-xs text-muted-foreground">{baseSummary ? `${baseSummary.markets} market(s)` : "No data for base"}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><ArrowUp className="h-5 w-5 text-success" /><div><p className="text-sm text-muted-foreground">Best district to sell</p><p className="text-xl font-bold">{highest?.district ?? "—"}</p><p className="text-xs text-muted-foreground">₹{currency.format(highest?.modalPrice ?? 0)} / qtl{highest?.state ? ` · ${highest.state}` : ""}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><ArrowDown className="h-5 w-5 text-destructive" /><div><p className="text-sm text-muted-foreground">Lowest district</p><p className="text-xl font-bold">{lowest?.district ?? "—"}</p><p className="text-xs text-muted-foreground">₹{currency.format(lowest?.modalPrice ?? 0)} / qtl{lowest?.state ? ` · ${lowest.state}` : ""}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3">{trend >= 0 ? <TrendingUp className="h-5 w-5 text-success" /> : <TrendingDown className="h-5 w-5 text-destructive" />}<div><p className="text-sm text-muted-foreground">{baseDistrict} trend · volatility</p><p className="text-xl font-bold">{trend >= 0 ? "Rising" : "Falling"} ₹{currency.format(Math.abs(trend))}</p><p className="text-xs text-muted-foreground">σ ₹{currency.format(volatility)}</p></div></div></CardContent></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CalendarDays className="h-5 w-5 text-primary" />Trend · {baseDistrict} ({timeSeries.length} days)</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <LineChart data={timeSeries}><CartesianGrid vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} /><YAxis tickFormatter={(v) => `₹${v}`} width={70} /><ChartTooltip content={<ChartTooltipContent />} /><Line type="monotone" dataKey="modalPrice" stroke="var(--color-modalPrice)" strokeWidth={3} dot={false} /></LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="h-5 w-5 text-secondary" />District comparison · {latestDate || "latest"}</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <BarChart data={barData}><CartesianGrid vertical={false} /><XAxis dataKey="district" tickLine={false} axisLine={false} tickMargin={8} interval={0} angle={-20} textAnchor="end" height={70} /><YAxis tickFormatter={(v) => `₹${v}`} width={70} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="districtPrice" fill="var(--color-districtPrice)" radius={[6, 6, 0, 0]} /></BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Comparison table · latest data ({districtSummaries.length} districts)</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>District</TableHead><TableHead>State</TableHead><TableHead>Markets</TableHead><TableHead>Modal</TableHead><TableHead>Min</TableHead><TableHead>Max</TableHead><TableHead>vs {baseDistrict}</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {districtSummaries.map((i) => (
                <TableRow key={`${i.state}-${i.district}`} className={i.district === highest?.district ? "bg-primary/5" : i.district === lowest?.district ? "bg-destructive/5" : undefined}>
                  <TableCell className="font-medium">{i.district}</TableCell><TableCell>{i.state}</TableCell><TableCell>{i.markets}</TableCell><TableCell>₹{currency.format(i.modalPrice)}</TableCell><TableCell>₹{currency.format(i.minPrice)}</TableCell><TableCell>₹{currency.format(i.maxPrice)}</TableCell>
                  <TableCell><span className={i.absoluteDiff >= 0 ? "text-success" : "text-destructive"}>{i.absoluteDiff >= 0 ? "+" : ""}₹{currency.format(i.absoluteDiff)} ({i.percentDiff.toFixed(1)}%)</span></TableCell>
                  <TableCell>{i.district === highest?.district ? <Badge className="bg-primary text-primary-foreground">Highest</Badge> : i.district === lowest?.district ? <Badge variant="destructive">Lowest</Badge> : <Badge variant="secondary">Market</Badge>}</TableCell>
                </TableRow>
              ))}
              {!districtSummaries.length ? <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">{isFetching ? "Loading mandi data…" : "No mandi records found. Try another crop, scope, or date range."}</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MandiPrices;
