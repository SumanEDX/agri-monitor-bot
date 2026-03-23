import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const SettingsPage = () => (
  <div className="space-y-6 max-w-2xl">
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground mt-1">Manage your farm profile and preferences.</p>
    </div>

    <Card className="border-border">
      <CardHeader><CardTitle className="text-lg">Farm Profile</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Farm Name</Label>
          <Input defaultValue="Green Valley Farm" />
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input defaultValue="Nashik, Maharashtra, India" />
        </div>
        <div className="space-y-2">
          <Label>Total Area (acres)</Label>
          <Input defaultValue="71" type="number" />
        </div>
        <Button>Save Changes</Button>
      </CardContent>
    </Card>

    <Card className="border-border">
      <CardHeader><CardTitle className="text-lg">Notifications</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {["Weather Alerts", "Task Reminders", "Crop Health Warnings"].map((item) => (
          <div key={item} className="flex items-center justify-between">
            <Label>{item}</Label>
            <Switch defaultChecked />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default SettingsPage;
