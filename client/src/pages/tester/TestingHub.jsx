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
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Bug, Lightbulb, Send, CheckCircle2, Circle, Clock } from "lucide-react";
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
    <div className="space-y-6 max-w-5xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 bg-card border rounded-xl p-4 shadow-sm shrink-0">
        <div className="h-16 w-16 rounded-xl bg-muted overflow-hidden shrink-0">
          {app.icon ? (
            <img src={getFileUrl(app.icon)} alt={app.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">{app.name[0]}</div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{app.name}</h1>
            <Badge variant="secondary">v{app.version}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">{app.tagline}</p>
        </div>
      </div>

      {/* Tabs Area */}
      <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0 shrink-0">
          <TabsTrigger value="chat" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6">
            <MessageSquare className="h-4 w-4 mr-2" /> Chat
          </TabsTrigger>
          <TabsTrigger value="bugs" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6">
            <Bug className="h-4 w-4 mr-2" /> Bugs
          </TabsTrigger>
          <TabsTrigger value="ideas" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6">
            <Lightbulb className="h-4 w-4 mr-2" /> Ideas
          </TabsTrigger>
        </TabsList>

        {/* CHAT TAB */}
        <TabsContent value="chat" className="flex-1 mt-0 flex flex-col border rounded-b-xl rounded-tr-xl bg-card overflow-hidden min-h-[500px]">
          <div className="bg-muted/30 p-3 border-b shrink-0 flex items-center justify-between">
            <div className="text-sm font-medium">Tester Community Chat</div>
            <div className="text-xs text-muted-foreground">{messages.length} messages</div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                No messages yet. Say hello!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.user.username === user.username ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-1 px-1">
                    <span className="text-xs font-semibold">{msg.user.username === user.username ? 'You' : msg.user.username}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.user.username === user.username ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 bg-card border-t shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}><Send className="h-4 w-4" /></Button>
            </form>
          </div>
        </TabsContent>

        {/* BUGS TAB */}
        <TabsContent value="bugs" className="flex-1 mt-0 p-6 border rounded-b-xl rounded-tr-xl bg-card overflow-y-auto custom-scrollbar min-h-[500px]">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
              <div>
                <h3 className="font-bold text-lg">Report a Bug</h3>
                <p className="text-sm text-muted-foreground">Found an issue? Let the developer know so they can fix it.</p>
              </div>
              <form onSubmit={handleSubmitBug} className="space-y-4 bg-muted/20 p-4 rounded-xl border">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={bugForm.title} onChange={e => setBugForm({...bugForm, title: e.target.value})} placeholder="e.g. App crashes on login" required />
                </div>
                <div className="space-y-2">
                  <Label>Description / Steps to Reproduce</Label>
                  <Textarea value={bugForm.description} onChange={e => setBugForm({...bugForm, description: e.target.value})} placeholder="1. Go to...&#10;2. Click on...&#10;3. App crashes" rows={5} required />
                </div>
                <Button type="submit" className="w-full" disabled={submittingBug || !bugForm.title || !bugForm.description}>
                  <Bug className="h-4 w-4 mr-2" /> Submit Bug
                </Button>
              </form>
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-bold text-lg">Reported Bugs ({bugs.length})</h3>
              {bugs.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground">No bugs reported yet. Great job!</div>
              ) : (
                <div className="space-y-3">
                  {bugs.map((bug) => (
                    <Card key={bug.id}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-base">{bug.title}</CardTitle>
                          {bug.status === 'resolved' ? (
                            <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Resolved</Badge>
                          ) : bug.status === 'investigating' ? (
                            <Badge variant="secondary" className="bg-orange-500/20 text-orange-600"><Clock className="h-3 w-3 mr-1" /> Investigating</Badge>
                          ) : (
                            <Badge variant="outline"><Circle className="h-3 w-3 mr-1" /> Open</Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs">Reported by {bug.user.username} • {formatDate(bug.created_at)}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{bug.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* IDEAS TAB */}
        <TabsContent value="ideas" className="flex-1 mt-0 p-6 border rounded-b-xl rounded-tr-xl bg-card overflow-y-auto custom-scrollbar min-h-[500px]">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
              <div>
                <h3 className="font-bold text-lg">Suggest a Feature</h3>
                <p className="text-sm text-muted-foreground">Have an idea to make this app better? We'd love to hear it!</p>
              </div>
              <form onSubmit={handleSubmitIdea} className="space-y-4 bg-muted/20 p-4 rounded-xl border">
                <div className="space-y-2">
                  <Label>Idea Title</Label>
                  <Input value={ideaForm.title} onChange={e => setIdeaForm({...ideaForm, title: e.target.value})} placeholder="e.g. Dark Mode Support" required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={ideaForm.description} onChange={e => setIdeaForm({...ideaForm, description: e.target.value})} placeholder="It would be great if the app supported a dark theme for nighttime reading." rows={5} required />
                </div>
                <Button type="submit" className="w-full" disabled={submittingIdea || !ideaForm.title || !ideaForm.description}>
                  <Lightbulb className="h-4 w-4 mr-2" /> Submit Idea
                </Button>
              </form>
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-bold text-lg">Community Ideas ({ideas.length})</h3>
              {ideas.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground">No ideas submitted yet. Be the first!</div>
              ) : (
                <div className="space-y-3">
                  {ideas.map((idea) => (
                    <Card key={idea.id}>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">{idea.title}</CardTitle>
                        <CardDescription className="text-xs">Suggested by {idea.user.username} • {formatDate(idea.created_at)}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{idea.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
