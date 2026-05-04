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
  AlertCircle
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function TestingHub() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tabs State
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

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchAppData = async () => {
    setLoading(true);
    try {
      const appRes = await getAppBySlug(slug);
      setApp(appRes.data);
      
      // Fetch all tab data concurrently
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
      toast({ title: "Bug Reported", description: "Thank you for finding this issue!" });
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
      toast({ title: "Idea Submitted", description: "Your feature suggestion has been recorded!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit idea" });
    } finally {
      setSubmittingIdea(false);
    }
  };

  if (loading || !app) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto px-4 md:px-0">
      {/* Premium App Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-background to-background border p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-card border-2 border-primary/20 p-1 shadow-md overflow-hidden shrink-0">
            {app.icon ? (
              <img src={getFileUrl(app.icon)} alt={app.name} className="h-full w-full object-cover rounded-xl" />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-bold text-2xl text-primary bg-primary/5">{app.name[0]}</div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{app.name}</h1>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-mono">v{app.version}</Badge>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Beta Stage</Badge>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">{app.tagline}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {app.apk_file && (
              <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                <a href={getFileUrl(app.apk_file)} download>
                  <Download className="h-4 w-4 mr-2" /> Download Build
                </a>
              </Button>
            )}
            <Button variant="outline" size="lg" asChild>
              <Link to={`/app/${app.slug}`}>
                <ExternalLink className="h-4 w-4 mr-2" /> Store Page
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      </div>

      <div className="grid lg:grid-cols-12 gap-8 flex-1 min-h-0 pb-8">
        {/* Main Interaction Area */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="chat" className="gap-2">
                  <MessageSquare className="h-4 w-4" /> Community
                </TabsTrigger>
                <TabsTrigger value="issues" className="gap-2">
                  <Bug className="h-4 w-4" /> Issues
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="gap-2">
                  <Lightbulb className="h-4 w-4" /> Suggestions
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-2">
                  <History className="h-4 w-4" /> Release Notes
                </TabsTrigger>
              </TabsList>
            </div>

            {/* COMMUNITY TAB */}
            <TabsContent value="chat" className="m-0 border rounded-xl bg-card overflow-hidden shadow-sm data-[state=active]:flex-1 data-[state=active]:flex flex-col min-h-[400px]">
              <div className="bg-muted/30 p-4 border-b flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-semibold">Live Community Chat</span>
                </div>
                <Badge variant="outline" className="text-xs font-normal">{messages.length} messages</Badge>
              </div>

              <ScrollArea className="flex-1 p-4 bg-muted/5">
                <div className="space-y-6">
                  {messages.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
                      <MessageSquare className="h-10 w-10 opacity-20" />
                      <p className="text-sm italic">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.user.username === user.username;
                      return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Avatar className="h-8 w-8 shrink-0 mt-1 border">
                            <AvatarFallback className={isMe ? 'bg-primary/20 text-primary' : 'bg-muted'}>
                              {msg.user.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                              <span className="text-xs font-bold">{isMe ? 'You' : msg.user.username}</span>
                              <span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                              isMe 
                                ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                : 'bg-muted/80 backdrop-blur-sm rounded-tl-none'
                            }`}>
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

              <div className="p-4 bg-muted/20 border-t shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input 
                    placeholder="Message the testing community..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-background border-primary/10 focus-visible:ring-primary"
                    autoComplete="off"
                  />
                  <Button type="submit" disabled={!newMessage.trim()} className="shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* ISSUES TAB */}
            <TabsContent value="issues" className="m-0 border rounded-xl bg-card overflow-hidden shadow-sm data-[state=active]:flex-1 data-[state=active]:flex flex-col min-h-[400px]">
              <div className="p-4 border-b flex items-center justify-between shrink-0 bg-muted/10">
                <div>
                  <h3 className="font-semibold">Issue Tracking</h3>
                  <p className="text-xs text-muted-foreground">Log and track bugs you find in this build</p>
                </div>
                <Dialog open={bugDialogOpen} onOpenChange={setBugDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <PlusCircle className="h-4 w-4" /> Report Issue
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Report a Bug</DialogTitle>
                      <DialogDescription>Provide details to help the developer fix the issue.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitBug} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={bugForm.title} onChange={e => setBugForm({...bugForm, title: e.target.value})} placeholder="e.g. Settings screen scrolls poorly" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Reproduction Steps</Label>
                        <Textarea 
                          value={bugForm.description} 
                          onChange={e => setBugForm({...bugForm, description: e.target.value})} 
                          placeholder="1. Open App&#10;2. Click on...&#10;3. See error..." 
                          rows={6} 
                          required 
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={submittingBug || !bugForm.title || !bugForm.description}>
                          {submittingBug ? "Submitting..." : "Submit Report"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {bugs.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
                      <Bug className="h-10 w-10 opacity-20" />
                      <p className="text-sm italic">No issues reported yet. Clean build!</p>
                    </div>
                  ) : (
                    bugs.map((bug) => (
                      <Card key={bug.id} className="group hover:border-primary/30 transition-all overflow-hidden border-muted/50 shadow-none">
                        <div className="flex items-start gap-4 p-4">
                          <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                            bug.status === 'resolved' ? 'bg-green-500/10 text-green-600' : 
                            bug.status === 'investigating' ? 'bg-amber-500/10 text-amber-600' : 
                            'bg-red-500/10 text-red-600'
                          }`}>
                            <Bug className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-4">
                              <h4 className="font-bold text-sm leading-none group-hover:text-primary transition-colors">{bug.title}</h4>
                              <Badge variant="secondary" className={
                                bug.status === 'resolved' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : 
                                bug.status === 'investigating' ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' : 
                                'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                              }>
                                {bug.status || 'open'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{bug.description}</p>
                            <div className="flex items-center gap-3 pt-2 text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                              <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" /> {bug.user.username}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(bug.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* SUGGESTIONS TAB */}
            <TabsContent value="suggestions" className="m-0 border rounded-xl bg-card overflow-hidden shadow-sm data-[state=active]:flex-1 data-[state=active]:flex flex-col min-h-[400px]">
              <div className="p-4 border-b flex items-center justify-between shrink-0 bg-muted/10">
                <div>
                  <h3 className="font-semibold">Innovation Board</h3>
                  <p className="text-xs text-muted-foreground">Suggest new features or improvements</p>
                </div>
                <Dialog open={ideaDialogOpen} onOpenChange={setIdeaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Lightbulb className="h-4 w-4" /> New Suggestion
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Feature Suggestion</DialogTitle>
                      <DialogDescription>What would make this app even better?</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitIdea} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={ideaForm.title} onChange={e => setIdeaForm({...ideaForm, title: e.target.value})} placeholder="e.g. Add dark mode to dashboard" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Detail</Label>
                        <Textarea 
                          value={ideaForm.description} 
                          onChange={e => setIdeaForm({...ideaForm, description: e.target.value})} 
                          placeholder="Describe your idea in detail..." 
                          rows={6} 
                          required 
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={submittingIdea || !ideaForm.title || !ideaForm.description}>
                          {submittingIdea ? "Submitting..." : "Post Suggestion"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ideas.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
                      <Lightbulb className="h-10 w-10 opacity-20" />
                      <p className="text-sm italic">No suggestions yet. Be the first to innovate!</p>
                    </div>
                  ) : (
                    ideas.map((idea) => (
                      <Card key={idea.id} className="group hover:border-primary/30 transition-all border-muted/50 shadow-none flex flex-col">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{idea.title}</h4>
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Lightbulb className="h-4 w-4" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex-1">
                          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{idea.description}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 border-t bg-muted/5 mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                            <UserIcon className="h-3 w-3" /> {idea.user.username}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{formatDate(idea.created_at)}</span>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* RELEASE NOTES TAB */}
            <TabsContent value="notes" className="m-0 border rounded-xl bg-card overflow-hidden shadow-sm data-[state=active]:flex-1 data-[state=active]:flex flex-col min-h-[400px]">
              <ScrollArea className="flex-1">
                <div className="p-8 max-w-2xl mx-auto space-y-8">
                  <div className="space-y-2 border-b pb-6">
                    <h2 className="text-2xl font-bold">What's New in v{app.version}</h2>
                    <p className="text-muted-foreground">Latest changes and focus areas for testing.</p>
                  </div>
                  
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {app.whats_new ? (
                      <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{app.whats_new}</p>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground/30" />
                        <p className="text-muted-foreground italic">The developer hasn't provided specific release notes for this build yet.</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                      <Info className="h-4 w-4 text-primary" /> Tester Guidelines
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        Focus on the new navigation system and dark mode toggle.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        Report any UI inconsistencies on screens larger than 6 inches.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        Verify that notifications are received when the app is in background.
                      </li>
                    </ul>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">
          {/* Your Stats Card */}
          <Card className="bg-primary text-primary-foreground overflow-hidden relative border-none shadow-lg shadow-primary/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-lg">Your Participation</CardTitle>
              <CardDescription className="text-primary-foreground/70">Your impact on this project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{bugs.filter(b => b.user.username === user.username).length}</div>
                  <div className="text-[10px] uppercase font-bold opacity-70 tracking-widest">Bugs Found</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{ideas.filter(i => i.user.username === user.username).length}</div>
                  <div className="text-[10px] uppercase font-bold opacity-70 tracking-widest">Ideas Shared</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-70">
                  <span>Community Level</span>
                  <span>75%</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-3/4 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Info Widget */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">About this Test</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Started</span>
                  <span className="text-sm font-semibold">{app.created_at ? formatDate(app.created_at) : "N/A"}</span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Bug className="h-4 w-4" /> Total Issues</span>
                  <span className="text-sm font-semibold text-red-500">{bugs.length}</span>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Fixed</span>
                  <span className="text-sm font-semibold text-green-500">{bugs.filter(b => b.status === 'resolved').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Support */}
          <Card className="border-dashed bg-muted/10">
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-background border flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold">Need Help?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">Having trouble with this build? Message the developer team directly in the Community chat.</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Contact Developer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
