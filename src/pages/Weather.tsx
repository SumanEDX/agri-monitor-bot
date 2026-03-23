import { Cloud, Droplets, Wind, Sun, CloudRain, ThermometerSun, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const forecast = [
  { day: "Mon", icon: Sun, temp: "30°", condition: "Sunny" },
  { day: "Tue", icon: Cloud, temp: "28°", condition: "Cloudy" },
  { day: "Wed", icon: CloudRain, temp: "24°", condition: "Rain" },
  { day: "Thu", icon: CloudRain, temp: "22°", condition: "Rain" },
  { day: "Fri", icon: Sun, temp: "29°", condition: "Sunny" },
  { day: "Sat", icon: Cloud, temp: "27°", condition: "Cloudy" },
  { day: "Sun", icon: Sun, temp: "31°", condition: "Sunny" },
];

const Weather = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Weather</h1>
      <p className="text-muted-foreground mt-1">Current conditions and forecast for your farm.</p>
    </div>

    <Card className="border-border bg-gradient-to-br from-primary/10 to-accent">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Current Weather</p>
            <p className="text-6xl font-bold mt-2">28°C</p>
            <p className="text-lg text-muted-foreground mt-1">Partly Cloudy</p>
            <p className="text-sm text-muted-foreground mt-0.5">Nashik, Maharashtra</p>
          </div>
          <Sun className="w-24 h-24 text-warning/70" />
        </div>
      </CardContent>
    </Card>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { icon: Droplets, label: "Humidity", value: "65%", color: "text-info" },
        { icon: Wind, label: "Wind Speed", value: "12 km/h", color: "text-muted-foreground" },
        { icon: ThermometerSun, label: "Feels Like", value: "31°C", color: "text-destructive" },
        { icon: Eye, label: "Visibility", value: "10 km", color: "text-primary" },
      ].map((item) => (
        <Card key={item.label} className="border-border">
          <CardContent className="p-5 text-center">
            <item.icon className={`w-6 h-6 mx-auto ${item.color}`} />
            <p className="text-xs text-muted-foreground mt-2">{item.label}</p>
            <p className="text-xl font-bold mt-1">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card className="border-border">
      <CardHeader><CardTitle className="text-lg">7-Day Forecast</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-3">
          {forecast.map((day) => (
            <div key={day.day} className="text-center p-3 rounded-xl bg-muted hover:bg-accent transition-colors">
              <p className="text-sm font-medium text-muted-foreground">{day.day}</p>
              <day.icon className="w-8 h-8 mx-auto my-3 text-foreground/70" />
              <p className="text-lg font-bold">{day.temp}</p>
              <p className="text-xs text-muted-foreground mt-1">{day.condition}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Weather;
