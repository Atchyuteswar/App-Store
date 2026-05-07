import React, { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  getTriageBugs, 
  updateBugStatus, 
  updateBugPriority, 
  updateBugNotes,
  replyToBug,
  markBugDuplicate,
  getAdminApps 
} from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Bug, Search, Filter, MoreVertical, MessageSquare, Clock, AlertTriangle, CheckCircle, XCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const COLUMNS = [
  { id: 'reported', title: 'Reported', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'under review', title: 'Under Review', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'fixed', title: 'Fixed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { id: 'closed', title: 'Closed', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

export default function BugTriage() {
  const { toast } = useToast();
  const [bugs, setBugs] = useState([]);
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState("all");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [selectedBug, setSelectedBug] = useState(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchApps();
    fetchBugs();
  }, [selectedApp]);

  const fetchApps = async () => {
    try {
      const res = await getAdminApps();
      setApps(res.data || []);
    } catch (err) {}
  };

  const fetchBugs = async () => {
    setLoading(true);
    try {
      const params = selectedApp === "all" ? {} : { appId: selectedApp };
      const res = await getTriageBugs(params);
      setBugs(res.data || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch bugs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onDragStart = (event) => setActiveId(event.active.id);

  const onDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeBug = bugs.find(b => b.id === active.id);
    const overId = over.id;

    // Handle dropping on a column
    if (COLUMNS.find(c => c.id === overId)) {
      if (activeBug.status !== overId) {
        try {
          await updateBugStatus(active.id, overId);
          setBugs(bugs.map(b => b.id === active.id ? { ...b, status: overId } : b));
          toast({ title: "Status Updated", description: `Bug moved to ${overId}` });
        } catch (err) {
          toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
      }
    }
    setActiveId(null);
  };

  const filteredBugs = bugs.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.app?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-14rem)] flex flex-col gap-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
            Bug Triage
          </h1>
          <p className="text-white/40 mt-2 font-medium">Manage and prioritize reported issues across all applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input 
              placeholder="Search bugs..." 
              className="pl-10 w-[200px] md:w-[300px] bg-white/5 border-white/10 text-white rounded-xl h-11 focus-visible:ring-primary" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={selectedApp} onValueChange={setSelectedApp}>
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white rounded-xl h-11">
              <SelectValue placeholder="All Apps" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">
              <SelectItem value="all">All Apps</SelectItem>
              {apps.map(app => (
                <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map(column => (
            <div key={column.id} className="flex-1 min-w-[320px] flex flex-col gap-6">
              <div className={cn("px-5 py-3 rounded-2xl border flex items-center justify-between font-bold text-xs uppercase tracking-widest", column.color)}>
                <div className="flex items-center gap-2">
                  <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", column.id === 'reported' ? 'bg-blue-400' : column.id === 'under review' ? 'bg-amber-400' : column.id === 'fixed' ? 'bg-green-400' : 'bg-slate-400')} />
                  {column.title}
                </div>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/10">{filteredBugs.filter(b => b.status === column.id).length}</Badge>
              </div>
              
              <SortableContext items={filteredBugs.filter(b => b.status === column.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 bg-white/[0.02] rounded-3xl p-3 space-y-4 border border-white/5 overflow-y-auto custom-scrollbar">
                  {filteredBugs.filter(b => b.status === column.id).map(bug => (
                    <BugCard key={bug.id} bug={bug} onClick={() => setSelectedBug(bug)} />
                  ))}
                  {filteredBugs.filter(b => b.status === column.id).length === 0 && !loading && (
                    <div className="h-20 flex items-center justify-center text-[10px] font-bold text-white/10 uppercase tracking-widest border border-dashed border-white/5 rounded-2xl">
                      Empty Column
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 300, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeId ? (
            <BugCard bug={bugs.find(b => b.id === activeId)} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Bug Details Sheet */}
      <Sheet open={!!selectedBug} onOpenChange={() => setSelectedBug(null)}>
        {selectedBug && <BugDetails bug={selectedBug} onUpdate={fetchBugs} />}
      </Sheet>
    </div>
  );
}

function BugCard({ bug, onClick, isOverlay }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: bug.id,
    disabled: isOverlay
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing hover:shadow-md transition-all group border-l-4",
        bug.priority === 'high' ? 'border-l-red-500' : bug.priority === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500',
        isOverlay && "shadow-2xl ring-2 ring-primary rotate-2 cursor-grabbing"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold leading-none group-hover:text-primary transition-colors">{bug.title}</h4>
          <Bug className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] py-0 h-4">{bug.app?.name}</Badge>
          <Badge variant="secondary" className="text-[10px] py-0 h-4 uppercase">{bug.priority}</Badge>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(bug.createdAt).toLocaleDateString()}</span>
          <span>By {bug.user?.username || 'Tester'}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function BugDetails({ bug, onUpdate }) {
  const { toast } = useToast();
  const [notes, setNotes] = useState(bug.internalNotes || "");
  const [reply, setReply] = useState("");

  const handleUpdatePriority = async (p) => {
    try {
      await updateBugPriority(bug.id, p);
      onUpdate();
      toast({ title: "Priority Updated" });
    } catch (err) {}
  };

  const handleSaveNotes = async () => {
    try {
      await updateBugNotes(bug.id, notes);
      toast({ title: "Notes Saved" });
    } catch (err) {}
  };

  return (
    <SheetContent className="sm:max-w-xl overflow-y-auto">
      <SheetHeader>
        <div className="flex items-center gap-2 text-primary mb-2">
          <Bug className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Issue Details</span>
        </div>
        <SheetTitle className="text-2xl">{bug.title}</SheetTitle>
        <SheetDescription className="flex items-center gap-4 py-2">
          <Badge variant="outline">{bug.app?.name} v{bug.version}</Badge>
          <span className="text-xs flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" /> Reported {new Date(bug.createdAt).toLocaleString()}
          </span>
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-8 py-6">
        <div className="space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2"><Filter className="h-4 w-4" /> Description</h4>
          <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl leading-relaxed italic">
            "{bug.description}"
          </p>
        </div>

        {bug.steps && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold">Steps to Reproduce</h4>
            <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-xl whitespace-pre-wrap">
              {bug.steps}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Priority Level</label>
            <Select value={bug.priority} onValueChange={handleUpdatePriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Platform</label>
            <div className="h-10 flex items-center px-3 border rounded-md bg-muted/10 text-sm font-medium">
              {bug.platform || 'Android'}
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
            <MessageSquare className="h-4 w-4" /> Internal Triage Notes
          </h4>
          <Textarea 
            placeholder="Technical details, root cause analysis, or follow-up tasks..."
            className="min-h-[120px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button className="w-full" onClick={handleSaveNotes}>Save Internal Notes</Button>
        </div>
      </div>

      <SheetFooter className="mt-8 border-t pt-6">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between">
            <Button variant="outline" className="flex-1 mr-2"><Copy className="h-4 w-4 mr-2" /> Mark Duplicate</Button>
            <Button variant="outline" className="flex-1"><XCircle className="h-4 w-4 mr-2" /> Won't Fix</Button>
          </div>
          <Button className="bg-green-700 hover:bg-green-800"><CheckCircle className="h-4 w-4 mr-2" /> Resolve & Notify Tester</Button>
        </div>
      </SheetFooter>
    </SheetContent>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
