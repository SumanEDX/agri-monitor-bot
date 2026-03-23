import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Droplets, Search, MapPin, Activity, TrendingUp, Waves } from "lucide-react";

interface WaterSource {
  id: string;
  name: string;
  type: "Borewell" | "Canal" | "River" | "Pond" | "Rainwater" | "Tank";
  location: string;
  capacityLiters: number;
  currentLevelPercent: number;
  status: "Active" | "Low" | "Dry" | "Maintenance";
  linkedPlots: number;
  lastChecked: string;
}

const waterSources: WaterSource[] = [
  { id: "1", name: "Main Borewell #1", type: "Borewell", location: "North Field", capacityLiters: 50000, currentLevelPercent: 78, status: "Active", linkedPlots: 5, lastChecked: "2026-03-22" },
  { id: "2", name: "Irrigation Canal A", type: "Canal", location: "East Block", capacityLiters: 200000, currentLevelPercent: 62, status: "Active", linkedPlots: 12, lastChecked: "2026-03-21" },
  { id: "3", name: "Farm Pond", type: "Pond", location: "Central Area", capacityLiters: 80000, currentLevelPercent: 35, status: "Low", linkedPlots: 4, lastChecked: "2026-03-23" },
  { id: "4", name: "Rainwater Harvester", type: "Rainwater", location: "South Block", capacityLiters: 15000, currentLevelPercent: 90, status: "Active", linkedPlots: 3, lastChecked: "2026-03-23" },
  { id: "5", name: "River Intake Point", type: "River", location: "West Boundary", capacityLiters: 500000, currentLevelPercent: 55, status: "Active", linkedPlots: 8, lastChecked: "2026-03-20" },
  { id: "6", name: "Storage Tank #2", type: "Tank", location: "South Field", capacityLiters: 30000, currentLevelPercent: 10, status: "Dry", linkedPlots: 2, lastChecked: "2026-03-19" },
  { id: "7", name: "Borewell #3", type: "Borewell", location: "East Field", capacityLiters: 45000, currentLevelPercent: 0, status: "Maintenance", linkedPlots: 0, lastChecked: "2026-03-18" },
  { id: "8", name: "Canal B Extension", type: "Canal", location: "North Block", capacityLiters: 150000, currentLevelPercent: 48, status: "Active", linkedPlots: 6, lastChecked: "2026-03-22" },
];

const statusColor: Record<WaterSource["status"], string> = {
  Active: "bg-success/10 text-success border-success/30",
  Low: "bg-warning/10 text-warning border-warning/30",
  Dry: "bg-destructive/10 text-destructive border-destructive/30",
  Maintenance: "bg-muted text-muted-foreground border-muted",
};

const levelColor = (pct: number) =>
  pct >= 60 ? "bg-success" : pct >= 30 ? "bg-warning" : "bg-destructive";

const WaterSources = () => {
  const [search, setSearch] = useState("");

  const filtered = waterSources.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.type.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase())
  );

  const totalSources = waterSources.length;
  const activeSources = waterSources.filter((s) => s.status === "Active").length;
  const avgLevel = Math.round(waterSources.reduce((a, s) => a + s.currentLevelPercent, 0) / totalSources);
  const totalLinkedPlots = waterSources.reduce((a, s) => a + s.linkedPlots, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Water Sources</h1>
        <p className="text-muted-foreground mt-1">Monitor and manage all water sources across your farm</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalSources}</p>
              <p className="text-xs text-muted-foreground">Total Sources</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeSources}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Waves className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgLevel}%</p>
              <p className="text-xs text-muted-foreground">Avg Level</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalLinkedPlots}</p>
              <p className="text-xs text-muted-foreground">Linked Plots</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search water sources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Water Source Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((source) => (
          <Card key={source.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">{source.name}</CardTitle>
                </div>
                <Badge variant="outline" className={statusColor[source.status]}>
                  {source.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{source.location}</span>
                <Badge variant="secondary" className="text-xs">{source.type}</Badge>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Water Level</span>
                  <span className="font-medium text-foreground">{source.currentLevelPercent}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${levelColor(source.currentLevelPercent)}`} style={{ width: `${source.currentLevelPercent}%` }} />
                </div>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Capacity: {(source.capacityLiters / 1000).toFixed(0)}k L</span>
                <span>{source.linkedPlots} plots linked</span>
              </div>
              <p className="text-xs text-muted-foreground">Last checked: {source.lastChecked}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No water sources found matching your search.</div>
      )}
    </div>
  );
};

export default WaterSources;
