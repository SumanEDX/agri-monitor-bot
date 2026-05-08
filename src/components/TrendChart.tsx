import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { HistoricalPoint } from "@/services/apiService";

interface Props {
  historicalData: HistoricalPoint[];
  trendDays: 7 | 15 | 30;
  onTrendDaysChange: (days: 7 | 15 | 30) => void;
  cropName: string;
}

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const fmtINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export default function TrendChart({ historicalData, trendDays, onTrendDaysChange, cropName }: Props) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - trendDays);
  const data = [...historicalData]
    .filter((p) => new Date(p.date) >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p) => ({ ...p, label: fmtDate(p.date) }));

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <h3 className="font-semibold">Price Trend — {cropName} (₹/quintal)</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Average modal price across allowed APMCs</p>
        </div>
        <div className="flex gap-1 rounded-lg border p-1 bg-muted/30">
          {[7, 15, 30].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={trendDays === d ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => onTrendDaysChange(d as 7 | 15 | 30)}
            >
              {d}D
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No historical data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                labelFormatter={(l, items) => {
                  const item = items?.[0]?.payload as HistoricalPoint | undefined;
                  return item ? new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : l;
                }}
                formatter={(v: number) => [fmtINR(v), "Avg Modal"]}
              />
              <Line
                type="monotone"
                dataKey="avgModalPrice"
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
  );
}