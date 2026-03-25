import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";

const SettingsPage = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">{t("settings")}</h1>
        <p className="text-muted-foreground mt-1">{t("manageProfile")}</p>
      </div>

      <Card className="border-border">
        <CardHeader><CardTitle className="text-lg">{t("farmProfile")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("farmName")}</Label>
            <Input defaultValue="Green Valley Farm" />
          </div>
          <div className="space-y-2">
            <Label>{t("location")}</Label>
            <Input defaultValue="Nashik, Maharashtra, India" />
          </div>
          <div className="space-y-2">
            <Label>{t("totalArea")}</Label>
            <Input defaultValue="71" type="number" />
          </div>
          <Button>{t("saveChanges")}</Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader><CardTitle className="text-lg">{t("notifications")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[t("weatherAlerts"), t("taskReminders"), t("cropHealthWarnings")].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <Label>{item}</Label>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
