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
import { Bug, Search, Filter, MoreVertical, MessageSquare, Clock, AlertTriangle, CheckCircle, XCircle, Copy, Terminal, User, Hash, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { id: 'reported', title: 'Reported', color: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]', dot: 'bg-blue-400' },
  { id: 'under review', title: 'Analysis', color: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]', dot: 'bg-amber-400' },
  { id: 'fixed', title: 'Resolved', color: 'text-primary', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]', dot: 'bg-primary' },
  { id: 'closed', title: 'Archived', color: 'text-white/20', glow: '', dot: 'bg-white/10' },
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
    <div className="h-[calc(100vh-14rem)] flex flex-col gap-10 selection:bg-primary/30">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] font-black uppercase tracking-widest px-3 h-6 mb-2">Technical Triage</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-premium uppercase leading-tight">Anomalies</h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Platform-wide kernel issue management & resolution</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="SEARCH ANOMALY..." 
              className="pl-12 w-[240px] md:w-[320px] h-14 bg-white/5 border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 focus-visible:ring-0 placeholder:text-white/10 group-hover:bg-white/[0.08] transition-all" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={selectedApp} onValueChange={setSelectedApp}>
            <SelectTrigger className="h-14 w-[200px] bg-white/5 border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 focus:ring-0">
              <SelectValue placeholder="ALL SYSTEMS" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f0f0f] border-white/10 text-white rounded-2xl p-2">
              <SelectItem value="all" className="rounded-xl py-3 font-bold uppercase tracking-widest text-[10px]">ALL SYSTEMS</SelectItem>
              {apps.map(app => (
                <SelectItem key={app.id} value={app.id} className="rounded-xl py-3 font-bold uppercase tracking-widest text-[10px]">{app.name.toUpperCase()}</SelectItem>
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
        <div className="flex-1 flex gap-8 overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map(column => (
            <div key={column.id} className="flex-1 min-w-[340px] flex flex-col gap-6">
              <div className="px-6 py-4 rounded-[1.5rem] bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]", column.dot)} />
                  <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", column.color)}>{column.title}</span>
                </div>
                <Badge className="bg-white/5 text-white/40 border-white/10 font-black text-[10px] px-3 h-6">{filteredBugs.filter(b => b.status === column.id).length}</Badge>
              </div>
              
              <SortableContext items={filteredBugs.filter(b => b.status === column.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 bg-black/40 rounded-[2.5rem] p-4 space-y-4 border border-white/5 backdrop-blur-xl overflow-y-auto custom-scrollbar shadow-2xl relative">
                  <div className="absolute top-0 right-0 h-64 w-64 bg-white/[0.02] blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                  {filteredBugs.filter(b => b.status === column.id).map(bug => (
                    <BugCard key={bug.id} bug={bug} onClick={() => setSelectedBug(bug)} />
                  ))}
                  {filteredBugs.filter(b => b.status === column.id).length === 0 && !loading && (
                    <div className="h-32 flex flex-col items-center justify-center gap-3 border border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
                      <Terminal className="h-5 w-5 text-white/5" />
                      <p className="text-[9px] font-black text-white/10 uppercase tracking-widest">No anomalies detected</p>
                    </div>
                  )}
                  {loading && Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-32 w-full rounded-[2rem] bg-white/5 animate-pulse border border-white/5" />
                  ))}
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

  const priorityColor = bug.priority === 'critical' ? 'bg-red-500' : bug.priority === 'high' ? 'bg-orange-500' : bug.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md group hover:bg-white/[0.08] transition-all duration-500 cursor-grab active:cursor-grabbing shadow-xl",
        isOverlay && "ring-2 ring-primary rotate-3 scale-105 shadow-2xl z-50 bg-[#0f0f0f]"
      )}
      onClick={onClick}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white leading-tight tracking-tight group-hover:text-primary transition-colors">{bug.title}</h4>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{bug.app?.name}</span>
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">v{bug.version}</span>
            </div>
          </div>
          <div className={cn("h-2 w-2 rounded-full mt-1.5 shadow-[0_0_8px_rgba(255,255,255,0.3)]", priorityColor)} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <User className="h-3 w-3 text-white/40" />
            </div>
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{bug.user?.username || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2 text-white/20">
            <Clock className="h-3 w-3" />
            <span className="text-[9px] font-black uppercase tracking-widest">{new Date(bug.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
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
    <SheetContent className="bg-[#0f0f0f] border-l border-white/10 text-white sm:max-w-2xl p-0 overflow-hidden flex flex-col">
      <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
      
      <SheetHeader className="p-10 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <Bug className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Anomaly Dossier</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Hash className="h-3 w-3 text-white/20" />
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">REF-{bug.id?.slice(-8).toUpperCase()}</span>
            </div>
          </div>
        </div>
        <SheetTitle className="text-3xl font-black tracking-tighter text-white uppercase leading-tight">{bug.title}</SheetTitle>
        <SheetDescription className="flex flex-wrap items-center gap-4 pt-4">
          <Badge className="bg-white/5 border-white/10 text-white/60 font-black uppercase tracking-widest text-[9px] px-3 h-6">{bug.app?.name}</Badge>
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px] px-3 h-6">v{bug.version}</Badge>
          <div className="h-4 w-[1px] bg-white/10 mx-1" />
          <div className="flex items-center gap-2 text-white/30">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{new Date(bug.createdAt).toLocaleString()}</span>
          </div>
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10 space-y-12">
        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-3">
            <div className="w-1 h-1 rounded-full bg-primary" />
            Manifestation
          </h4>
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
            <p className="text-sm font-medium text-white/60 leading-relaxed italic">"{bug.description}"</p>
          </div>
        </section>

        {bug.steps && (
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-primary" />
              Reproduction Protocol
            </h4>
            <div className="p-8 rounded-[2rem] bg-black/40 border border-white/5 font-mono text-[11px] text-white/40 leading-relaxed whitespace-pre-wrap">
              {bug.steps}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-8">
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Criticality Level</h4>
            <Select value={bug.priority} onValueChange={handleUpdatePriority}>
              <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f0f0f] border-white/10 text-white rounded-2xl p-2">
                <SelectItem value="low" className="rounded-xl py-3 font-bold">LOW PRIORITY</SelectItem>
                <SelectItem value="medium" className="rounded-xl py-3 font-bold">MEDIUM THREAT</SelectItem>
                <SelectItem value="high" className="rounded-xl py-3 font-bold">HIGH SEVERITY</SelectItem>
                <SelectItem value="critical" className="rounded-xl py-3 font-bold text-red-400">CRITICAL FAILURE</SelectItem>
              </SelectContent>
            </Select>
          </section>
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Architecture</h4>
            <div className="h-14 flex items-center px-6 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] text-white/60 uppercase tracking-widest gap-3">
              <Layers className="h-4 w-4 text-white/20" />
              {bug.platform || 'ANDROID KERNEL'}
            </div>
          </section>
        </div>

        <section className="space-y-4 pt-4 border-t border-white/5">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
            <MessageSquare className="h-4 w-4" />
            Triage Intelligence
          </h4>
          <Textarea 
            placeholder="Document technical root cause, architectural impact, or resolution strategy..."
            className="min-h-[160px] bg-white/5 border-white/10 rounded-[2rem] font-medium p-8 resize-none placeholder:text-white/10 focus:bg-white/[0.08] transition-all"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button onClick={handleSaveNotes} className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] border border-white/10 transition-all active:scale-95">Synchronize Intelligence</Button>
        </section>
      </div>

      <SheetFooter className="p-10 border-t border-white/5 bg-black/40 relative z-10 shrink-0">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"><Copy className="h-4 w-4 mr-3" /> Mark Duplicate</Button>
            <Button variant="ghost" className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-400/40 hover:text-red-400 hover:bg-red-400/5 border border-transparent hover:border-red-400/10"><XCircle className="h-4 w-4 mr-3" /> Terminate Fix</Button>
          </div>
          <Button className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-[0_0_30px_-10px_rgba(34,197,94,0.5)] transition-all hover:scale-[1.02]">
            <CheckCircle className="h-5 w-5 mr-3" /> Finalize Resolution
          </Button>
        </div>
      </SheetFooter>
    </SheetContent>
  );
}
