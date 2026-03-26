import { CheckCircle2, Clock, AlertCircle, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Task { id: string; title: string; assignee: string; due: string; priority: string; status: string; }

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-0",
  medium: "bg-warning/15 text-warning border-0",
  low: "bg-muted text-muted-foreground border-0",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 text-warning" />,
  "in-progress": <AlertCircle className="w-4 h-4 text-info" />,
  completed: <CheckCircle2 className="w-4 h-4 text-primary" />,
};

const Tasks = () => {
  const { t } = useI18n();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<Omit<Task, "id">>({ title: "", assignee: "", due: "", priority: "medium", status: "pending" });

  const fetchTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*").order("created_at");
    if (error) { toast.error("Failed to load tasks"); return; }
    setTasks(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const openEdit = (task: Task) => { setEditTask(task); setForm({ ...task }); };
  const saveEdit = async () => {
    if (!form) return;
    const { error } = await supabase.from("tasks").update({ title: form.title, assignee: form.assignee, due: form.due, priority: form.priority, status: form.status }).eq("id", form.id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success("Task updated"); setEditTask(null); setForm(null); fetchTasks();
  };
  const handleDeleteFromEdit = () => { setShowDeleteConfirm(true); };
  const confirmDelete = async () => {
    if (!form) return;
    const { error } = await supabase.from("tasks").delete().eq("id", form.id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Task deleted"); setShowDeleteConfirm(false); setEditTask(null); setForm(null); fetchTasks();
  };
  const handleAdd = async () => {
    const { error } = await supabase.from("tasks").insert({ title: addForm.title, assignee: addForm.assignee, due: addForm.due, priority: addForm.priority, status: addForm.status });
    if (error) { toast.error("Failed to add"); return; }
    toast.success("Task added"); setAddOpen(false);
    setAddForm({ title: "", assignee: "", due: "", priority: "medium", status: "pending" });
    fetchTasks();
  };

  const pending = tasks.filter((tk) => tk.status === "pending");
  const inProgress = tasks.filter((tk) => tk.status === "in-progress");
  const completed = tasks.filter((tk) => tk.status === "completed");

  const taskFormFields = (f: any, setF: (v: any) => void) => (
    <div className="space-y-4">
      <div><Label>{t("title")}</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
      <div><Label>{t("assignee")}</Label><Input value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })} /></div>
      <div><Label>{t("due")}</Label><Input value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></div>
      <div><Label>{t("priority")}</Label><Select value={f.priority} onValueChange={(v) => setF({ ...f, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="high">{t("high")}</SelectItem><SelectItem value="medium">{t("medium")}</SelectItem><SelectItem value="low">{t("low")}</SelectItem></SelectContent></Select></div>
      <div><Label>{t("status")}</Label><Select value={f.status} onValueChange={(v) => setF({ ...f, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">{t("pending")}</SelectItem><SelectItem value="in-progress">{t("inProgress")}</SelectItem><SelectItem value="completed">{t("completed")}</SelectItem></SelectContent></Select></div>
    </div>
  );

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="border-border hover:shadow-sm transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {statusIcons[task.status]}
          <div>
            <p className="font-medium text-sm">{task.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("assignedTo")} {task.assignee}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(task)}><Pencil className="w-3.5 h-3.5" /></Button>
          <Badge className={priorityStyles[task.priority]}>{t(task.priority)}</Badge>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{task.due}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) return <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("tasks")}</h1>
          <p className="text-muted-foreground mt-1">{tasks.length} {t("totalTasks")}</p>
        </div>
        <Button className="gap-2" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> {t("newTask")}</Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">{t("all")} ({tasks.length})</TabsTrigger>
          <TabsTrigger value="pending">{t("pending")} ({pending.length})</TabsTrigger>
          <TabsTrigger value="in-progress">{t("inProgress")} ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="completed">{t("completed")} ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-3 mt-4">{tasks.map((tk) => <TaskCard key={tk.id} task={tk} />)}</TabsContent>
        <TabsContent value="pending" className="space-y-3 mt-4">{pending.map((tk) => <TaskCard key={tk.id} task={tk} />)}</TabsContent>
        <TabsContent value="in-progress" className="space-y-3 mt-4">{inProgress.map((tk) => <TaskCard key={tk.id} task={tk} />)}</TabsContent>
        <TabsContent value="completed" className="space-y-3 mt-4">{completed.map((tk) => <TaskCard key={tk.id} task={tk} />)}</TabsContent>
      </Tabs>

      <Dialog open={!!editTask} onOpenChange={(open) => { if (!open) { setEditTask(null); setForm(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("editTask")}</DialogTitle></DialogHeader>
          {form && taskFormFields(form, setForm)}
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="destructive" onClick={handleDeleteFromEdit}>{t("delete")}</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setEditTask(null); setForm(null); }}>{t("cancel")}</Button>
              <Button onClick={saveEdit}>{t("save")}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("newTask")}</DialogTitle></DialogHeader>
          {taskFormFields(addForm, setAddForm)}
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>{t("cancel")}</Button><Button onClick={handleAdd}>{t("save")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t("deleteTask")}</AlertDialogTitle><AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{t("cancel")}</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("delete")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Tasks;
