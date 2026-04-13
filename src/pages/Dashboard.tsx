import { Users, Map, ClipboardList, Droplets as DropletsIcon, TrendingUp, Sun, ThermometerSun, Droplets, Cloud, CloudRain, Loader2, Mic, MicOff, Search } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n, type Language } from "@/lib/i18n";
import FarmerChatbot from "@/components/FarmerChatbot";

const NASHIK_LAT = 19.9975;
const NASHIK_LNG = 73.7898;

const langToBcp47: Record<Language, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  te: "te-IN",
};

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
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  const handleSearch = useCallback(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    if (q.includes("farmer") || q.includes("किसान") || q.includes("शेतकरी") || q.includes("விவசாயி") || q.includes("రైతు")) {
      navigate("/farmers");
    } else if (q.includes("plot") || q.includes("खेत") || q.includes("शेत") || q.includes("நிலம்") || q.includes("భూమి")) {
      navigate("/plots");
    } else if (q.includes("task") || q.includes("कार्य") || q.includes("काम") || q.includes("பணி") || q.includes("పని")) {
      navigate("/tasks");
    } else if (q.includes("water") || q.includes("जल") || q.includes("पाणी") || q.includes("நீர்") || q.includes("నీరు")) {
      navigate("/water-sources");
    } else if (q.includes("weather") || q.includes("मौसम") || q.includes("हवामान") || q.includes("வானிலை") || q.includes("వాతావరణ")) {
      navigate("/weather");
    } else {
      navigate("/farmers");
    }
  }, [searchQuery, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const toggleVoice = useCallback(() => {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert(t("voiceNotSupported"));
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = langToBcp47[language] || "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, language, t]);

  return (
    <>
      <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your farm overview.</p>
      </div>

      {/* Voice-enabled Search Bar */}
      <div className="flex gap-2 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={listening ? t("voiceListening") : t("searchDashboard")}
            className="pl-10"
          />
        </div>
        <Button
          size="icon"
          variant={listening ? "destructive" : "outline"}
          onClick={toggleVoice}
          title={t("voiceSearch")}
        >
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
        <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
          {t("search")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title={t("totalFarmers")} value={farmersCount} change="Live from database" icon={Users} variant="primary" />
        <StatCard title="Active Plots" value={plotsCount} change="Live from database" icon={Map} variant="info" />
        <StatCard title="Total Tasks" value={tasksCount} change="Live from database" icon={ClipboardList} variant="warning" />
        <StatCard title={t("waterSources")} value={waterSourcesCount} change="Live from database" icon={DropletsIcon} variant="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sun className="w-5 h-5 text-warning" />
              {t("weatherOverview")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weatherLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : weather ? (
              <>
                <div className="text-center py-4">
                  {(() => { const WIcon = weatherIconMap[weather.iconName] || Sun; return <WIcon className="w-10 h-10 mx-auto text-warning/70 mb-2" />; })()}
                  <p className="text-5xl font-bold text-foreground">{weather.temp}°C</p>
                  <p className="text-muted-foreground mt-1">{weather.condition}</p>
                  <p className="text-xs text-muted-foreground">Nashik, Maharashtra</p>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <Droplets className="w-4 h-4 mx-auto text-info" />
                    <p className="text-xs text-muted-foreground mt-1">{t("humidity")}</p>
                    <p className="text-sm font-semibold">{weather.humidity}%</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <ThermometerSun className="w-4 h-4 mx-auto text-destructive" />
                    <p className="text-xs text-muted-foreground mt-1">{t("feelsLike")}</p>
                    <p className="text-sm font-semibold">{weather.feelsLike}°C</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <TrendingUp className="w-4 h-4 mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground mt-1">{t("windSpeed")}</p>
                    <p className="text-sm font-semibold">{weather.wind} km/h</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Unable to load weather</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t("cropHealthOverview")}</CardTitle>
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
            <CardTitle className="text-lg">{t("recentActivities")}</CardTitle>
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

      <FarmerChatbot farmContext={{
        weather: weather ? { temp: weather.temp, condition: weather.condition, humidity: weather.humidity, feelsLike: weather.feelsLike, wind: weather.wind } : undefined,
        cropHealth: cropHealth.length > 0 ? cropHealth.map(c => ({ crop: c.crop, health: c.health, area: c.area })) : undefined,
        stats: { farmers: farmersCount, plots: plotsCount, tasks: tasksCount, waterSources: waterSourcesCount },
      }} />
    </>
  );
};

export default Dashboard;
