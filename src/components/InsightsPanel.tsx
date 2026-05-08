import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowRight, Trophy, ArrowDown, Scale } from "lucide-react";
import type { CleanRecord } from "@/utils/dataCleaner";
import type { HistoricalPoint } from "@/services/apiService";

const fmtINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

interface Props {
  records: CleanRecord[];
  historicalData: HistoricalPoint[];
}

export default function InsightsPanel({ records, historicalData }: Props) {
  const sorted = [...records].sort((a, b) => b.modalPrice - a.modalPrice);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const spread = best && worst ? best.modalPrice - worst.modalPrice : 0;

  let trend: "up" | "down" | "stable" = "stable";
  if (historicalData.length >= 2) {
    const sortedHist = [...historicalData].sort((a, b) => a.date.localeCompare(b.date));
    const today = sortedHist[sortedHist.length - 1];
    const target = new Date(today.date);
    target.setDate(target.getDate() - 7);
    const targetIso = target.toISOString().slice(0, 10);
    const prior = sortedHist.reduce((acc, p) => (p.date <= targetIso && (!acc || p.date > acc.date) ? p : acc), null as HistoricalPoint | null) ?? sortedHist[0];
    if (prior && prior.avgModalPrice > 0) {
      const pct = ((today.avgModalPrice - prior.avgModalPrice) / prior.avgModalPrice) * 100;
      if (pct > 2) trend = "up";
      else if (pct < -2) trend = "down";
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-success/40 bg-success/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-success" /> Best Mandi Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          {best ? (
            <>
              <div className="text-xl font-bold text-success">{best.market}</div>
              <p className="text-sm font-semibold mt-1">{fmtINR(best.modalPrice)}</p>
            </>
          ) : <p className="text-muted-foreground text-sm">No data</p>}
        </CardContent>
      </Card>

      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ArrowDown className="h-4 w-4 text-destructive" /> Lowest Price Mandi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {worst ? (
            <>
              <div className="text-xl font-bold text-destructive">{worst.market}</div>
              <p className="text-sm font-semibold mt-1">{fmtINR(worst.modalPrice)}</p>
            </>
          ) : <p className="text-muted-foreground text-sm">No data</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Scale className="h-4 w-4" /> Price Spread
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{fmtINR(spread)}</div>
          <p className="text-xs text-muted-foreground mt-1">per quintal</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Trend (vs 7d ago)</CardTitle>
        </CardHeader>
        <CardContent>
          {trend === "up" ? (
            <div className="flex items-center gap-2 text-success font-bold text-xl">
              <TrendingUp className="h-5 w-5" /> ↑ Rising
            </div>
          ) : trend === "down" ? (
            <div className="flex items-center gap-2 text-destructive font-bold text-xl">
              <TrendingDown className="h-5 w-5" /> ↓ Falling
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-500 font-bold text-xl">
              <ArrowRight className="h-5 w-5" /> → Stable
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}