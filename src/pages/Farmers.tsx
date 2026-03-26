import { Search, Plus, Phone, MapPin, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Farmer {
  id: string; name: string; phone: string; location: string; crops: string[]; plots: number; status: string;
}

const Farmers = () => {
  const { t } = useI18n();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editFarmer, setEditFarmer] = useState<Farmer | null>(null);
  const [form, setForm] = useState<Farmer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<Omit<Farmer, "id">>({ name: "", phone: "", location: "", crops: [], plots: 0, status: "active" });

  const fetchFarmers = async () => {
    const { data, error } = await supabase.from("farmers").select("*").order("created_at");
    if (error) { toast.error("Failed to load farmers"); return; }
    setFarmers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchFarmers(); }, []);

  const filtered = farmers.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const openEdit = (farmer: Farmer) => { setEditFarmer(farmer); setForm({ ...farmer }); };
  const saveEdit = async () => {
    if (!form) return;
    const { error } = await supabase.from("farmers").update({ name: form.name, phone: form.phone, location: form.location, crops: form.crops, plots: form.plots, status: form.status }).eq("id", form.id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success("Farmer updated");
    setEditFarmer(null); setForm(null); fetchFarmers();
  };
  const handleDeleteFromEdit = () => { setShowDeleteConfirm(true); };
  const confirmDelete = async () => {
    if (!form) return;
    const { error } = await supabase.from("farmers").delete().eq("id", form.id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Farmer deleted");
    setShowDeleteConfirm(false); setEditFarmer(null); setForm(null); fetchFarmers();
  };
  const handleAdd = async () => {
    const { error } = await supabase.from("farmers").insert({ name: addForm.name, phone: addForm.phone, location: addForm.location, crops: addForm.crops, plots: addForm.plots, status: addForm.status });
    if (error) { toast.error("Failed to add"); return; }
    toast.success("Farmer added");
    setAddOpen(false);
    setAddForm({ name: "", phone: "", location: "", crops: [], plots: 0, status: "active" });
    fetchFarmers();
  };

  if (loading) return <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("farmers")}</h1>
          <p className="text-muted-foreground mt-1">{farmers.length} {t("registeredFarmers")}</p>
        </div>
        <Button className="gap-2" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> {t("addFarmer")}</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={t("searchFarmers")} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((farmer) => (
          <Card key={farmer.id} className="border-border hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                    {farmer.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold">{farmer.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3" /> {farmer.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(farmer)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Badge className={farmer.status === "active" ? "bg-primary/15 text-primary border-0" : "bg-muted text-muted-foreground border-0"}>{farmer.status === "active" ? t("active") : t("inactive")}</Badge>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="w-3 h-3" /> {farmer.phone}</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">{farmer.crops.map((crop) => <Badge key={crop} variant="secondary" className="text-xs">{crop}</Badge>)}</div>
                <span className="text-xs text-muted-foreground">{farmer.plots} {t("plotsLabel")}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editFarmer} onOpenChange={(open) => { if (!open) { setEditFarmer(null); setForm(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("editFarmer")}</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-4">
              <div><Label>{t("name")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>{t("phone")}</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>{t("location")}</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>{t("cropsCommaSeparated")}</Label><Input value={form.crops.join(", ")} onChange={(e) => setForm({ ...form, crops: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>
              <div><Label>{t("plotsLabel")}</Label><Input type="number" value={form.plots} onChange={(e) => setForm({ ...form, plots: Number(e.target.value) })} /></div>
              <div><Label>{t("status")}</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">{t("active")}</SelectItem><SelectItem value="inactive">{t("inactive")}</SelectItem></SelectContent></Select></div>
            </div>
          )}
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="destructive" onClick={handleDeleteFromEdit}>{t("delete")}</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setEditFarmer(null); setForm(null); }}>{t("cancel")}</Button>
              <Button onClick={saveEdit}>{t("save")}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("addFarmer")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t("name")}</Label><Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} /></div>
            <div><Label>{t("phone")}</Label><Input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} /></div>
            <div><Label>{t("location")}</Label><Input value={addForm.location} onChange={(e) => setAddForm({ ...addForm, location: e.target.value })} /></div>
            <div><Label>{t("cropsCommaSeparated")}</Label><Input value={addForm.crops.join(", ")} onChange={(e) => setAddForm({ ...addForm, crops: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>
            <div><Label>{t("plotsLabel")}</Label><Input type="number" value={addForm.plots} onChange={(e) => setAddForm({ ...addForm, plots: Number(e.target.value) })} /></div>
            <div><Label>{t("status")}</Label><Select value={addForm.status} onValueChange={(v) => setAddForm({ ...addForm, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">{t("active")}</SelectItem><SelectItem value="inactive">{t("inactive")}</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>{t("cancel")}</Button><Button onClick={handleAdd}>{t("save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t("deleteFarmer")}</AlertDialogTitle><AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{t("cancel")}</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("delete")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Farmers;
