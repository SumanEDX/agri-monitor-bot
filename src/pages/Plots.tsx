import { Plus, Ruler, Droplets, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const plotsData = [
  { id: 1, name: "Plot A", crop: "Wheat", area: "12 acres", farmer: "Rajesh Kumar", health: 92, stage: "Flowering", irrigation: "Drip", soilMoisture: 72 },
  { id: 2, name: "Plot B", crop: "Rice", area: "8 acres", farmer: "Suresh Reddy", health: 78, stage: "Vegetative", irrigation: "Flood", soilMoisture: 88 },
  { id: 3, name: "Plot C", crop: "Cotton", area: "15 acres", farmer: "Anita Sharma", health: 85, stage: "Boll Opening", irrigation: "Sprinkler", soilMoisture: 55 },
  { id: 4, name: "Plot D", crop: "Corn", area: "10 acres", farmer: "Vikram Singh", health: 65, stage: "Tasseling", irrigation: "Drip", soilMoisture: 60 },
  { id: 5, name: "Plot E", crop: "Soybean", area: "6 acres", farmer: "Anita Sharma", health: 88, stage: "Pod Filling", irrigation: "Rain-fed", soilMoisture: 45 },
  { id: 6, name: "Plot F", crop: "Sugarcane", area: "20 acres", farmer: "Suresh Reddy", health: 91, stage: "Grand Growth", irrigation: "Drip", soilMoisture: 80 },
];

const healthColor = (h: number) => (h >= 80 ? "text-primary" : h >= 60 ? "text-warning" : "text-destructive");

const Plots = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Plots & Fields</h1>
        <p className="text-muted-foreground mt-1">{plotsData.length} active plots</p>
      </div>
      <Button className="gap-2"><Plus className="w-4 h-4" /> Add Plot</Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {plotsData.map((plot) => (
        <Card key={plot.id} className="border-border hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{plot.name}</h3>
                <p className="text-sm text-muted-foreground">{plot.farmer}</p>
              </div>
              <Badge variant="secondary">{plot.crop}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg bg-muted">
                <Ruler className="w-4 h-4 mx-auto text-muted-foreground" />
                <p className="text-xs text-muted-foreground mt-1">Area</p>
                <p className="text-sm font-semibold">{plot.area}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted">
                <Leaf className="w-4 h-4 mx-auto text-primary" />
                <p className="text-xs text-muted-foreground mt-1">Stage</p>
                <p className="text-sm font-semibold">{plot.stage}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted">
                <Droplets className="w-4 h-4 mx-auto text-info" />
                <p className="text-xs text-muted-foreground mt-1">Moisture</p>
                <p className="text-sm font-semibold">{plot.soilMoisture}%</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Crop Health</span>
                <span className={`font-semibold ${healthColor(plot.health)}`}>{plot.health}%</span>
              </div>
              <Progress value={plot.health} className="h-2" />
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Irrigation: {plot.irrigation}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default Plots;
