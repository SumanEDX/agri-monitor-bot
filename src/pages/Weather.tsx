import { Cloud, Droplets, Wind, Sun, CloudRain, ThermometerSun, Eye, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";

const iconMap: Record<string, React.FC<{ className?: string }>> = { Sun, Cloud, CloudRain };

interface ForecastDay { day: string; iconName: string; temp: string; condition: string; }
interface WeatherMetric { label: string; value: string; }

const Weather = () => {
  const { t } = useI18n();
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
  const [deleteMetricConfirm, setDeleteMetricConfirm] = useState(false);
  const [deleteForecastConfirm, setDeleteForecastConfirm] = useState(false);

  const [tempForm, setTempForm] = useState(currentTemp);
  const [condForm, setCondForm] = useState(currentCondition);
  const [locForm, setLocForm] = useState(location);
  const [metricForm, setMetricForm] = useState({ label: "", value: "" });
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
        <h1 className="text-2xl font-bold">{t("weather")}</h1>
        <p className="text-muted-foreground mt-1">{t("currentConditions")}</p>
      </div>

      <Card className="border-border bg-gradient-to-br from-primary/10 to-accent relative">
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8" onClick={() => { setTempForm(currentTemp); setCondForm(currentCondition); setLocForm(location); setEditCurrent(true); }}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t("currentWeather")}</p>
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
            <Card key={idx} className="border-border relative group">
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setMetricForm({ ...item }); setEditMetricIdx(idx); }}><Pencil className="w-3 h-3" /></Button>
              </div>
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
                <div key={idx} className="text-center p-3 rounded-xl bg-muted hover:bg-accent transition-colors relative group">
                  <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setForecastForm({ ...day }); setEditForecastIdx(idx); }}><Pencil className="w-2.5 h-2.5" /></Button>
                  </div>
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

      {/* Edit Current Weather */}
      <Dialog open={editCurrent} onOpenChange={setEditCurrent}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("editCurrentWeather")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("temperature")}</Label><Input value={tempForm} onChange={(e) => setTempForm(e.target.value)} /></div>
            <div><Label>{t("condition")}</Label><Input value={condForm} onChange={(e) => setCondForm(e.target.value)} /></div>
            <div><Label>{t("location")}</Label><Input value={locForm} onChange={(e) => setLocForm(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCurrent(false)}>{t("cancel")}</Button>
            <Button onClick={() => { setCurrentTemp(tempForm); setCurrentCondition(condForm); setLocation(locForm); setEditCurrent(false); }}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Metric with Delete */}
      <Dialog open={editMetricIdx !== null} onOpenChange={(open) => { if (!open) setEditMetricIdx(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("editMetric")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("label")}</Label><Input value={metricForm.label} onChange={(e) => setMetricForm({ ...metricForm, label: e.target.value })} /></div>
            <div><Label>{t("value")}</Label><Input value={metricForm.value} onChange={(e) => setMetricForm({ ...metricForm, value: e.target.value })} /></div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="destructive" onClick={() => setDeleteMetricConfirm(true)}>{t("delete")}</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditMetricIdx(null)}>{t("cancel")}</Button>
              <Button onClick={() => { if (editMetricIdx !== null) { setMetrics((prev) => prev.map((m, i) => (i === editMetricIdx ? metricForm : m))); setEditMetricIdx(null); } }}>{t("save")}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Forecast with Delete */}
      <Dialog open={editForecastIdx !== null} onOpenChange={(open) => { if (!open) setEditForecastIdx(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("editForecastDay")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("day")}</Label><Input value={forecastForm.day} onChange={(e) => setForecastForm({ ...forecastForm, day: e.target.value })} /></div>
            <div><Label>{t("temperature")}</Label><Input value={forecastForm.temp} onChange={(e) => setForecastForm({ ...forecastForm, temp: e.target.value })} /></div>
            <div><Label>{t("condition")}</Label><Input value={forecastForm.condition} onChange={(e) => setForecastForm({ ...forecastForm, condition: e.target.value })} /></div>
            <div><Label>{t("icon")}</Label><Select value={forecastForm.iconName} onValueChange={(v) => setForecastForm({ ...forecastForm, iconName: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Sun">Sunny</SelectItem><SelectItem value="Cloud">Cloudy</SelectItem><SelectItem value="CloudRain">Rain</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="destructive" onClick={() => setDeleteForecastConfirm(true)}>{t("delete")}</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditForecastIdx(null)}>{t("cancel")}</Button>
              <Button onClick={() => { if (editForecastIdx !== null) { setForecast((prev) => prev.map((f, i) => (i === editForecastIdx ? forecastForm : f))); setEditForecastIdx(null); } }}>{t("save")}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Metric Confirm */}
      <AlertDialog open={deleteMetricConfirm} onOpenChange={setDeleteMetricConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t("deleteMetric")}</AlertDialogTitle><AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{t("cancel")}</AlertDialogCancel><AlertDialogAction onClick={() => { if (editMetricIdx !== null) { setMetrics((prev) => prev.filter((_, i) => i !== editMetricIdx)); setEditMetricIdx(null); setDeleteMetricConfirm(false); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("delete")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Forecast Confirm */}
      <AlertDialog open={deleteForecastConfirm} onOpenChange={setDeleteForecastConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t("deleteForecastDay")}</AlertDialogTitle><AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{t("cancel")}</AlertDialogCancel><AlertDialogAction onClick={() => { if (editForecastIdx !== null) { setForecast((prev) => prev.filter((_, i) => i !== editForecastIdx)); setEditForecastIdx(null); setDeleteForecastConfirm(false); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("delete")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Weather;
