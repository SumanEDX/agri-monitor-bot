import { CheckCircle2, Clock, AlertCircle, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Task {
  id: number; title: string; assignee: string; due: string; priority: string; status: string;
}

const initialTasks: Task[] = [
  { id: 1, title: "Apply fertilizer to Plot A", assignee: "Rajesh Kumar", due: "Today", priority: "high", status: "pending" },
  { id: 2, title: "Irrigation check for Plot B", assignee: "Suresh Reddy", due: "Today", priority: "medium", status: "in-progress" },
  { id: 3, title: "Pest spray on Plot C", assignee: "Anita Sharma", due: "Tomorrow", priority: "high", status: "pending" },
  { id: 4, title: "Soil sample collection", assignee: "Vikram Singh", due: "Mar 25", priority: "low", status: "pending" },
  { id: 5, title: "Harvest scheduling for Plot D", assignee: "Rajesh Kumar", due: "Mar 26", priority: "medium", status: "completed" },
  { id: 6, title: "Equipment maintenance", assignee: "Suresh Reddy", due: "Mar 24", priority: "low", status: "completed" },
  { id: 7, title: "Seed procurement for next season", assignee: "Priya Patel", due: "Mar 28", priority: "medium", status: "pending" },
];

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
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState<Task | null>(null);

  const openEdit = (task: Task) => { setEditTask(task); setForm({ ...task }); };
  const saveEdit = () => { if (!form) return; setTasks((prev) => prev.map((t) => (t.id === form.id ? form : t))); setEditTask(null); setForm(null); };

  const pending = tasks.filter((t) => t.status === "pending");
  const inProgress = tasks.filter((t) => t.status === "in-progress");
  const completed = tasks.filter((t) => t.status === "completed");

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="border-border hover:shadow-sm transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {statusIcons[task.status]}
          <div>
            <p className="font-medium text-sm">{task.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Assigned to {task.assignee}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(task)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{task.due}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">{tasks.length} total tasks</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> New Task</Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-3 mt-4">{tasks.map((t) => <TaskCard key={t.id} task={t} />)}</TabsContent>
        <TabsContent value="pending" className="space-y-3 mt-4">{pending.map((t) => <TaskCard key={t.id} task={t} />)}</TabsContent>
        <TabsContent value="in-progress" className="space-y-3 mt-4">{inProgress.map((t) => <TaskCard key={t.id} task={t} />)}</TabsContent>
        <TabsContent value="completed" className="space-y-3 mt-4">{completed.map((t) => <TaskCard key={t.id} task={t} />)}</TabsContent>
      </Tabs>

      <Dialog open={!!editTask} onOpenChange={(open) => { if (!open) { setEditTask(null); setForm(null); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Assignee</Label><Input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} /></div>
              <div><Label>Due</Label><Input value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} /></div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditTask(null); setForm(null); }}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
