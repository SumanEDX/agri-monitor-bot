import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Droplets, TrendingUp, Thermometer, Sun, Wind, CloudRain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const crops = [
  { id: "wheat", name: "Wheat", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&crop=center", avgCwp: 6.75 },
  { id: "rice", name: "Rice", image: "https://images.unsplash.com/photo-1536304993881-460346024534?w=400&h=300&fit=crop&crop=center", avgCwp: 5.20 },
  { id: "maize", name: "Maize", image: "https://images.unsplash.com/photo-1601593768892-eb0e8e089dfa?w=400&h=300&fit=crop&crop=center", avgCwp: 7.10 },
  { id: "soybean", name: "Soybean", image: "https://images.unsplash.com/photo-1599709524901-52f0385eb8ee?w=400&h=300&fit=crop&crop=center", avgCwp: 4.80 },
  { id: "cotton", name: "Cotton", image: "https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=400&h=300&fit=crop&crop=center", avgCwp: 3.90 },
];

interface EnvParam {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  icon: React.ReactNode;
}

const envParams: EnvParam[] = [
  { key: "maxTemp", label: "Max Temp", unit: "°C", min: 0, max: 60, step: 0.1, defaultValue: 42, icon: <Thermometer className="w-4 h-4 text-destructive" /> },
  { key: "avgTemp", label: "Avg Temp", unit: "°C", min: 0, max: 50, step: 0.1, defaultValue: 24.3, icon: <Thermometer className="w-4 h-4 text-warning" /> },
  { key: "minTemp", label: "Min Temp", unit: "°C", min: -10, max: 30, step: 0.1, defaultValue: 8.6, icon: <Thermometer className="w-4 h-4 text-primary" /> },
  { key: "solarRadiation", label: "Solar Radiation", unit: "MJ m⁻² day⁻¹", min: 0, max: 20, step: 0.1, defaultValue: 8.5, icon: <Sun className="w-4 h-4 text-warning" /> },
  { key: "humidity", label: "Humidity", unit: "%", min: 0, max: 100, step: 0.5, defaultValue: 11.5, icon: <Droplets className="w-4 h-4 text-primary" /> },
  { key: "windSpeed", label: "Wind Speed", unit: "m/s", min: 0, max: 15, step: 0.1, defaultValue: 2.7, icon: <Wind className="w-4 h-4 text-muted-foreground" /> },
  { key: "soilMoisture", label: "Soil Moisture", unit: "Fraction", min: 0, max: 1, step: 0.01, defaultValue: 0.7, icon: <Droplets className="w-4 h-4 text-success" /> },
  { key: "precipitation", label: "Precipitation", unit: "mm", min: 0, max: 20, step: 0.1, defaultValue: 4, icon: <CloudRain className="w-4 h-4 text-primary" /> },
];

const CropWaterProductivity = () => {
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const [params, setParams] = useState<Record<string, number>>(
    Object.fromEntries(envParams.map((p) => [p.key, p.defaultValue]))
  );

  const crop = crops.find((c) => c.id === selectedCrop)!;

  const prediction = useMemo(() => {
    // Simulated prediction based on environmental parameters
    const base = crop.avgCwp;
    const tempEffect = (params.avgTemp - 25) * -0.05;
    const moistureEffect = (params.soilMoisture - 0.5) * 2;
    const humidityEffect = (params.humidity - 50) * -0.01;
    const radiationEffect = (params.solarRadiation - 10) * 0.1;
    const precipEffect = (params.precipitation - 5) * 0.05;

    const cwp = Math.max(0.5, base + tempEffect + moistureEffect + humidityEffect + radiationEffect + precipEffect);
    const uncertainty = 0.05 + Math.random() * 0.08;

    return {
      cwp: Number(cwp.toFixed(2)),
      uncertainty: Number(uncertainty.toFixed(2)),
    };
  }, [params, crop]);

  const qualityLabel = prediction.cwp >= 5 ? "Excellent" : prediction.cwp >= 3.5 ? "Good" : prediction.cwp >= 2 ? "Fair" : "Poor";
  const qualityColor = prediction.cwp >= 5 ? "text-success" : prediction.cwp >= 3.5 ? "text-primary" : prediction.cwp >= 2 ? "text-warning" : "text-destructive";
  const productivityPercent = Math.min(100, (prediction.cwp / 6) * 100);

  const handleParamChange = (key: string, value: number[]) => {
    setParams((prev) => ({ ...prev, [key]: value[0] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Crop Water Productivity Predictor</h1>
        <p className="text-muted-foreground mt-1">Adjust environmental parameters to predict crop water productivity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Crop Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Crop Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <img src={crop.image} alt={crop.name} className="w-14 h-14 rounded-lg object-cover" />
                <div>
                  <p className="text-sm text-muted-foreground">Selected Crop</p>
                  <p className="font-semibold text-primary">{crop.name}</p>
                </div>
              </div>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {crops.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <img src={c.image} alt={c.name} className="w-6 h-6 rounded object-cover" />
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Environmental Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Environmental Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {envParams.map((param) => (
                <div key={param.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {param.icon}
                      <span className="text-sm font-medium text-foreground">{param.label} ({param.unit})</span>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {params[param.key].toFixed(2)}
                    </Badge>
                  </div>
                  <Slider
                    value={[params[param.key]]}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    onValueChange={(v) => handleParamChange(param.key, v)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{param.min}</span>
                    <span>{param.max}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Prediction Results */}
          <Card className="border-primary/30 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5" />
                Prediction Results
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Selected Crop */}
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-2">Selected Crop</p>
                <img src={crop.image} alt={crop.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
                <Badge className="bg-primary text-primary-foreground">{crop.name}</Badge>
              </div>

              {/* Predicted CWP */}
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Predicted CWP</p>
                <div className="mt-2 p-4 rounded-xl bg-muted/50 border">
                  <p className="text-4xl font-bold text-primary">{prediction.cwp}</p>
                  <p className="text-sm text-muted-foreground">± {prediction.uncertainty}</p>
                </div>
              </div>

              {/* Quality Assessment */}
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Quality Assessment</p>
                <div className="mt-2 p-3 rounded-lg bg-muted/30 border">
                  <p className={`text-lg font-bold ${qualityColor}`}>{qualityLabel}</p>
                </div>
              </div>

              {/* Productivity Index */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Productivity Index</span>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <Progress value={productivityPercent} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span>
                  <span>6+</span>
                </div>
              </div>

              {/* CWP Info */}
              <div className="p-3 rounded-lg bg-muted/30 border text-center">
                <p className="text-xs font-medium text-foreground">Crop Water Productivity (CWP)</p>
                <p className="text-xs text-muted-foreground mt-1">Measured in kg/m³ of water used</p>
              </div>
            </CardContent>
          </Card>

          {/* Historical Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historical Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 rounded-xl bg-muted/30 border">
                <p className="text-sm text-muted-foreground">Average CWP (Last 5 Years)</p>
                <p className="text-3xl font-bold text-foreground mt-1">{crop.avgCwp}</p>
                <p className="text-xs text-muted-foreground mt-1">kg/m³ of water</p>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs font-medium text-primary">5-Year Historical Average</p>
                <p className="text-xs text-muted-foreground mt-1">Based on {crop.name} performance data</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CropWaterProductivity;
