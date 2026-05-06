import { useState, useEffect } from "react";
import { getTesterEnrollments, getTesterIdeas, addTesterIdea, upvoteTesterIdea } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Lightbulb, 
  Plus, 
  ThumbsUp, 
  ChevronRight, 
  Package, 
  Filter,
  Sparkles,
  Trophy,
  History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const columns = [
  { id: "submitted", title: "Submitted", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { id: "under_review", title: "Under Review", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { id: "planned", title: "Planned", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { id: "implemented", title: "Implemented", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { id: "declined", title: "Declined", color: "bg-muted text-muted-foreground border-muted" },
];

const categories = ["UI", "Performance", "Feature", "Other"];

export default function IdeaBoard() {
  const [enrollments, setEnrollments] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Filters
  const [filterApp, setFilterApp] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // Form State
  const [formData, setFormData] = useState({
    appSlug: "",
    title: "",
    description: "",
    category: "Feature",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: enrolls } = await getTesterEnrollments();
      setEnrollments(enrolls || []);
      if (enrolls?.length > 0) {
        fetchAllIdeas(enrolls);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllIdeas = async (enrolls) => {
    try {
      const ideaPromises = enrolls.map(e => getTesterIdeas(e.app.slug));
      const results = await Promise.all(ideaPromises);
      const allIdeas = results.flatMap(r => r.data || []);
      setIdeas(allIdeas.sort((a, b) => b.upvotes?.count - a.upvotes?.count || new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.appSlug || !formData.title || !formData.description) {
      toast({ title: "Error", description: "All fields marked * are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addTesterIdea(formData.appSlug, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
      });
      toast({ title: "Idea Submitted!", description: "Thanks for the feedback. Others can now upvote your idea." });
      setIsModalOpen(false);
      setFormData({ appSlug: "", title: "", description: "", category: "Feature" });
      fetchAllIdeas(enrollments);
    } catch (err) {
      toast({ title: "Error", description: "Failed to submit idea.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (id) => {
    try {
      const { data } = await upvoteTesterIdea(id);
      toast({ 
        title: data.upvoted ? "Upvoted!" : "Upvote Removed", 
        description: data.upvoted ? "You upvoted this idea." : "Your upvote was removed." 
      });
      fetchAllIdeas(enrollments);
    } catch (err) {
      toast({ title: "Error", description: "Failed to upvote.", variant: "destructive" });
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchApp = filterApp === "all" || idea.app?.slug === filterApp;
    const matchCat = filterCategory === "all" || idea.category === filterCategory;
    return matchApp && matchCat;
  });

  if (loading) return <BoardSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Idea Board</h1>
          <p className="text-muted-foreground">Share feature requests and improvements with the community.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 shadow-lg gap-2"
        >
          <Plus className="h-4 w-4" /> Share an Idea
        </Button>
      </div>

      {/* Top Highlight Card */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-xl bg-gradient-to-br from-green-600 to-green-800 text-white overflow-hidden relative group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Community Spotlight</h2>
                <p className="text-green-50 max-w-lg leading-relaxed">
                  Your ideas directly shape the future of our apps. The most upvoted ideas are prioritized for development every month.
                </p>
                <div className="flex gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-sm font-bold">
                    <Trophy className="h-4 w-4 text-yellow-300" />
                    <span>{ideas.filter(i => i.status === 'implemented').length} Implemented</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-bold">
                    <History className="h-4 w-4 text-green-200" />
                    <span>{ideas.filter(i => i.status === 'under_review').length} In Review</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter Board
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={filterApp} onValueChange={setFilterApp}>
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder="All Apps" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                {enrollments.map(e => (
                  <SelectItem key={e.app.id} value={e.app.slug}>{e.app.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", column.id === 'declined' ? 'bg-muted-foreground' : 'bg-primary')} />
                <h3 className="font-bold text-sm tracking-tight">{column.title}</h3>
              </div>
              <Badge variant="secondary" className="text-[10px] h-5 rounded-full font-bold">
                {filteredIdeas.filter(i => i.status === column.id).length}
              </Badge>
            </div>

            <div className="space-y-4 min-h-[400px] rounded-2xl bg-muted/20 p-2 border-2 border-dashed border-muted/30">
              {filteredIdeas.filter(i => i.status === column.id).map((idea) => (
                <Card key={idea.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-card">
                  <div className={cn("h-1 w-full", column.id === 'implemented' ? 'bg-green-500' : 'bg-muted/10')} />
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-[9px] h-4 px-1 uppercase font-bold text-muted-foreground">
                        {idea.category}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {format(new Date(idea.created_at), "MMM d")}
                      </span>
                    </div>
                    <CardTitle className="text-sm font-bold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {idea.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                      {idea.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary max-w-[150px]">
                        <Package className="h-3 w-3 shrink-0" />
                        <span className="truncate">{idea.app?.name || "App"}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 gap-1.5 hover:bg-green-50 hover:text-green-600 transition-colors"
                        onClick={() => handleUpvote(idea.id)}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">{idea.upvotes?.count || 0}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredIdeas.filter(i => i.status === column.id).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 opacity-30">
                  <Lightbulb className="h-8 w-8 mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Empty</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Idea Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-amber-500" />
              Share Your Vision
            </DialogTitle>
            <DialogDescription>
              Suggest a feature, improvement, or design refinement. Let's build together.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Application *</label>
                <Select 
                  value={formData.appSlug} 
                  onValueChange={(val) => setFormData({...formData, appSlug: val})}
                >
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue placeholder="Choose an app" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollments.map(e => (
                      <SelectItem key={e.app.id} value={e.app.slug}>{e.app.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category *</label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({...formData, category: val})}
                >
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Idea Title *</label>
              <Input 
                placeholder="e.g. Add dark mode to dashboard" 
                className="bg-muted/30"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Detailed Description *</label>
              <Textarea 
                placeholder="Explain your idea and why it would be valuable..." 
                className="bg-muted/30 min-h-[120px] resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 min-w-[120px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sharing..." : "Submit Idea"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between">
        <div className="h-10 w-48 bg-muted rounded-md" />
        <div className="h-10 w-32 bg-muted rounded-md" />
      </div>
      <div className="h-40 bg-muted rounded-2xl w-full" />
      <div className="flex gap-6 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-80 h-[500px] bg-muted/10 rounded-2xl border-2 border-dashed" />
        ))}
      </div>
    </div>
  );
}
