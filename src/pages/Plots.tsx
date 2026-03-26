import { Plus, Ruler, Droplets, Leaf, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Plot { id: string; name: string; crop: string; area: string; farmer: string; health: number; stage: string; irrigation: string; soil_moisture: number; }

const healthColor = (h: number) => (h >= 80 ? "text-primary" : h >= 60 ? "text-warning" : "text-destructive");

const Plots = () => {
  const { t } = useI18n();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPlot, setEditPlot] = useState<Plot | null>(null);
  const [form, setForm] = useState<Plot | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<Omit<Plot, "id">>({ name: "", crop: "", area: "", farmer: "", health: 80, stage: "", irrigation: "Drip", soil_moisture: 50 });

  const fetchPlots = async () => {
    const { data, error } = await supabase.from("plots").select("*").order("created_at");
    if (error) { toast.error("Failed to load plots"); return; }
    setPlots(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPlots(); }, []);

  const openEdit = (plot: Plot) => { setEditPlot(plot); setForm({ ...plot }); };
  const saveEdit = async () => {
    if (!form) return;
    const { error } = await supabase.from("plots").update({ name: form.name, crop: form.crop, area: form.area, farmer: form.farmer, health: form.health, stage: form.stage, irrigation: form.irrigation, soil_moisture: form.soil_moisture }).eq("id", form.id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success("Plot updated"); setEditPlot(null); setForm(null); fetchPlots();
  };
  const handleDeleteFromEdit = () => { setShowDeleteConfirm(true); };
  const confirmDelete = async () => {
    if (!form) return;
    const { error } = await supabase.from("plots").delete().eq("id", form.id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Plot deleted"); setShowDeleteConfirm(false); setEditPlot(null); setForm(null); fetchPlots();
  };
  const handleAdd = async () => {
    const { error } = await supabase.from("plots").insert({ name: addForm.name, crop: addForm.crop, area: addForm.area, farmer: addForm.farmer, health: addForm.health, stage: addForm.stage, irrigation: addForm.irrigation, soil_moisture: addForm.soil_moisture });
    if (error) { toast.error("Failed to add"); return; }
    toast.success("Plot added"); setAddOpen(false);
    setAddForm({ name: "", crop: "", area: "", farmer: "", health: 80, stage: "", irrigation: "Drip", soil_moisture: 50 });
    fetchPlots();
  };

  const plotFormFields = (f: any, setF: (v: any) => void) => (
    <div className="space-y-4">
      <div><Label>{t("name")}</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div><Label>{t("crop")}</Label><Input value={f.crop} onChange={(e) => setF({ ...f, crop: e.target.value })} /></div>
      <div><Label>{t("area")}</Label><Input value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} /></div>
      <div><Label>{t("farmer")}</Label><Input value={f.farmer} onChange={(e) => setF({ ...f, farmer: e.target.value })} /></div>
      <div><Label>{t("health")} (%)</Label><Input type="number" value={f.health} onChange={(e) => setF({ ...f, health: Number(e.target.value) })} /></div>
      <div><Label>{t("growthStage")}</Label><Input value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value })} /></div>
      <div><Label>{t("irrigation")}</Label><Select value={f.irrigation} onValueChange={(v) => setF({ ...f, irrigation: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Drip", "Flood", "Sprinkler", "Rain-fed"].map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>{t("soilMoisture")} (%)</Label><Input type="number" value={f.soil_moisture} onChange={(e) => setF({ ...f, soil_moisture: Number(e.target.value) })} /></div>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("plotsAndFields")}</h1>
          <p className="text-muted-foreground mt-1">{plots.length} {t("activePlots")}</p>
        </div>
        <Button className="gap-2" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> {t("addPlot")}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plots.map((plot) => (
          <Card key={plot.id} className="border-border hover:shadow-md transition-shadow">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div><h3 className="font-semibold text-lg">{plot.name}</h3><p className="text-sm text-muted-foreground">{plot.farmer}</p></div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(plot)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Badge variant="secondary">{plot.crop}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded-lg bg-muted"><Ruler className="w-4 h-4 mx-auto text-muted-foreground" /><p className="text-xs text-muted-foreground mt-1">{t("area")}</p><p className="text-sm font-semibold">{plot.area}</p></div>
                <div className="p-2 rounded-lg bg-muted"><Leaf className="w-4 h-4 mx-auto text-primary" /><p className="text-xs text-muted-foreground mt-1">{t("growthStage")}</p><p className="text-sm font-semibold">{plot.stage}</p></div>
                <div className="p-2 rounded-lg bg-muted"><Droplets className="w-4 h-4 mx-auto text-info" /><p className="text-xs text-muted-foreground mt-1">{t("soilMoisture")}</p><p className="text-sm font-semibold">{plot.soil_moisture}%</p></div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("cropHealth")}</span><span className={`font-semibold ${healthColor(plot.health)}`}>{plot.health}%</span></div>
                <Progress value={plot.health} className="h-2" />
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground"><span>{t("irrigation")}: {plot.irrigation}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editPlot} onOpenChange={(open) => { if (!open) { setEditPlot(null); setForm(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("editPlot")}</DialogTitle></DialogHeader>
          {form && plotFormFields(form, setForm)}
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="destructive" onClick={handleDeleteFromEdit}>{t("delete")}</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setEditPlot(null); setForm(null); }}>{t("cancel")}</Button>
              <Button onClick={saveEdit}>{t("save")}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("addPlot")}</DialogTitle></DialogHeader>
          {plotFormFields(addForm, setAddForm)}
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>{t("cancel")}</Button><Button onClick={handleAdd}>{t("save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t("deletePlot")}</AlertDialogTitle><AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{t("cancel")}</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("delete")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Plots;
