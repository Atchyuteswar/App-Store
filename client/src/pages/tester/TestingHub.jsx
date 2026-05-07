import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  getAppBySlug, 
  getTesterMessages, 
  addTesterMessage,
  getTesterBugs,
  addTesterBug,
  getTesterIdeas,
  addTesterIdea,
  getFileUrl
} from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Send, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Download, 
  Info, 
  ExternalLink, 
  History, 
  User as UserIcon,
  PlusCircle,
  AlertCircle,
  Zap,
  Activity,
  Terminal,
  Cpu,
  ShieldCheck,
  Layout
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function TestingHub() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const [bugs, setBugs] = useState([]);
  const [bugForm, setBugForm] = useState({ title: "", description: "" });
  const [submittingBug, setSubmittingBug] = useState(false);

  const [ideas, setIdeas] = useState([]);
  const [ideaForm, setIdeaForm] = useState({ title: "", description: "" });
  const [submittingIdea, setSubmittingIdea] = useState(false);
  const [bugDialogOpen, setBugDialogOpen] = useState(false);
  const [ideaDialogOpen, setIdeaDialogOpen] = useState(false);

  useEffect(() => {
    fetchAppData();
  }, [slug]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchAppData = async () => {
    setLoading(true);
    try {
      const appRes = await getAppBySlug(slug);
      setApp(appRes.data);
      
      const [msgRes, bugRes, ideaRes] = await Promise.all([
        getTesterMessages(slug),
        getTesterBugs(slug),
        getTesterIdeas(slug)
      ]);

      setMessages(msgRes.data || []);
      setBugs(bugRes.data || []);
      setIdeas(ideaRes.data || []);
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "Failed to load testing hub data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!slug || loading) return;

    const pollInterval = setInterval(async () => {
      try {
        const msgRes = await getTesterMessages(slug);
        if (msgRes.data && msgRes.data.length !== messages.length) {
          setMessages(msgRes.data);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [slug, messages.length, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const { data } = await addTesterMessage(slug, newMessage);
      setMessages([...messages, data]);
      setNewMessage("");
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send message" });
    }
  };

  const handleSubmitBug = async (e) => {
    e.preventDefault();
    if (!bugForm.title.trim() || !bugForm.description.trim()) return;
    setSubmittingBug(true);
    try {
      const { data } = await addTesterBug(slug, bugForm);
      setBugs([data, ...bugs]);
      setBugForm({ title: "", description: "" });
      setBugDialogOpen(false);
      toast({ title: "Anomaly Reported", description: "Thank you for finding this issue!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to report bug" });
    } finally {
      setSubmittingBug(false);
    }
  };

  const handleSubmitIdea = async (e) => {
    e.preventDefault();
    if (!ideaForm.title.trim() || !ideaForm.description.trim()) return;
    setSubmittingIdea(true);
    try {
      const { data } = await addTesterIdea(slug, ideaForm);
      setIdeas([data, ...ideas]);
      setIdeaForm({ title: "", description: "" });
      setIdeaDialogOpen(false);
      toast({ title: "Innovation Submitted", description: "Your feature suggestion has been recorded!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit idea" });
    } finally {
      setSubmittingIdea(false);
    }
  };

  if (loading || !app) {
    return (
      <div className="space-y-12 max-w-7xl mx-auto py-20 px-6 animate-pulse">
        <Skeleton className="h-40 w-full rounded-[3rem] bg-white/5" />
        <div className="grid lg:grid-cols-12 gap-12">
          <Skeleton className="lg:col-span-8 h-[600px] rounded-[3rem] bg-white/5" />
          <Skeleton className="lg:col-span-4 h-[600px] rounded-[3rem] bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 max-w-7xl mx-auto px-6 py-12 selection:bg-primary/30">
      {/* Premium Experiment Header */}
      <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
          <div className="h-32 w-32 rounded-[2.5rem] bg-white/5 border border-white/10 p-2 shadow-2xl overflow-hidden shrink-0 group-hover:border-primary/50 transition-all duration-700">
            {app.icon ? (
              <img src={getFileUrl(app.icon)} alt={app.name} className="h-full w-full object-cover rounded-[2rem]" />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-black text-4xl text-primary bg-primary/5 rounded-[2rem]">{app.name[0]}</div>
            )}
          </div>
          
          <div className="flex-1 text-center lg:text-left space-y-4">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-premium uppercase leading-tight">{app.name}</h1>
              <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px] px-4 h-7">v{app.version}</Badge>
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-black uppercase tracking-widest text-[10px] px-4 h-7 flex items-center gap-2">
                <Zap className="h-3 w-3" /> EXPERIMENT PHASE
              </Badge>
            </div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] max-w-2xl leading-relaxed">{app.tagline}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            {app.apk_file && (
              <Button asChild className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-[0_0_30px_-10px_rgba(34,197,94,0.5)] transition-all hover:scale-105 active:scale-95 text-xs">
                <a href={getFileUrl(app.apk_file)} download>
                  <Download className="h-5 w-5 mr-3" /> Initialize Build
                </a>
              </Button>
            )}
            <Button variant="ghost" className="h-16 px-10 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all" asChild>
              <Link to={`/app/${app.slug}`}>
                <ExternalLink className="h-5 w-5 mr-3" /> Store Page
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 pb-12">
        {/* Main Interaction Area */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col space-y-8">
            <TabsList className="bg-white/5 border border-white/10 p-2 h-18 rounded-[2rem] w-full justify-start gap-2 overflow-x-auto custom-scrollbar shadow-xl backdrop-blur-md">
              <TabsTrigger value="chat" className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-3">
                <MessageSquare className="h-4 w-4" /> Community
              </TabsTrigger>
              <TabsTrigger value="issues" className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all gap-3">
                <Bug className="h-4 w-4" /> Anomalies
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all gap-3">
                <Lightbulb className="h-4 w-4" /> Innovations
              </TabsTrigger>
              <TabsTrigger value="notes" className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all gap-3">
                <History className="h-4 w-4" /> Protocols
              </TabsTrigger>
            </TabsList>

            {/* COMMUNITY TAB */}
            <TabsContent value="chat" className="m-0 space-y-6 animate-in fade-in duration-700">
              <div className="p-10 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl flex flex-col h-[600px] relative overflow-hidden">
                <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Neural Sync Channel</span>
                  </div>
                  <Badge className="bg-white/5 text-white/20 border-white/10 text-[9px] font-black h-6">{messages.length} ARCHIVED</Badge>
                </div>

                <ScrollArea className="flex-1 pr-6 relative z-10">
                  <div className="space-y-8">
                    {messages.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center text-white/10 gap-6">
                        <MessageSquare className="h-16 w-16 opacity-5" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Silence in the matrix</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.user.username === user.username;
                        return (
                          <div key={msg.id} className={`flex gap-6 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
                              <span className="text-xs font-black text-white/40 uppercase">{msg.user.username[0]}</span>
                            </div>
                            <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'} space-y-2`}>
                              <div className="flex items-center gap-3 px-1">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{isMe ? 'YOU' : msg.user.username}</span>
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                              <div className={cn(
                                "px-6 py-4 rounded-[1.5rem] shadow-xl text-sm leading-relaxed font-medium transition-all",
                                isMe 
                                  ? 'bg-primary text-white rounded-tr-none' 
                                  : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'
                              )}>
                                {msg.message}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
                  <form onSubmit={handleSendMessage} className="flex gap-4">
                    <Input 
                      placeholder="TRANSMIT TO COMMUNITY MATRIX..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="h-16 bg-white/5 border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white placeholder:text-white/10 focus-visible:ring-0 px-8"
                      autoComplete="off"
                    />
                    <Button type="submit" disabled={!newMessage.trim()} className="h-16 w-16 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shrink-0">
                      <Send className="h-6 w-6" />
                    </Button>
                  </form>
                </div>
              </div>
            </TabsContent>

            {/* ISSUES TAB */}
            <TabsContent value="issues" className="m-0 space-y-6 animate-in fade-in duration-700">
              <div className="p-10 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl flex flex-col h-[600px] relative overflow-hidden">
                <div className="flex items-center justify-between mb-10 pb-8 border-b border-white/5 relative z-10">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Anomaly Tracker</h3>
                    <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">Document technical vulnerabilities</p>
                  </div>
                  <Dialog open={bugDialogOpen} onOpenChange={setBugDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-12 px-8 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[9px] shadow-[0_0_20px_-5px_rgba(239,68,68,0.5)]">
                        <PlusCircle className="h-4 w-4 mr-3" /> Initialize Anomaly
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0f0f0f] border-white/10 text-white p-10 max-w-2xl rounded-[3rem] overflow-hidden">
                      <div className="absolute top-0 right-0 h-64 w-64 bg-red-500/5 blur-[100px] rounded-full" />
                      <DialogHeader className="relative z-10">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase">Sync Anomaly</DialogTitle>
                        <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[9px] pt-2">Log technical failure for administrative analysis.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmitBug} className="space-y-8 pt-8 relative z-10">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">Archive Title</Label>
                          <Input value={bugForm.title} onChange={e => setBugForm({...bugForm, title: e.target.value})} placeholder="CONCISE IDENTIFIER" className="h-16 bg-white/5 border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest px-8" required />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">Reproduction Script</Label>
                          <Textarea 
                            value={bugForm.description} 
                            onChange={e => setBugForm({...bugForm, description: e.target.value})} 
                            placeholder="DOCUMENT PROTOCOL STEPS..." 
                            className="bg-white/5 border-white/10 rounded-[2rem] min-h-[160px] font-mono text-[10px] leading-relaxed p-8 resize-none"
                            required 
                          />
                        </div>
                        <DialogFooter className="pt-4">
                          <Button type="submit" disabled={submittingBug || !bugForm.title || !bugForm.description} className="h-16 w-full rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest shadow-xl">
                            {submittingBug ? "Synchronizing..." : "Execute Synchronization"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <ScrollArea className="flex-1 pr-6 relative z-10">
                  <div className="grid gap-6">
                    {bugs.length === 0 ? (
                      <div className="py-32 flex flex-col items-center justify-center text-white/10 gap-6">
                        <Bug className="h-16 w-16 opacity-5" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Matrix stability 100%</p>
                      </div>
                    ) : (
                      bugs.map((bug) => (
                        <div key={bug.id} className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all duration-500 shadow-xl relative overflow-hidden">
                          <div className="flex items-start gap-6">
                            <div className={cn(
                              "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500",
                              bug.status === 'resolved' ? 'bg-primary/10 border-primary/20 text-primary' : 
                              bug.status === 'investigating' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
                              'bg-red-500/10 border-red-500/20 text-red-500'
                            )}>
                              <Bug className="h-6 w-6" />
                            </div>
                            <div className="flex-1 space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <h4 className="font-black text-base text-white tracking-tight uppercase group-hover:text-primary transition-colors">{bug.title}</h4>
                                <Badge className={cn(
                                  "text-[8px] font-black uppercase tracking-[0.2em] px-3 h-6",
                                  bug.status === 'resolved' ? 'bg-primary/10 text-primary border-primary/20' : 
                                  bug.status === 'investigating' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                  'bg-red-500/10 text-red-500 border-red-500/20'
                                )}>
                                  {bug.status.toUpperCase() || 'OPEN'}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-white/40 font-medium leading-relaxed italic line-clamp-2">"{bug.description}"</p>
                              <div className="flex items-center gap-6 pt-4 border-t border-white/5 text-[9px] font-black text-white/20 uppercase tracking-widest">
                                <span className="flex items-center gap-2"><UserIcon className="h-3.5 w-3.5" /> {bug.user.username}</span>
                                <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {formatDate(bug.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            {/* SUGGESTIONS TAB */}
            <TabsContent value="suggestions" className="m-0 space-y-6 animate-in fade-in duration-700">
              <div className="p-10 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl flex flex-col h-[600px] relative overflow-hidden">
                <div className="flex items-center justify-between mb-10 pb-8 border-b border-white/5 relative z-10">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Innovation Matrix</h3>
                    <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">Architectural feature suggestions</p>
                  </div>
                  <Dialog open={ideaDialogOpen} onOpenChange={setIdeaDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-12 px-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[9px] shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]">
                        <PlusCircle className="h-4 w-4 mr-3" /> Propose Innovation
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0f0f0f] border-white/10 text-white p-10 max-w-2xl rounded-[3rem] overflow-hidden">
                      <div className="absolute top-0 right-0 h-64 w-64 bg-amber-500/5 blur-[100px] rounded-full" />
                      <DialogHeader className="relative z-10">
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase">Initialize Proposal</DialogTitle>
                        <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[9px] pt-2">Suggest architectural enhancements for the experiment.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmitIdea} className="space-y-8 pt-8 relative z-10">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">Innovation Title</Label>
                          <Input value={ideaForm.title} onChange={e => setIdeaForm({...ideaForm, title: e.target.value})} placeholder="CONCISE CONCEPT" className="h-16 bg-white/5 border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest px-8" required />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">Technical Specification</Label>
                          <Textarea 
                            value={ideaForm.description} 
                            onChange={e => setIdeaForm({...ideaForm, description: e.target.value})} 
                            placeholder="DESCRIBE THE ENHANCEMENT PROTOCOL..." 
                            className="bg-white/5 border-white/10 rounded-[2rem] min-h-[160px] font-medium p-8 resize-none"
                            required 
                          />
                        </div>
                        <DialogFooter className="pt-4">
                          <Button type="submit" disabled={submittingIdea || !ideaForm.title || !ideaForm.description} className="h-16 w-full rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest shadow-xl">
                            {submittingIdea ? "Transmitting..." : "Initialize Proposal"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <ScrollArea className="flex-1 pr-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {ideas.length === 0 ? (
                      <div className="col-span-full py-32 flex flex-col items-center justify-center text-white/10 gap-6">
                        <Lightbulb className="h-16 w-16 opacity-5" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No innovations logged</p>
                      </div>
                    ) : (
                      ideas.map((idea) => (
                        <div key={idea.id} className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all duration-500 shadow-xl flex flex-col relative overflow-hidden">
                          <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex justify-between items-start gap-4 mb-6">
                            <h4 className="font-black text-sm text-white tracking-tight uppercase group-hover:text-primary transition-colors leading-tight">{idea.title}</h4>
                            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                              <Lightbulb className="h-5 w-5" />
                            </div>
                          </div>
                          <p className="text-[11px] text-white/40 font-medium leading-relaxed italic line-clamp-4 flex-1 mb-6">"{idea.description}"</p>
                          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[9px] font-black text-white/20 uppercase tracking-widest">
                              <UserIcon className="h-3.5 w-3.5" /> {idea.user.username}
                            </div>
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{formatDate(idea.created_at)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            {/* PROTOCOLS TAB */}
            <TabsContent value="notes" className="m-0 space-y-6 animate-in fade-in duration-700">
              <div className="p-10 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl flex flex-col h-[600px] relative overflow-hidden">
                <ScrollArea className="flex-1 pr-6 relative z-10">
                  <div className="max-w-2xl mx-auto space-y-12 py-10">
                    <div className="space-y-4 border-b border-white/5 pb-10 text-center lg:text-left">
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-black uppercase tracking-widest px-4 h-6 mb-2">Technical Brief</Badge>
                      <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-tight">Revisions v{app.version}</h2>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Latest architectural changes & synchronization focus</p>
                    </div>
                    
                    <div className="prose prose-sm prose-invert max-w-none">
                      {app.whats_new ? (
                        <p className="text-sm font-medium text-white/60 leading-relaxed italic p-10 rounded-[2.5rem] bg-white/5 border border-white/10 whitespace-pre-wrap">"{app.whats_new}"</p>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-6 opacity-10">
                          <AlertCircle className="h-16 w-16" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">No protocols documented for this revision</p>
                        </div>
                      )}
                    </div>

                    <div className="p-10 rounded-[2.5rem] bg-primary/5 border border-primary/20 backdrop-blur-md space-y-8 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 blur-3xl rounded-full" />
                      <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-4 relative z-10">
                        <ShieldCheck className="h-5 w-5 text-primary" /> Researcher Protocol
                      </h3>
                      <ul className="space-y-6 relative z-10">
                        {[
                          "Focus on the new neural navigation matrix and dark state toggle.",
                          "Report UI anomalies on displays exceeding 6.5 inches.",
                          "Validate background synchronization bandwidth receipt."
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-4 group/li">
                            <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0 group-hover/li:scale-150 transition-all shadow-[0_0_8px_rgba(34,197,94,1)]" />
                            <span className="text-[11px] font-black text-white/40 uppercase tracking-widest leading-relaxed group-hover:text-white transition-colors">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Researcher Telemetry */}
        <div className="lg:col-span-4 space-y-10">
          <div className="p-10 rounded-[3rem] bg-primary border border-white/20 overflow-hidden relative shadow-[0_30px_60px_-12px_rgba(34,197,94,0.4)] group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity duration-1000" />
            <div className="relative z-10 space-y-10">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Participation</h3>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Research node impact metrics</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all">
                  <div className="text-4xl font-black text-white tracking-tighter mb-1">{bugs.filter(b => b.user.username === user.username).length}</div>
                  <div className="text-[8px] font-black uppercase text-white/50 tracking-widest leading-tight">Anomalies Detected</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all">
                  <div className="text-4xl font-black text-white tracking-tighter mb-1">{ideas.filter(i => i.user.username === user.username).length}</div>
                  <div className="text-[8px] font-black uppercase text-white/50 tracking-widest leading-tight">Innovations Shared</div>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  <span>Community Cohesion</span>
                  <span>75%</span>
                </div>
                <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div className="h-full bg-white w-3/4 rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] transition-all duration-1000 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-40 w-40 bg-white/[0.02] blur-3xl rounded-full" />
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Experiment Telemetry</h3>
              <Activity className="h-4 w-4 text-primary/40 group-hover:animate-spin transition-all" />
            </div>
            
            <div className="space-y-6">
              {[
                { label: "Experiment Start", value: app.created_at ? formatDate(app.created_at) : "UNINITIALIZED", icon: Clock },
                { label: "Detected Anomalies", value: bugs.length, icon: Bug, color: "text-red-500" },
                { label: "Synchronized Revisions", value: bugs.filter(b => b.status === 'resolved').length, icon: CheckCircle2, color: "text-primary" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-4 text-[10px] font-black text-white/20 uppercase tracking-widest group-hover/item:text-white/40 transition-colors">
                    <item.icon className={cn("h-4 w-4", item.color || "text-white/10")} />
                    {item.label}
                  </div>
                  <span className={cn("text-xs font-black text-white tracking-tighter uppercase", item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-10 rounded-[3rem] border border-dashed border-white/10 bg-white/[0.02] text-center space-y-8 group hover:bg-white/[0.04] transition-all">
            <div className="h-16 w-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:border-primary/50 transition-all duration-700 shadow-xl">
              <Cpu className="h-8 w-8 text-white/20 group-hover:text-primary transition-colors" />
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-widest">Protocol Support</h4>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-wider leading-relaxed">Technical difficulties? Contact the architectural lead directly in the community matrix.</p>
            </div>
            <Button variant="ghost" className="w-full h-14 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
              Initialize Comms
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
