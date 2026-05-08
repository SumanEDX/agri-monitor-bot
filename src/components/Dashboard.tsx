import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchLatestData, fetchHistoricalData, type HistoricalPoint } from "@/services/apiService";
import { ALLOWED_CROPS, type CleanRecord } from "@/utils/dataCleaner";
import ComparisonTable from "./ComparisonTable";
import InsightsPanel from "./InsightsPanel";
import TrendChart from "./TrendChart";

const fmtDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function Dashboard() {
  const [selectedCrop, setSelectedCrop] = useState<string>("Onion");
  const [latestRecords, setLatestRecords] = useState<CleanRecord[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalPoint[]>([]);
  const [latestDate, setLatestDate] = useState<string>("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendDays, setTrendDays] = useState<7 | 15 | 30>(7);

  const load = useCallback(async (crop: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [latest, history] = await Promise.all([
        fetchLatestData(crop),
        fetchHistoricalData(crop, 30),
      ]);
      setLatestRecords(latest.records);
      setLatestDate(latest.latestDate);
      setHistoricalData(history);
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
      setLatestRecords([]);
      setHistoricalData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(selectedCrop);
  }, [selectedCrop, load]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sprout className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Nashik Mandi Intelligence Dashboard</h1>
              <p className="text-xs text-muted-foreground">Real-time APMC price intelligence · Maharashtra</p>
            </div>
          </div>
          <div className="text-xs md:text-sm text-muted-foreground text-right">
            <div>Data as of <span className="font-semibold text-foreground">{fmtDate(latestDate)}</span></div>
            <div>Last updated: {updatedAt ? updatedAt.toLocaleTimeString("en-IN") : "—"}</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="space-y-1.5 w-full sm:w-64">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Crop</label>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ALLOWED_CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={() => load(selectedCrop)} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center space-y-3">
            <p className="text-destructive font-medium">{error}</p>
            <Button onClick={() => load(selectedCrop)} variant="outline">Retry</Button>
          </div>
        ) : latestRecords.length === 0 ? (
          <div className="rounded-lg border bg-muted/30 p-12 text-center">
            <p className="text-muted-foreground">
              No data available for <span className="font-semibold text-foreground">{selectedCrop}</span> in this region
            </p>
          </div>
        ) : (
          <>
            <ComparisonTable records={latestRecords} latestDate={latestDate} />
            <InsightsPanel records={latestRecords} historicalData={historicalData} />
            <TrendChart
              historicalData={historicalData}
              trendDays={trendDays}
              onTrendDaysChange={setTrendDays}
              cropName={selectedCrop}
            />
          </>
        )}
      </main>
    </div>
  );
}