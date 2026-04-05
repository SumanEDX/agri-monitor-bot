import { Users, Map, ClipboardList, Droplets as DropletsIcon, TrendingUp, Sun, ThermometerSun, Droplets, Cloud, CloudRain, Loader2 } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const NASHIK_LAT = 19.9975;
const NASHIK_LNG = 73.7898;

const wmoToCondition = (code: number): { condition: string; iconName: string } => {
  if (code === 0) return { condition: "Clear Sky", iconName: "Sun" };
  if (code <= 3) return { condition: "Partly Cloudy", iconName: "Cloud" };
  if (code <= 48) return { condition: "Foggy", iconName: "Cloud" };
  if (code <= 67) return { condition: "Rain", iconName: "CloudRain" };
  if (code <= 77) return { condition: "Snow", iconName: "Cloud" };
  if (code <= 99) return { condition: "Thunderstorm", iconName: "CloudRain" };
  return { condition: "Unknown", iconName: "Cloud" };
};

const weatherIconMap: Record<string, React.FC<{ className?: string }>> = { Sun, Cloud, CloudRain };

const fetchWeatherData = async () => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${NASHIK_LAT}&longitude=${NASHIK_LNG}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather");
  const data = await res.json();
  const c = data.current;
  const { condition, iconName } = wmoToCondition(c.weather_code);
  return {
    temp: Math.round(c.temperature_2m),
    condition,
    iconName,
    humidity: c.relative_humidity_2m,
    feelsLike: Math.round(c.apparent_temperature),
    wind: Math.round(c.wind_speed_10m),
  };
};

const recentActivities = [
  { id: 1, action: "Fertilizer applied", plot: "Plot A - Wheat", time: "2 hours ago", status: "completed" },
  { id: 2, action: "Irrigation scheduled", plot: "Plot B - Rice", time: "4 hours ago", status: "pending" },
  { id: 3, action: "Pest inspection", plot: "Plot C - Cotton", time: "6 hours ago", status: "in-progress" },
  { id: 4, action: "Harvest started", plot: "Plot D - Corn", time: "1 day ago", status: "completed" },
  { id: 5, action: "Soil testing", plot: "Plot E - Soybean", time: "1 day ago", status: "completed" },
];

const statusColors: Record<string, string> = {
  completed: "bg-primary/15 text-primary border-0",
  pending: "bg-warning/15 text-warning border-0",
  "in-progress": "bg-info/15 text-info border-0",
};

const fetchCount = async (table: "farmers" | "plots" | "tasks" | "water_sources") => {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
};

const fetchCropHealth = async () => {
  const { data, error } = await supabase.from("plots").select("crop, health, area");
  if (error) throw error;
  return data ?? [];
};

const Dashboard = () => {
  const queryClient = useQueryClient();
  const { data: weather, isLoading: weatherLoading } = useQuery({
    queryKey: ["dashboard-weather"],
    queryFn: fetchWeatherData,
    refetchInterval: 15 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
  });

  const { data: farmersCount = 0 } = useQuery({ queryKey: ["farmers-count"], queryFn: () => fetchCount("farmers") });
  const { data: plotsCount = 0 } = useQuery({ queryKey: ["plots-count"], queryFn: () => fetchCount("plots") });
  const { data: tasksCount = 0 } = useQuery({ queryKey: ["tasks-count"], queryFn: () => fetchCount("tasks") });
  const { data: waterSourcesCount = 0 } = useQuery({ queryKey: ["water-sources-count"], queryFn: () => fetchCount("water_sources") });
  const { data: cropHealth = [] } = useQuery({ queryKey: ["crop-health"], queryFn: fetchCropHealth });

  // Realtime subscriptions to auto-update counts
  useEffect(() => {
    const channels = ["farmers", "plots", "tasks", "water_sources"].map((table) =>
      supabase
        .channel(`dashboard-${table}`)
        .on("postgres_changes", { event: "*", schema: "public", table }, () => {
          queryClient.invalidateQueries({ queryKey: [`${table === "water_sources" ? "water-sources" : table}-count`] });
          if (table === "plots") {
            queryClient.invalidateQueries({ queryKey: ["crop-health"] });
          }
        })
        .subscribe()
    );
    return () => { channels.forEach((ch) => supabase.removeChannel(ch)); };
  }, [queryClient]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your farm overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Farmers" value={farmersCount} change="Live from database" icon={Users} variant="primary" />
        <StatCard title="Active Plots" value={plotsCount} change="Live from database" icon={Map} variant="info" />
        <StatCard title="Total Tasks" value={tasksCount} change="Live from database" icon={ClipboardList} variant="warning" />
        <StatCard title="Water Sources" value={waterSourcesCount} change="Live from database" icon={DropletsIcon} variant="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sun className="w-5 h-5 text-warning" />
              Today's Weather
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-5xl font-bold text-foreground">28°C</p>
              <p className="text-muted-foreground mt-1">Partly Cloudy</p>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 rounded-lg bg-muted">
                <Droplets className="w-4 h-4 mx-auto text-info" />
                <p className="text-xs text-muted-foreground mt-1">Humidity</p>
                <p className="text-sm font-semibold">65%</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <ThermometerSun className="w-4 h-4 mx-auto text-destructive" />
                <p className="text-xs text-muted-foreground mt-1">Heat Index</p>
                <p className="text-sm font-semibold">31°C</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <TrendingUp className="w-4 h-4 mx-auto text-primary" />
                <p className="text-xs text-muted-foreground mt-1">Wind</p>
                <p className="text-sm font-semibold">12 km/h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Crop Health Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {cropHealth.length === 0 && (
              <p className="text-sm text-muted-foreground">No plots found. Add plots to see crop health.</p>
            )}
            {cropHealth.map((crop, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-sm">{crop.crop || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground ml-2">({crop.area || "N/A"})</span>
                  </div>
                  <span className={`text-sm font-semibold ${crop.health >= 80 ? "text-primary" : crop.health >= 60 ? "text-warning" : "text-destructive"}`}>
                    {crop.health}%
                  </span>
                </div>
                <Progress value={crop.health} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.plot}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusColors[activity.status]}>{activity.status}</Badge>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
