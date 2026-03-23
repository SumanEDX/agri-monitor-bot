import { Users, Map, ClipboardList, Sprout, TrendingUp, Droplets, Sun, ThermometerSun } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const recentActivities = [
  { id: 1, action: "Fertilizer applied", plot: "Plot A - Wheat", time: "2 hours ago", status: "completed" },
  { id: 2, action: "Irrigation scheduled", plot: "Plot B - Rice", time: "4 hours ago", status: "pending" },
  { id: 3, action: "Pest inspection", plot: "Plot C - Cotton", time: "6 hours ago", status: "in-progress" },
  { id: 4, action: "Harvest started", plot: "Plot D - Corn", time: "1 day ago", status: "completed" },
  { id: 5, action: "Soil testing", plot: "Plot E - Soybean", time: "1 day ago", status: "completed" },
];

const cropHealth = [
  { crop: "Wheat", health: 92, area: "12 acres" },
  { crop: "Rice", health: 78, area: "8 acres" },
  { crop: "Cotton", health: 85, area: "15 acres" },
  { crop: "Corn", health: 65, area: "10 acres" },
];

const statusColors: Record<string, string> = {
  completed: "bg-primary/15 text-primary border-0",
  pending: "bg-warning/15 text-warning border-0",
  "in-progress": "bg-info/15 text-info border-0",
};

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your farm overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Farmers" value={248} change="+12 this month" icon={Users} variant="primary" />
        <StatCard title="Active Plots" value={156} change="45 acres total" icon={Map} variant="info" />
        <StatCard title="Pending Tasks" value={23} change="8 due today" icon={ClipboardList} variant="warning" />
        <StatCard title="Crop Varieties" value={18} change="3 new this season" icon={Sprout} variant="default" />
      </div>

      {/* Weather + Crop Health */}
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
            {cropHealth.map((crop) => (
              <div key={crop.crop} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-sm">{crop.crop}</span>
                    <span className="text-xs text-muted-foreground ml-2">({crop.area})</span>
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

      {/* Recent Activities */}
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
