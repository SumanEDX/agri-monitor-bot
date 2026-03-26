import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Droplets, Search, MapPin, Activity, TrendingUp, Waves, Pencil, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WaterSource {
  id: string; name: string; type: string;
  location: string; capacity_liters: number; current_level_percent: number;
  status: string; linked_plots: number; last_checked: string;
}

const statusColor: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/30",
  Low: "bg-warning/10 text-warning border-warning/30",
  Dry: "bg-destructive/10 text-destructive border-destructive/30",
  Maintenance: "bg-muted text-muted-foreground border-muted",
};

const levelColor = (pct: number) => pct >= 60 ? "bg-success" : pct >= 30 ? "bg-warning" : "bg-destructive";

const WaterSources = () => {
  const { t } = useI18n();
  const [sources, setSources] = useState<WaterSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editSource, setEditSource] = useState<WaterSource | null>(null);
  const [form, setForm] = useState<WaterSource | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<Omit<WaterSource, "id">>({ name: "", type: "Borewell", location: "", capacity_liters: 0, current_level_percent: 0, status: "Active", linked_plots: 0, last_checked: new Date().toISOString().split("T")[0] });

  const fetchSources = async () => {
    const { data, error } = await supabase.from("water_sources").select("*").order("created_at");
    if (error) { toast.error("Failed to load water sources"); return; }
    setSources(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSources(); }, []);

  const openEdit = (s: WaterSource) => { setEditSource(s); setForm({ ...s }); };
  const saveEdit = async () => {
    if (!form) return;
    const { error } = await supabase.from("water_sources").update({ name: form.name, type: form.type, location: form.location, capacity_liters: form.capacity_liters, current_level_percent: form.current_level_percent, status: form.status, linked_plots: form.linked_plots, last_checked: form.last_checked }).eq("id", form.id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success("Water source updated"); setEditSource(null); setForm(null); fetchSources();
  };
  const handleDeleteFromEdit = () => { setShowDeleteConfirm(true); };
  const confirmDelete = async () => {
    if (!form) return;
    const { error } = await supabase.from("water_sources").delete().eq("id", form.id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Water source deleted"); setShowDeleteConfirm(false); setEditSource(null); setForm(null); fetchSources();
  };
  const handleAdd = async () => {
    const { error } = await supabase.from("water_sources").insert({ name: addForm.name, type: addForm.type, location: addForm.location, capacity_liters: addForm.capacity_liters, current_level_percent: addForm.current_level_percent, status: addForm.status, linked_plots: addForm.linked_plots, last_checked: addForm.last_checked });
    if (error) { toast.error("Failed to add"); return; }
    toast.success("Water source added"); setAddOpen(false);
    setAddForm({ name: "", type: "Borewell", location: "", capacity_liters: 0, current_level_percent: 0, status: "Active", linked_plots: 0, last_checked: new Date().toISOString().split("T")[0] });
    fetchSources();
  };

  const filtered = sources.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase())
  );

  const totalSources = sources.length;
  const activeSources = sources.filter((s) => s.status === "Active").length;
  const avgLevel = totalSources > 0 ? Math.round(sources.reduce((a, s) => a + s.current_level_percent, 0) / totalSources) : 0;
  const totalLinkedPlots = sources.reduce((a, s) => a + s.linked_plots, 0);

  const sourceFormFields = (f: any, setF: (v: any) => void) => (
    <div className="space-y-4">
      <div><Label>{t("name")}</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div><Label>{t("type")}</Label><Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Borewell", "Canal", "River", "Pond", "Rainwater", "Tank"].map((tp) => <SelectItem key={tp} value={tp}>{tp}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>{t("location")}</Label><Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></div>
      <div><Label>{t("capacity")}</Label><Input type="number" value={f.capacity_liters} onChange={(e) => setF({ ...f, capacity_liters: Number(e.target.value) })} /></div>
      <div><Label>{t("currentLevel")}</Label><Input type="number" value={f.current_level_percent} onChange={(e) => setF({ ...f, current_level_percent: Number(e.target.value) })} /></div>
      <div><Label>{t("status")}</Label><Select value={f.status} onValueChange={(v) => setF({ ...f, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Active", "Low", "Dry", "Maintenance"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>{t("linkedPlotsCount")}</Label><Input type="number" value={f.linked_plots} onChange={(e) => setF({ ...f, linked_plots: Number(e.target.value) })} /></div>
      <div><Label>{t("lastChecked")}</Label><Input type="date" value={f.last_checked} onChange={(e) => setF({ ...f, last_checked: e.target.value })} /></div>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("waterSources")}</h1>
          <p className="text-muted-foreground mt-1">{t("monitorWaterSources")}</p>
        </div>
        <Button className="gap-2" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> {t("addWaterSource")}</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5 pb-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Droplets className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{totalSources}</p><p className="text-xs text-muted-foreground">{t("totalSourcesLabel")}</p></div></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><Activity className="w-5 h-5 text-success" /></div><div><p className="text-2xl font-bold text-foreground">{activeSources}</p><p className="text-xs text-muted-foreground">{t("activeLabel")}</p></div></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><Waves className="w-5 h-5 text-warning" /></div><div><p className="text-2xl font-bold text-foreground">{avgLevel}%</p><p className="text-xs text-muted-foreground">{t("avgLevel")}</p></div></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{totalLinkedPlots}</p><p className="text-xs text-muted-foreground">{t("linkedPlots")}</p></div></CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={t("searchWaterSources")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((source) => (
          <Card key={source.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2"><Droplets className="w-5 h-5 text-primary" /><CardTitle className="text-base">{source.name}</CardTitle></div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(source)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Badge variant="outline" className={statusColor[source.status] || ""}>{source.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{source.location}</span>
                <Badge variant="secondary" className="text-xs">{source.type}</Badge>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">{t("waterLevel")}</span><span className="font-medium text-foreground">{source.current_level_percent}%</span></div>
                <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden"><div className={`h-full rounded-full transition-all ${levelColor(source.current_level_percent)}`} style={{ width: `${source.current_level_percent}%` }} /></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pt-1"><span>{t("capacity")}: {(source.capacity_liters / 1000).toFixed(0)}k L</span><span>{source.linked_plots} {t("plotsLinked")}</span></div>
              <p className="text-xs text-muted-foreground">{t("lastChecked")}: {source.last_checked}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">{t("noWaterSources")}</div>}

      <Dialog open={!!editSource} onOpenChange={(open) => { if (!open) { setEditSource(null); setForm(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("editWaterSource")}</DialogTitle></DialogHeader>
          {form && sourceFormFields(form, setForm)}
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="destructive" onClick={handleDeleteFromEdit}>{t("delete")}</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setEditSource(null); setForm(null); }}>{t("cancel")}</Button>
              <Button onClick={saveEdit}>{t("save")}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("addWaterSource")}</DialogTitle></DialogHeader>
          {sourceFormFields(addForm, setAddForm)}
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>{t("cancel")}</Button><Button onClick={handleAdd}>{t("save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t("deleteWaterSource")}</AlertDialogTitle><AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{t("cancel")}</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("delete")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WaterSources;
