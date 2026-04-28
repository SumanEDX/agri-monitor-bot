import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ArrowDown, ArrowUp, BarChart3, CalendarDays, IndianRupee, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

const crops = ["Onion", "Sugarcane", "Wheat", "Rice", "Maize", "Cotton", "Soyabean", "Tomato", "Potato", "Gram"];
const states = ["Maharashtra", "Gujarat", "Karnataka", "Madhya Pradesh", "Punjab", "Rajasthan", "Uttar Pradesh", "Tamil Nadu", "Telangana", "West Bengal"];
const maharashtraDistricts = ["All", "Nashik", "Pune", "Ahmednagar", "Solapur", "Satara", "Sangli", "Jalgaon", "Nagpur", "Kolhapur", "Aurangabad"];

const chartConfig = {
  modalPrice: { label: "Modal price", color: "hsl(var(--primary))" },
  districtPrice: { label: "District price", color: "hsl(var(--secondary))" },
} satisfies ChartConfig;

const currency = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const today = new Date().toISOString().slice(0, 10);
const weekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const MandiPrices = () => {
  const [crop, setCrop] = useState("Onion");
  const state = "Maharashtra";
  const [district, setDistrict] = useState("All");
  const [baseDistrict, setBaseDistrict] = useState("Nashik");
  const scope = "Maharashtra";
  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["mandi-prices", crop, state, district, scope, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("mandi-prices", {
        body: { crop, state, district: district === "All" ? "" : district, scope, startDate, endDate },
      });
      if (error) throw error;
      return data as { records: MandiRecord[]; source: string; cappedDays?: boolean; usedLatestAvailable?: boolean; latestAvailableDate?: string };
    },
  });

  const records = data?.records ?? [];
  const latestDate = records.map((record) => record.date).sort().at(-1) ?? endDate;

  const districtSummaries = useMemo<DistrictSummary[]>(() => {
    const latestRecords = records.filter((record) => record.date === latestDate && record.modalPrice);
    const grouped = latestRecords.reduce<Record<string, MandiRecord[]>>((acc, record) => {
      const key = `${record.state}-${record.district}`;
      acc[key] = [...(acc[key] ?? []), record];
      return acc;
    }, {});

    const baseRecords = latestRecords.filter((record) => record.district.toLowerCase() === baseDistrict.toLowerCase());
    const basePrice = average(baseRecords.map((record) => record.modalPrice ?? 0).filter(Boolean));

    return Object.values(grouped)
      .map((items) => {
        const modalPrice = average(items.map((item) => item.modalPrice ?? 0).filter(Boolean));
        const absoluteDiff = modalPrice - basePrice;
        return {
          district: items[0].district,
          state: items[0].state,
          markets: items.length,
          modalPrice,
          minPrice: Math.min(...items.map((item) => item.minPrice ?? modalPrice)),
          maxPrice: Math.max(...items.map((item) => item.maxPrice ?? modalPrice)),
          absoluteDiff,
          percentDiff: basePrice ? (absoluteDiff / basePrice) * 100 : 0,
        };
      })
      .sort((a, b) => b.modalPrice - a.modalPrice);
  }, [baseDistrict, latestDate, records]);

  const baseSummary = districtSummaries.find((item) => item.district.toLowerCase() === baseDistrict.toLowerCase());
  const highest = districtSummaries[0];
  const lowest = districtSummaries.at(-1);

  const timeSeries = useMemo(() => {
    const grouped = records.reduce<Record<string, number[]>>((acc, record) => {
      if (record.district.toLowerCase() === baseDistrict.toLowerCase() && record.modalPrice) {
        acc[record.date] = [...(acc[record.date] ?? []), record.modalPrice];
      }
      return acc;
    }, {});
    return Object.entries(grouped).map(([date, prices]) => ({ date, modalPrice: Math.round(average(prices)) })).sort((a, b) => a.date.localeCompare(b.date));
  }, [baseDistrict, records]);

  const trend = timeSeries.length > 1 ? timeSeries.at(-1)!.modalPrice - timeSeries[0].modalPrice : 0;
  const volatility = timeSeries.length > 2 ? average(timeSeries.slice(1).map((point, index) => Math.abs(point.modalPrice - timeSeries[index].modalPrice))) : 0;
  const barData = districtSummaries.slice(0, 12).map((item) => ({ district: item.district, districtPrice: Math.round(item.modalPrice) }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mandi Price Analytics</h1>
          <p className="mt-1 text-muted-foreground">Historical and latest AGMARKNET prices across Indian mandis.</p>
        </div>
        <Button onClick={() => refetch()} disabled={isFetching} className="w-full lg:w-auto">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh data
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Filters</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2"><Label>Crop</Label><Select value={crop} onValueChange={setCrop}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{crops.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>District</Label><Select value={district} onValueChange={setDistrict}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{maharashtraDistricts.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Base district</Label><Input value={baseDistrict} onChange={(event) => setBaseDistrict(event.target.value)} /></div>
          <div className="space-y-2"><Label>From</Label><Input type="date" value={startDate} max={endDate} onChange={(event) => setStartDate(event.target.value)} /></div>
          <div className="space-y-2"><Label>To</Label><Input type="date" value={endDate} min={startDate} max={today} onChange={(event) => setEndDate(event.target.value)} /></div>
        </CardContent>
      </Card>

      {error ? <Card className="border-destructive/30"><CardContent className="p-4 text-sm text-destructive">Unable to fetch mandi prices. Try a recent date or broader filters.</CardContent></Card> : null}
      {data?.cappedDays ? <Card className="border-warning/30"><CardContent className="p-4 text-sm text-muted-foreground">Date range capped to 31 days for fast market analytics.</CardContent></Card> : null}
      {data?.usedLatestAvailable ? <Card className="border-warning/30"><CardContent className="p-4 text-sm text-muted-foreground">No records were available for your selected dates, so showing latest available {crop} records from {data.latestAvailableDate}.</CardContent></Card> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><IndianRupee className="h-5 w-5 text-primary" /><div><p className="text-sm text-muted-foreground">Base district price</p><p className="text-2xl font-bold">₹{currency.format(baseSummary?.modalPrice ?? 0)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><ArrowUp className="h-5 w-5 text-success" /><div><p className="text-sm text-muted-foreground">Best district to sell</p><p className="text-xl font-bold">{highest?.district ?? "No data"}</p><p className="text-xs text-muted-foreground">₹{currency.format(highest?.modalPrice ?? 0)} / quintal</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3">{trend >= 0 ? <TrendingUp className="h-5 w-5 text-success" /> : <TrendingDown className="h-5 w-5 text-destructive" />}<div><p className="text-sm text-muted-foreground">Base trend</p><p className="text-xl font-bold">{trend >= 0 ? "Increasing" : "Decreasing"}</p><p className="text-xs text-muted-foreground">₹{currency.format(Math.abs(trend))} change</p></div></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-secondary" /><div><p className="text-sm text-muted-foreground">Volatility</p><p className="text-xl font-bold">₹{currency.format(volatility)}</p><p className="text-xs text-muted-foreground">Average daily movement</p></div></div></CardContent></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CalendarDays className="h-5 w-5 text-primary" />Price vs date · {baseDistrict}</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <LineChart data={timeSeries}><CartesianGrid vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} /><YAxis tickFormatter={(value) => `₹${value}`} width={70} /><ChartTooltip content={<ChartTooltipContent />} /><Line type="monotone" dataKey="modalPrice" stroke="var(--color-modalPrice)" strokeWidth={3} dot={false} /></LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">District comparison · {latestDate}</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <BarChart data={barData}><CartesianGrid vertical={false} /><XAxis dataKey="district" tickLine={false} axisLine={false} tickMargin={8} interval={0} angle={-20} textAnchor="end" height={70} /><YAxis tickFormatter={(value) => `₹${value}`} width={70} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="districtPrice" fill="var(--color-districtPrice)" radius={[6, 6, 0, 0]} /></BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Side-by-side comparison table</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>District</TableHead><TableHead>State</TableHead><TableHead>Markets</TableHead><TableHead>Modal</TableHead><TableHead>Min</TableHead><TableHead>Max</TableHead><TableHead>Difference vs {baseDistrict}</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {districtSummaries.map((item) => (
                <TableRow key={`${item.state}-${item.district}`} className={item.district === highest?.district ? "bg-primary/5" : item.district === lowest?.district ? "bg-destructive/5" : undefined}>
                  <TableCell className="font-medium">{item.district}</TableCell><TableCell>{item.state}</TableCell><TableCell>{item.markets}</TableCell><TableCell>₹{currency.format(item.modalPrice)}</TableCell><TableCell>₹{currency.format(item.minPrice)}</TableCell><TableCell>₹{currency.format(item.maxPrice)}</TableCell>
                  <TableCell><span className={item.absoluteDiff >= 0 ? "text-success" : "text-destructive"}>{item.absoluteDiff >= 0 ? "+" : ""}₹{currency.format(item.absoluteDiff)} ({item.percentDiff.toFixed(1)}%)</span></TableCell>
                  <TableCell>{item.district === highest?.district ? <Badge className="bg-primary text-primary-foreground">Highest</Badge> : item.district === lowest?.district ? <Badge variant="destructive">Lowest</Badge> : <Badge variant="secondary">Market</Badge>}</TableCell>
                </TableRow>
              ))}
              {!districtSummaries.length ? <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No mandi records found for these filters. Try another crop or date.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MandiPrices;