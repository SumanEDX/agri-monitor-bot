import { useState } from "react";
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

interface WaterSource {
  id: string; name: string; type: "Borewell" | "Canal" | "River" | "Pond" | "Rainwater" | "Tank";
  location: string; capacityLiters: number; currentLevelPercent: number;
  status: "Active" | "Low" | "Dry" | "Maintenance"; linkedPlots: number; lastChecked: string;
}

const initialSources: WaterSource[] = [
  { id: "1", name: "Main Borewell #1", type: "Borewell", location: "North Field", capacityLiters: 50000, currentLevelPercent: 78, status: "Active", linkedPlots: 5, lastChecked: "2026-03-22" },
  { id: "2", name: "Irrigation Canal A", type: "Canal", location: "East Block", capacityLiters: 200000, currentLevelPercent: 62, status: "Active", linkedPlots: 12, lastChecked: "2026-03-21" },
  { id: "3", name: "Farm Pond", type: "Pond", location: "Central Area", capacityLiters: 80000, currentLevelPercent: 35, status: "Low", linkedPlots: 4, lastChecked: "2026-03-23" },
  { id: "4", name: "Rainwater Harvester", type: "Rainwater", location: "South Block", capacityLiters: 15000, currentLevelPercent: 90, status: "Active", linkedPlots: 3, lastChecked: "2026-03-23" },
  { id: "5", name: "River Intake Point", type: "River", location: "West Boundary", capacityLiters: 500000, currentLevelPercent: 55, status: "Active", linkedPlots: 8, lastChecked: "2026-03-20" },
  { id: "6", name: "Storage Tank #2", type: "Tank", location: "South Field", capacityLiters: 30000, currentLevelPercent: 10, status: "Dry", linkedPlots: 2, lastChecked: "2026-03-19" },
  { id: "7", name: "Borewell #3", type: "Borewell", location: "East Field", capacityLiters: 45000, currentLevelPercent: 0, status: "Maintenance", linkedPlots: 0, lastChecked: "2026-03-18" },
  { id: "8", name: "Canal B Extension", type: "Canal", location: "North Block", capacityLiters: 150000, currentLevelPercent: 48, status: "Active", linkedPlots: 6, lastChecked: "2026-03-22" },
];

const statusColor: Record<WaterSource["status"], string> = {
  Active: "bg-success/10 text-success border-success/30",
  Low: "bg-warning/10 text-warning border-warning/30",
  Dry: "bg-destructive/10 text-destructive border-destructive/30",
  Maintenance: "bg-muted text-muted-foreground border-muted",
};

const levelColor = (pct: number) => pct >= 60 ? "bg-success" : pct >= 30 ? "bg-warning" : "bg-destructive";

const WaterSources = () => {
  const { t } = useI18n();
  const [sources, setSources] = useState<WaterSource[]>(initialSources);
  const [search, setSearch] = useState("");
  const [editSource, setEditSource] = useState<WaterSource | null>(null);
  const [form, setForm] = useState<WaterSource | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<Omit<WaterSource, "id">>({ name: "", type: "Borewell", location: "", capacityLiters: 0, currentLevelPercent: 0, status: "Active", linkedPlots: 0, lastChecked: new Date().toISOString().split("T")[0] });

  const openEdit = (s: WaterSource) => { setEditSource(s); setForm({ ...s }); };
  const saveEdit = () => { if (!form) return; setSources((prev) => prev.map((s) => (s.id === form.id ? form : s))); setEditSource(null); setForm(null); };
  const handleDeleteFromEdit = () => { setShowDeleteConfirm(true); };
  const confirmDelete = () => {
    if (form) { setSources((prev) => prev.filter((s) => s.id !== form.id)); setShowDeleteConfirm(false); setEditSource(null); setForm(null); }
  };
  const handleAdd = () => {
    const newId = String(Math.max(0, ...sources.map((s) => Number(s.id))) + 1);
    setSources((prev) => [...prev, { ...addForm, id: newId }]);
    setAddOpen(false);
    setAddForm({ name: "", type: "Borewell", location: "", capacityLiters: 0, currentLevelPercent: 0, status: "Active", linkedPlots: 0, lastChecked: new Date().toISOString().split("T")[0] });
  };

  const filtered = sources.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase())
  );

  const totalSources = sources.length;
  const activeSources = sources.filter((s) => s.status === "Active").length;
  const avgLevel = totalSources > 0 ? Math.round(sources.reduce((a, s) => a + s.currentLevelPercent, 0) / totalSources) : 0;
  const totalLinkedPlots = sources.reduce((a, s) => a + s.linkedPlots, 0);

  const sourceFormFields = (f: any, setF: (v: any) => void) => (
    <div className="space-y-4">
      <div><Label>{t("name")}</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div><Label>{t("type")}</Label><Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(["Borewell", "Canal", "River", "Pond", "Rainwater", "Tank"] as const).map((tp) => <SelectItem key={tp} value={tp}>{tp}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>{t("location")}</Label><Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></div>
      <div><Label>{t("capacity")}</Label><Input type="number" value={f.capacityLiters} onChange={(e) => setF({ ...f, capacityLiters: Number(e.target.value) })} /></div>
      <div><Label>{t("currentLevel")}</Label><Input type="number" value={f.currentLevelPercent} onChange={(e) => setF({ ...f, currentLevelPercent: Number(e.target.value) })} /></div>
      <div><Label>{t("status")}</Label><Select value={f.status} onValueChange={(v) => setF({ ...f, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(["Active", "Low", "Dry", "Maintenance"] as const).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>{t("linkedPlotsCount")}</Label><Input type="number" value={f.linkedPlots} onChange={(e) => setF({ ...f, linkedPlots: Number(e.target.value) })} /></div>
      <div><Label>{t("lastChecked")}</Label><Input type="date" value={f.lastChecked} onChange={(e) => setF({ ...f, lastChecked: e.target.value })} /></div>
    </div>
  );

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
                  <Badge variant="outline" className={statusColor[source.status]}>{source.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{source.location}</span>
                <Badge variant="secondary" className="text-xs">{source.type}</Badge>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">{t("waterLevel")}</span><span className="font-medium text-foreground">{source.currentLevelPercent}%</span></div>
                <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden"><div className={`h-full rounded-full transition-all ${levelColor(source.currentLevelPercent)}`} style={{ width: `${source.currentLevelPercent}%` }} /></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pt-1"><span>{t("capacity")}: {(source.capacityLiters / 1000).toFixed(0)}k L</span><span>{source.linkedPlots} {t("plotsLinked")}</span></div>
              <p className="text-xs text-muted-foreground">{t("lastChecked")}: {source.lastChecked}</p>
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
