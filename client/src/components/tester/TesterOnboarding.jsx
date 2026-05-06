import React, { useState, useEffect } from "react";
import { getTesterOnboarding, dismissTesterOnboarding } from "@/services/api";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Circle, 
  X, 
  Package, 
  Bug, 
  Lightbulb, 
  ListTodo,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TesterOnboarding() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnboarding();
  }, []);

  const fetchOnboarding = async () => {
    try {
      const { data } = await getTesterOnboarding();
      setData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await dismissTesterOnboarding();
      setData(prev => ({ ...prev, dismissed: true }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !data || data.dismissed) return null;

  const steps = [
    { key: "installed_app", label: "Enroll in your first App", icon: Package, desc: "Browse the store and join a beta program." },
    { key: "reported_bug", label: "Report a Bug", icon: Bug, desc: "Find an issue and let the developers know." },
    { key: "submitted_idea", label: "Share an Idea", icon: Lightbulb, desc: "Suggest a feature or improvement." },
    { key: "completed_task", label: "Complete a Task", icon: ListTodo, desc: "Follow a specific test case from admins." },
  ];

  const completedCount = steps.filter(s => data[s.key]).length;
  const progress = (completedCount / steps.length) * 100;

  if (progress === 100) return null; // Hide if fully complete

  return (
    <Card className="border-none shadow-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-2">
        <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Welcome, Tester!</CardTitle>
            <CardDescription className="text-white/70">Get started with your mission. {completedCount}/{steps.length} tasks complete.</CardDescription>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-white/20" />
      </CardHeader>

      <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
        {steps.map((step) => {
          const isDone = data[step.key];
          return (
            <div 
              key={step.key}
              className={cn(
                "p-4 rounded-2xl transition-all flex flex-col gap-3",
                isDone ? "bg-white/10 opacity-60" : "bg-white/20 hover:bg-white/30"
              )}
            >
              <div className="flex items-center justify-between">
                <step.icon className={cn("h-5 w-5", isDone ? "text-white/50" : "text-white")} />
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <Circle className="h-5 w-5 text-white/30" />
                )}
              </div>
              <div>
                <p className={cn("text-sm font-bold", isDone && "line-through text-white/50")}>{step.label}</p>
                <p className="text-[10px] text-white/70 leading-tight mt-1">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
