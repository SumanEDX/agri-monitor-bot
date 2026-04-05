import { Cloud, Droplets, Wind, Sun, CloudRain, ThermometerSun, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

const NASHIK_LAT = 19.9975;
const NASHIK_LNG = 73.7898;

interface WeatherMetric { label: string; value: string; }
interface ForecastDay { day: string; iconName: string; temp: string; condition: string; }

const wmoToCondition = (code: number): { condition: string; iconName: string } => {
  if (code === 0) return { condition: "Clear Sky", iconName: "Sun" };
  if (code <= 3) return { condition: "Partly Cloudy", iconName: "Cloud" };
  if (code <= 48) return { condition: "Foggy", iconName: "Cloud" };
  if (code <= 67) return { condition: "Rain", iconName: "CloudRain" };
  if (code <= 77) return { condition: "Snow", iconName: "Cloud" };
  if (code <= 99) return { condition: "Thunderstorm", iconName: "CloudRain" };
  return { condition: "Unknown", iconName: "Cloud" };
};

const iconMap: Record<string, React.FC<{ className?: string }>> = { Sun, Cloud, CloudRain };

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Weather = () => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTemp, setCurrentTemp] = useState("");
  const [currentCondition, setCurrentCondition] = useState("");
  const [currentIconName, setCurrentIconName] = useState("Sun");
  const [metrics, setMetrics] = useState<WeatherMetric[]>([]);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${NASHIK_LAT}&longitude=${NASHIK_LNG}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility&daily=temperature_2m_max,weather_code&timezone=Asia%2FKolkata&forecast_days=7`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch weather data");
        const data = await res.json();

        const current = data.current;
        const { condition, iconName } = wmoToCondition(current.weather_code);
        setCurrentTemp(`${Math.round(current.temperature_2m)}°C`);
        setCurrentCondition(condition);
        setCurrentIconName(iconName);

        setMetrics([
          { label: "Humidity", value: `${current.relative_humidity_2m}%` },
          { label: "Wind Speed", value: `${Math.round(current.wind_speed_10m)} km/h` },
          { label: "Feels Like", value: `${Math.round(current.apparent_temperature)}°C` },
          { label: "Visibility", value: current.visibility ? `${Math.round(current.visibility / 1000)} km` : "N/A" },
        ]);

        const daily = data.daily;
        const forecastDays: ForecastDay[] = daily.time.map((dateStr: string, i: number) => {
          const date = new Date(dateStr);
          const { condition: cond, iconName: icon } = wmoToCondition(daily.weather_code[i]);
          return {
            day: dayNames[date.getDay()],
            iconName: icon,
            temp: `${Math.round(daily.temperature_2m_max[i])}°`,
            condition: cond,
          };
        });
        setForecast(forecastDays);
      } catch (err: any) {
        setError(err.message || "Failed to load weather");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000); // refresh every 15 min
    return () => clearInterval(interval);
  }, []);

  const metricIcons: Record<string, { icon: React.FC<{ className?: string }>; color: string }> = {
    Humidity: { icon: Droplets, color: "text-info" },
    "Wind Speed": { icon: Wind, color: "text-muted-foreground" },
    "Feels Like": { icon: ThermometerSun, color: "text-destructive" },
    Visibility: { icon: Eye, color: "text-primary" },
  };

  const CurrentIcon = iconMap[currentIconName] || Sun;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading weather data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("weather")}</h1>
        <p className="text-muted-foreground mt-1">{t("currentConditions")}</p>
      </div>

      <Card className="border-border bg-gradient-to-br from-primary/10 to-accent">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t("currentWeather")}</p>
              <p className="text-6xl font-bold mt-2">{currentTemp}</p>
              <p className="text-lg text-muted-foreground mt-1">{currentCondition}</p>
              <p className="text-sm text-muted-foreground mt-0.5">Nashik, Maharashtra</p>
            </div>
            <CurrentIcon className="w-24 h-24 text-warning/70" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((item, idx) => {
          const meta = metricIcons[item.label] || { icon: Eye, color: "text-primary" };
          const Icon = meta.icon;
          return (
            <Card key={idx} className="border-border">
              <CardContent className="p-5 text-center">
                <Icon className={`w-6 h-6 mx-auto ${meta.color}`} />
                <p className="text-xs text-muted-foreground mt-2">{item.label}</p>
                <p className="text-xl font-bold mt-1">{item.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border">
        <CardHeader><CardTitle className="text-lg">{t("sevenDayForecast")}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3">
            {forecast.map((day, idx) => {
              const Icon = iconMap[day.iconName] || Sun;
              return (
                <div key={idx} className="text-center p-3 rounded-xl bg-muted hover:bg-accent transition-colors">
                  <p className="text-sm font-medium text-muted-foreground">{day.day}</p>
                  <Icon className="w-8 h-8 mx-auto my-3 text-foreground/70" />
                  <p className="text-lg font-bold">{day.temp}</p>
                  <p className="text-xs text-muted-foreground mt-1">{day.condition}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Weather;
