import { Search, Plus, Phone, MapPin, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Farmer {
  id: number;
  name: string;
  phone: string;
  location: string;
  crops: string[];
  plots: number;
  status: string;
}

const initialFarmers: Farmer[] = [
  { id: 1, name: "Rajesh Kumar", phone: "+91 98765 43210", location: "Nashik, Maharashtra", crops: ["Wheat", "Rice"], plots: 3, status: "active" },
  { id: 2, name: "Anita Sharma", phone: "+91 98765 43211", location: "Indore, MP", crops: ["Cotton", "Soybean"], plots: 5, status: "active" },
  { id: 3, name: "Vikram Singh", phone: "+91 98765 43212", location: "Jaipur, Rajasthan", crops: ["Corn"], plots: 2, status: "inactive" },
  { id: 4, name: "Priya Patel", phone: "+91 98765 43213", location: "Ahmedabad, Gujarat", crops: ["Groundnut", "Cotton"], plots: 4, status: "active" },
  { id: 5, name: "Suresh Reddy", phone: "+91 98765 43214", location: "Hyderabad, Telangana", crops: ["Rice", "Sugarcane"], plots: 6, status: "active" },
  { id: 6, name: "Meena Devi", phone: "+91 98765 43215", location: "Patna, Bihar", crops: ["Wheat"], plots: 1, status: "inactive" },
];

const Farmers = () => {
  const [farmers, setFarmers] = useState<Farmer[]>(initialFarmers);
  const [search, setSearch] = useState("");
  const [editFarmer, setEditFarmer] = useState<Farmer | null>(null);
  const [form, setForm] = useState<Farmer | null>(null);

  const filtered = farmers.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const openEdit = (farmer: Farmer) => {
    setEditFarmer(farmer);
    setForm({ ...farmer });
  };

  const saveEdit = () => {
    if (!form) return;
    setFarmers((prev) => prev.map((f) => (f.id === form.id ? form : f)));
    setEditFarmer(null);
    setForm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Farmers</h1>
          <p className="text-muted-foreground mt-1">{farmers.length} registered farmers</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Farmer
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search farmers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(farmer)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Badge className={farmer.status === "active" ? "bg-primary/15 text-primary border-0" : "bg-muted text-muted-foreground border-0"}>
                    {farmer.status}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="w-3 h-3" /> {farmer.phone}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                  {farmer.crops.map((crop) => (
                    <Badge key={crop} variant="secondary" className="text-xs">{crop}</Badge>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{farmer.plots} plots</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editFarmer} onOpenChange={(open) => { if (!open) { setEditFarmer(null); setForm(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Farmer</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>Crops (comma-separated)</Label><Input value={form.crops.join(", ")} onChange={(e) => setForm({ ...form, crops: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>
              <div><Label>Plots</Label><Input type="number" value={form.plots} onChange={(e) => setForm({ ...form, plots: Number(e.target.value) })} /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditFarmer(null); setForm(null); }}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Farmers;
