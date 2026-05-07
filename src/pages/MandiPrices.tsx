import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  IndianRupee,
  Minus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wheat,
  Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  APMCS,
  CROPS,
  STATE_NAME,
  computeTrend,
  getCropTrend,
  getLatestByApmc,
  getLatestForApmc,
  type Trend,
} from "@/lib/mandiDataService";

const formatINR = (n: number | null | undefined) =>
  n == null ? "—" : `₹${Math.round(n).toLocaleString("en-IN")}`;

const trendMeta: Record<Trend, { label: string; icon: typeof TrendingUp; cls: string; emoji: string }> = {
  increasing: { label: "Increasing", icon: TrendingUp, cls: "bg-success/15 text-success border-success/30", emoji: "📈" },
  decreasing: { label: "Decreasing", icon: TrendingDown, cls: "bg-destructive/15 text-destructive border-destructive/30", emoji: "📉" },
  stable: { label: "Stable", icon: Minus, cls: "bg-muted text-muted-foreground border-border", emoji: "➖" },
};

export default function MandiPrices() {
  const [crop, setCrop] = useState<string>("Onion");
  const [apmc, setApmc] = useState<string>("Pune");
  const [days, setDays] = useState<7 | 15 | 30>(15);

  const latestApmc = useQuery({
    queryKey: ["mandi-latest-apmc", crop, apmc],
    queryFn: () => getLatestForApmc(crop, apmc),
  });

  const latestAll = useQuery({
    queryKey: ["mandi-latest-all", crop],
    queryFn: () => getLatestByApmc(crop),
  });

  const stateTrend = useQuery({
    queryKey: ["mandi-state-trend", crop, days],
    queryFn: () => getCropTrend(crop, days),
  });

  const apmcTrend = useQuery({
    queryKey: ["mandi-apmc-trend", crop, apmc, days],
    queryFn: () => getCropTrend(crop, days, apmc),
  });

  const trendLabel: Trend = useMemo(
    () => (apmcTrend.data ? computeTrend(apmcTrend.data) : "stable"),
    [apmcTrend.data],
  );
  const stateTrendLabel: Trend = useMemo(
    () => (stateTrend.data ? computeTrend(stateTrend.data) : "stable"),
    [stateTrend.data],
  );

  const sortedAll = useMemo(() => {
    const list = (latestAll.data ?? []).slice().sort((a, b) => b.modal - a.modal);
    return list;
  }, [latestAll.data]);

  const best = sortedAll[0];
  const worst = sortedAll[sortedAll.length - 1];
  const spread = best && worst ? best.modal - worst.modal : 0;

  // Restrict bar chart to ~8 nearby APMCs (here: top 8 by data, includes selected)
  const barData = useMemo(() => {
    if (!latestAll.data) return [];
    const set = new Map(latestAll.data.map((r) => [r.apmc, r]));
    const ordered = Array.from(set.values())
      .sort((a, b) => b.modal - a.modal)
      .slice(0, 8);
    if (!ordered.find((r) => r.apmc === apmc)) {
      const sel = set.get(apmc);
      if (sel) ordered[ordered.length - 1] = sel;
    }
    return ordered.sort((a, b) => b.modal - a.modal).map((r) => ({
      apmc: r.apmc,
      modal: r.modal,
      isBest: best && r.apmc === best.apmc,
      isSelected: r.apmc === apmc,
    }));
  }, [latestAll.data, apmc, best]);

  const TrendBadge = ({ t }: { t: Trend }) => {
    const m = trendMeta[t];
    const Icon = m.icon;
    return (
      <Badge variant="outline" className={`gap-1.5 px-3 py-1 text-sm font-semibold ${m.cls}`}>
        <span>{m.emoji}</span>
        <Icon className="h-3.5 w-3.5" />
        {m.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maharashtra Mandi Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Live APMC price analytics for farmers and traders across {STATE_NAME}.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          State: Maharashtra
        </Badge>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20 -mx-2 px-2 py-3 backdrop-blur bg-background/80 border-b border-border">
        <div className="grid gap-3 md:grid-cols-2 max-w-3xl">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Wheat className="h-3.5 w-3.5" /> Crop
            </label>
            <Select value={crop} onValueChange={setCrop}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5" /> APMC / Mandi
            </label>
            <Select value={apmc} onValueChange={setApmc}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {APMCS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Price cards row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IndianRupee className="h-4 w-4" /> Modal Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestApmc.isLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <>
                <div className="text-4xl font-bold text-primary">
                  {formatINR(latestApmc.data?.modal)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">per quintal · {apmc} APMC</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Price Range</CardTitle>
          </CardHeader>
          <CardContent>
            {latestApmc.isLoading ? (
              <Skeleton className="h-10 w-48" />
            ) : (
              <>
                <div className="text-3xl font-bold flex items-center gap-2">
                  <span className="text-destructive flex items-center"><ArrowDownRight className="h-5 w-5" />{formatINR(latestApmc.data?.min)}</span>
                  <span className="text-muted-foreground text-2xl">–</span>
                  <span className="text-success flex items-center">{formatINR(latestApmc.data?.max)}<ArrowUpRight className="h-5 w-5" /></span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">min – max at {apmc}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Trend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {apmcTrend.isLoading ? <Skeleton className="h-8 w-32" /> : <TrendBadge t={trendLabel} />}
            <p className="text-xs text-muted-foreground">Last {days} days · {apmc}</p>
          </CardContent>
        </Card>
      </div>

      {/* State trend chart */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{crop} – Maharashtra Avg. Trend</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Modal price (₹/quintal) state-wide average</p>
          </div>
          <div className="flex gap-1 rounded-lg border p-1 bg-muted/30">
            {[7, 15, 30].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={days === d ? "default" : "ghost"}
                className="h-7 px-3 text-xs"
                onClick={() => setDays(d as 7 | 15 | 30)}
              >
                {d} days
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {stateTrend.isLoading || !stateTrend.data ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stateTrend.data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(d) => d.slice(5)}
                />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  formatter={(v: number) => [formatINR(v), "Modal"]}
                />
                <Line
                  type="monotone"
                  dataKey="modal"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Nearby mandi comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Nearby Mandi Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Modal price of {crop} across major Maharashtra APMCs (highest first)
          </p>
        </CardHeader>
        <CardContent>
          {latestAll.isLoading || !barData.length ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="apmc" type="category" width={90} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  formatter={(v: number) => [formatINR(v), "Modal"]}
                />
                <Bar dataKey="modal" radius={[0, 6, 6, 0]}>
                  {barData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.isBest
                          ? "hsl(var(--success))"
                          : entry.isSelected
                            ? "hsl(var(--secondary))"
                            : "hsl(var(--primary) / 0.65)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Insights row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-success/40 bg-success/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">🏆 Best Mandi to Sell</CardTitle>
          </CardHeader>
          <CardContent>
            {best ? (
              <>
                <div className="text-2xl font-bold text-success">{best.apmc}</div>
                <p className="text-sm font-semibold mt-1">{formatINR(best.modal)}</p>
              </>
            ) : <Skeleton className="h-12 w-full" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">📉 Lowest Price Mandi</CardTitle>
          </CardHeader>
          <CardContent>
            {worst ? (
              <>
                <div className="text-2xl font-bold text-destructive">{worst.apmc}</div>
                <p className="text-sm font-semibold mt-1">{formatINR(worst.modal)}</p>
              </>
            ) : <Skeleton className="h-12 w-full" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">↔️ Price Spread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(spread)}</div>
            <p className="text-xs text-muted-foreground mt-1">max − min across mandis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">🌾 State-wide Trend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <TrendBadge t={stateTrendLabel} />
            <p className="text-xs text-muted-foreground">Maharashtra · last {days}d</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
