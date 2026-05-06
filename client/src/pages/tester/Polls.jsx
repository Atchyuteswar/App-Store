import React, { useState, useEffect } from "react";
import { getTesterPolls, respondToPoll, getPollResults } from "@/services/api";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart2, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Globe,
  MessageSquare,
  HelpCircle,
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function Polls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const { data } = await getTesterPolls();
      setPolls(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (pollId, response) => {
    try {
      await respondToPoll(pollId, response);
      toast({ title: "Response submitted!", description: "Thank you for your feedback." });
      fetchPolls();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit response." });
    }
  };

  if (loading) return <PollsSkeleton />;

  const pendingPolls = polls.filter(p => !p.hasResponded);
  const answeredPolls = polls.filter(p => p.hasResponded);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Polls & Surveys</h1>
        <p className="text-muted-foreground">Share your opinion on new features and platform updates.</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50 p-1">
          <TabsTrigger value="pending" className="rounded-md transition-all gap-2">
            Pending {pendingPolls.length > 0 && <Badge className="h-4 w-4 p-0 flex items-center justify-center text-[9px]">{pendingPolls.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="answered" className="rounded-md transition-all">Answered</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-8">
          {pendingPolls.length === 0 ? (
            <EmptyState title="No pending polls" description="You've answered all active surveys. Check back later!" />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {pendingPolls.map(poll => (
                <PollCard key={poll.id} poll={poll} onRespond={handleRespond} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="answered" className="mt-8">
          {answeredPolls.length === 0 ? (
            <EmptyState title="No answered polls" description="Once you respond to a poll, it will appear here." />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {answeredPolls.map(poll => (
                <PollCard key={poll.id} poll={poll} isResult />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PollCard({ poll, onRespond, isResult }) {
  const [value, setValue] = useState(poll.type === 'multi' ? [] : "");
  const [results, setResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    if (isResult) {
      fetchResults();
    }
  }, [isResult]);

  const fetchResults = async () => {
    setLoadingResults(true);
    try {
      const { data } = await getPollResults(poll.id);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleSubmit = () => {
    if (poll.type === 'text') onRespond(poll.id, { textResponse: value });
    else onRespond(poll.id, { selectedOptions: Array.isArray(value) ? value : [value] });
  };

  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();

  return (
    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md overflow-hidden flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-primary">
            {poll.app_id ? <Package className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {poll.app?.name || "Platform-wide"}
            </span>
          </div>
          {poll.expires_at && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight",
              isExpired ? "text-red-500" : "text-muted-foreground"
            )}>
              <Timer className="h-3 w-3" />
              {isExpired ? "Expired" : `Ends ${formatDistanceToNow(new Date(poll.expires_at), { addSuffix: true })}`}
            </div>
          )}
        </div>
        <CardTitle className="text-lg leading-tight">{poll.question}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-6">
        <div className="space-y-4">
          {!isResult ? (
            <>
              {poll.type === 'single' && (
                <RadioGroup value={value} onValueChange={setValue} className="gap-3">
                  {poll.options.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2 p-3 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all">
                      <RadioGroupItem value={opt} id={`poll-${poll.id}-opt-${i}`} />
                      <Label htmlFor={`poll-${poll.id}-opt-${i}`} className="text-sm font-medium cursor-pointer flex-1">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {poll.type === 'multi' && (
                <div className="grid gap-3">
                  {poll.options.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2 p-3 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all">
                      <Checkbox 
                        id={`poll-${poll.id}-opt-${i}`} 
                        checked={value.includes(opt)}
                        onCheckedChange={(checked) => {
                          if (checked) setValue([...value, opt]);
                          else setValue(value.filter(v => v !== opt));
                        }}
                      />
                      <Label htmlFor={`poll-${poll.id}-opt-${i}`} className="text-sm font-medium cursor-pointer flex-1">{opt}</Label>
                    </div>
                  ))}
                </div>
              )}
              {poll.type === 'text' && (
                <Input 
                  placeholder="Type your response here..." 
                  className="bg-muted/30 h-12"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              )}
              <Button 
                className="w-full mt-4" 
                disabled={!value || (Array.isArray(value) && value.length === 0)}
                onClick={handleSubmit}
              >
                Submit Response
              </Button>
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {loadingResults ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full rounded-md" />)}
                </div>
              ) : poll.type === 'text' ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Anonymised text responses</p>
                  {(results || []).slice(0, 5).map((r, i) => (
                    <div key={i} className="p-3 rounded-xl bg-muted/30 text-xs text-muted-foreground italic border-l-2 border-primary/20">
                      "{r.text_response}"
                    </div>
                  ))}
                  {results?.length > 5 && <p className="text-[10px] text-center text-muted-foreground">+ {results.length - 5} more</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  {poll.options.map((opt, i) => {
                    const count = (results || []).filter(r => r.selected_options?.includes(opt)).length;
                    const total = results?.length || 1;
                    const percent = (count / total) * 100;
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span>{opt}</span>
                          <span className="font-bold">{Math.round(percent)}%</span>
                        </div>
                        <Progress value={percent} className="h-2" />
                      </div>
                    );
                  })}
                  <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-tighter mt-4">
                    {results?.length || 0} total responses collected
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PollsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-64" />
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <Card key={i} className="border-none bg-card/50">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map(j => <Skeleton key={j} className="h-12 w-full rounded-xl" />)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
      <div className="p-6 rounded-full bg-primary/5 mb-6">
        <HelpCircle className="h-12 w-12 text-primary opacity-20" />
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground max-w-sm mt-2">{description}</p>
    </div>
  );
}
