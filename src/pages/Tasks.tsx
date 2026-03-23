import { CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tasksData = [
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

const TaskCard = ({ task }: { task: typeof tasksData[0] }) => (
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
        <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{task.due}</span>
      </div>
    </CardContent>
  </Card>
);

const Tasks = () => {
  const pending = tasksData.filter((t) => t.status === "pending");
  const inProgress = tasksData.filter((t) => t.status === "in-progress");
  const completed = tasksData.filter((t) => t.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">{tasksData.length} total tasks</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> New Task</Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({tasksData.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-3 mt-4">
          {tasksData.map((t) => <TaskCard key={t.id} task={t} />)}
        </TabsContent>
        <TabsContent value="pending" className="space-y-3 mt-4">
          {pending.map((t) => <TaskCard key={t.id} task={t} />)}
        </TabsContent>
        <TabsContent value="in-progress" className="space-y-3 mt-4">
          {inProgress.map((t) => <TaskCard key={t.id} task={t} />)}
        </TabsContent>
        <TabsContent value="completed" className="space-y-3 mt-4">
          {completed.map((t) => <TaskCard key={t.id} task={t} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
