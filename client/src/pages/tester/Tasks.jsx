import React, { useState, useEffect } from "react";
import { 
  getTesterTasks, 
  completeTesterTask, 
  uncompleteTesterTask 
} from "@/services/api";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  AlertCircle,
  Calendar
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedApps, setExpandedApps] = useState(new Set());
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await getTesterTasks();
      setTasks(data || []);
      // Expand first app by default
      if (data.length > 0) {
        setExpandedApps(new Set([data[0].app_id]));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task, isChecking) => {
    try {
      if (isChecking) {
        // Handled by the popover confirm
        return;
      } else {
        await uncompleteTesterTask(task.id);
        toast({ title: "Task restored", description: "The task has been moved back to active." });
        fetchTasks();
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update task." });
    }
  };

  const confirmComplete = async (taskId) => {
    try {
      const { data } = await completeTesterTask(taskId, notes);
      toast({ title: "Task completed!", description: "Great job! Keep testing." });
      setNotes("");
      fetchTasks();
      
      if (data.achievements?.length > 0) {
        // Achievement toast logic can be added here or handled globally
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to complete task." });
    }
  };

  const toggleApp = (appId) => {
    const next = new Set(expandedApps);
    if (next.has(appId)) next.delete(appId);
    else next.add(appId);
    setExpandedApps(next);
  };

  if (loading) return <TasksSkeleton />;

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.app_id]) {
      acc[task.app_id] = {
        app: task.app,
        active: [],
        done: []
      };
    }
    if (task.isCompleted) acc[task.app_id].done.push(task);
    else acc[task.app_id].active.push(task);
    return acc;
  }, {});

  if (tasks.length === 0) return <EmptyTasks />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Test Tasks</h1>
        <p className="text-muted-foreground">Complete assigned tasks to help improve the apps and earn XP.</p>
      </div>

      <div className="grid gap-6">
        {Object.values(groupedTasks).map(({ app, active, done }) => {
          const total = active.length + done.length;
          const progress = (done.length / total) * 100;
          const isExpanded = expandedApps.has(app.id);

          return (
            <Card key={app.id} className="border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden">
              <div 
                onClick={() => toggleApp(app.id)}
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center p-2">
                    <img src={app.icon} alt={app.name} className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{app.name}</h2>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-2 w-32 md:w-48">
                        <Progress value={progress} className="h-1.5" />
                        <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{done.length} / {total}</span>
                      </div>
                      <Badge variant={progress === 100 ? "default" : "secondary"} className="text-[10px] h-5">
                        {progress === 100 ? "Completed" : `${active.length} Pending`}
                      </Badge>
                    </div>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="h-5 w-5 opacity-30" /> : <ChevronDown className="h-5 w-5 opacity-30" />}
              </div>

              {isExpanded && (
                <CardContent className="p-0 border-t border-dashed">
                  <div className="divide-y divide-dashed">
                    {/* Active Tasks */}
                    {active.map(task => (
                      <TaskRow 
                        key={task.id} 
                        task={task} 
                        onToggle={handleToggleComplete}
                        confirmComplete={confirmComplete}
                        notes={notes}
                        setNotes={setNotes}
                      />
                    ))}

                    {/* Done Section */}
                    {done.length > 0 && (
                      <div className="bg-muted/10">
                        <div className="px-6 py-2 bg-muted/20 text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> Done
                        </div>
                        {done.map(task => (
                          <TaskRow 
                            key={task.id} 
                            task={task} 
                            onToggle={handleToggleComplete}
                            isDone 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, isDone, confirmComplete, notes, setNotes }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isDone;

  return (
    <div className={cn(
      "p-6 flex items-start gap-4 transition-all group",
      isDone ? "opacity-60 grayscale-[0.5]" : "hover:bg-muted/20"
    )}>
      {isDone ? (
        <div 
          onClick={() => onToggle(task, false)}
          className="mt-1 h-5 w-5 rounded-md bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-sm"
        >
          <CheckCircle2 className="h-3 w-3" />
        </div>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <div className="mt-1">
              <Checkbox id={`task-${task.id}`} checked={false} className="h-5 w-5 rounded-md" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-bold text-sm">Complete Task</h4>
                <p className="text-xs text-muted-foreground">Add optional notes about your testing experience.</p>
              </div>
              <Textarea 
                placeholder="e.g. Everything worked fine, but UI felt laggy on my device..." 
                className="min-h-[100px] text-xs resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button size="sm" className="w-full" onClick={() => confirmComplete(task.id)}>
                Submit & Complete
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn(
            "text-sm font-bold leading-none",
            isDone && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>
          {isOverdue && (
            <Badge variant="destructive" className="text-[9px] h-4 px-1 gap-1">
              <AlertCircle className="h-2 w-2" /> OVERDUE
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
          {task.description}
        </p>
        
        <div className="flex items-center gap-4 pt-1">
          {task.due_date && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight",
              isOverdue ? "text-red-500" : "text-muted-foreground"
            )}>
              <Calendar className="h-3 w-3" />
              Due {format(new Date(task.due_date), "MMM d, yyyy")}
            </div>
          )}
          {task.isCompleted && task.userCompletion?.notes && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-tight">
              <MessageSquare className="h-3 w-3" />
              Feedback Provided
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TasksSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      {[1, 2].map(i => (
        <Card key={i} className="border-none bg-card/50">
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

function EmptyTasks() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
      <div className="p-6 rounded-full bg-primary/5 mb-6">
        <ListTodo className="h-12 w-12 text-primary opacity-20" />
      </div>
      <h2 className="text-2xl font-bold">No tasks assigned yet</h2>
      <p className="text-muted-foreground max-w-sm mt-2">
        Admins will assign specific features for you to test. Check back soon!
      </p>
      <Button asChild className="mt-8 rounded-full px-8">
        <a href="/tester/apps">Browse Apps</a>
      </Button>
    </div>
  );
}
