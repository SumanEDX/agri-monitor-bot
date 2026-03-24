import { Cloud, Droplets, Wind, Sun, CloudRain, ThermometerSun, Eye, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const iconMap: Record<string, React.FC<{ className?: string }>> = { Sun, Cloud, CloudRain };

interface ForecastDay { day: string; iconName: string; temp: string; condition: string; }
interface WeatherMetric { label: string; value: string; }

const Weather = () => {
  const [currentTemp, setCurrentTemp] = useState("28°C");
  const [currentCondition, setCurrentCondition] = useState("Partly Cloudy");
  const [location, setLocation] = useState("Nashik, Maharashtra");
  const [metrics, setMetrics] = useState<WeatherMetric[]>([
    { label: "Humidity", value: "65%" },
    { label: "Wind Speed", value: "12 km/h" },
    { label: "Feels Like", value: "31°C" },
    { label: "Visibility", value: "10 km" },
  ]);
  const [forecast, setForecast] = useState<ForecastDay[]>([
    { day: "Mon", iconName: "Sun", temp: "30°", condition: "Sunny" },
    { day: "Tue", iconName: "Cloud", temp: "28°", condition: "Cloudy" },
    { day: "Wed", iconName: "CloudRain", temp: "24°", condition: "Rain" },
    { day: "Thu", iconName: "CloudRain", temp: "22°", condition: "Rain" },
    { day: "Fri", iconName: "Sun", temp: "29°", condition: "Sunny" },
    { day: "Sat", iconName: "Cloud", temp: "27°", condition: "Cloudy" },
    { day: "Sun", iconName: "Sun", temp: "31°", condition: "Sunny" },
  ]);

  const [editCurrent, setEditCurrent] = useState(false);
  const [editMetricIdx, setEditMetricIdx] = useState<number | null>(null);
  const [editForecastIdx, setEditForecastIdx] = useState<number | null>(null);

  // Current weather form
  const [tempForm, setTempForm] = useState(currentTemp);
  const [condForm, setCondForm] = useState(currentCondition);
  const [locForm, setLocForm] = useState(location);

  // Metric form
  const [metricForm, setMetricForm] = useState({ label: "", value: "" });

  // Forecast form
  const [forecastForm, setForecastForm] = useState<ForecastDay>({ day: "", iconName: "Sun", temp: "", condition: "" });

  const metricIcons: Record<string, { icon: React.FC<{ className?: string }>; color: string }> = {
    Humidity: { icon: Droplets, color: "text-info" },
    "Wind Speed": { icon: Wind, color: "text-muted-foreground" },
    "Feels Like": { icon: ThermometerSun, color: "text-destructive" },
    Visibility: { icon: Eye, color: "text-primary" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Weather</h1>
        <p className="text-muted-foreground mt-1">Current conditions and forecast for your farm.</p>
      </div>

      <Card className="border-border bg-gradient-to-br from-primary/10 to-accent relative">
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8" onClick={() => { setTempForm(currentTemp); setCondForm(currentCondition); setLocForm(location); setEditCurrent(true); }}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Current Weather</p>
              <p className="text-6xl font-bold mt-2">{currentTemp}</p>
              <p className="text-lg text-muted-foreground mt-1">{currentCondition}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{location}</p>
            </div>
            <Sun className="w-24 h-24 text-warning/70" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((item, idx) => {
          const meta = metricIcons[item.label] || { icon: Eye, color: "text-primary" };
          const Icon = meta.icon;
          return (
            <Card key={item.label} className="border-border relative group">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setMetricForm({ ...item }); setEditMetricIdx(idx); }}>
                <Pencil className="w-3 h-3" />
              </Button>
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
        <CardHeader><CardTitle className="text-lg">7-Day Forecast</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3">
            {forecast.map((day, idx) => {
              const Icon = iconMap[day.iconName] || Sun;
              return (
                <div key={day.day} className="text-center p-3 rounded-xl bg-muted hover:bg-accent transition-colors relative group cursor-pointer" onClick={() => { setForecastForm({ ...day }); setEditForecastIdx(idx); }}>
                  <p className="text-sm font-medium text-muted-foreground">{day.day}</p>
                  <Icon className="w-8 h-8 mx-auto my-3 text-foreground/70" />
                  <p className="text-lg font-bold">{day.temp}</p>
                  <p className="text-xs text-muted-foreground mt-1">{day.condition}</p>
                  <Pencil className="w-3 h-3 absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Current Weather */}
      <Dialog open={editCurrent} onOpenChange={setEditCurrent}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Current Weather</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Temperature</Label><Input value={tempForm} onChange={(e) => setTempForm(e.target.value)} /></div>
            <div><Label>Condition</Label><Input value={condForm} onChange={(e) => setCondForm(e.target.value)} /></div>
            <div><Label>Location</Label><Input value={locForm} onChange={(e) => setLocForm(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCurrent(false)}>Cancel</Button>
            <Button onClick={() => { setCurrentTemp(tempForm); setCurrentCondition(condForm); setLocation(locForm); setEditCurrent(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Metric */}
      <Dialog open={editMetricIdx !== null} onOpenChange={(open) => { if (!open) setEditMetricIdx(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Metric</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Label</Label><Input value={metricForm.label} onChange={(e) => setMetricForm({ ...metricForm, label: e.target.value })} /></div>
            <div><Label>Value</Label><Input value={metricForm.value} onChange={(e) => setMetricForm({ ...metricForm, value: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMetricIdx(null)}>Cancel</Button>
            <Button onClick={() => { if (editMetricIdx !== null) { setMetrics((prev) => prev.map((m, i) => (i === editMetricIdx ? metricForm : m))); setEditMetricIdx(null); } }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Forecast */}
      <Dialog open={editForecastIdx !== null} onOpenChange={(open) => { if (!open) setEditForecastIdx(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Forecast Day</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Day</Label><Input value={forecastForm.day} onChange={(e) => setForecastForm({ ...forecastForm, day: e.target.value })} /></div>
            <div><Label>Temperature</Label><Input value={forecastForm.temp} onChange={(e) => setForecastForm({ ...forecastForm, temp: e.target.value })} /></div>
            <div><Label>Condition</Label><Input value={forecastForm.condition} onChange={(e) => setForecastForm({ ...forecastForm, condition: e.target.value })} /></div>
            <div>
              <Label>Icon</Label>
              <Select value={forecastForm.iconName} onValueChange={(v) => setForecastForm({ ...forecastForm, iconName: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sun">Sunny</SelectItem>
                  <SelectItem value="Cloud">Cloudy</SelectItem>
                  <SelectItem value="CloudRain">Rain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditForecastIdx(null)}>Cancel</Button>
            <Button onClick={() => { if (editForecastIdx !== null) { setForecast((prev) => prev.map((f, i) => (i === editForecastIdx ? forecastForm : f))); setEditForecastIdx(null); } }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Weather;
