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
import { toast } from "@/components/ui/use-toast";

const COLUMNS = [
  { id: 'reported', title: 'Reported', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'under review', title: 'Under Review', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'confirmed', title: 'Confirmed', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'fixed', title: 'Fixed', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'closed', title: 'Closed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

function SortableBugCard({ bug, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: bug.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={() => onClick(bug)}
      className="group bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing mb-2"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">{bug.title}</h4>
        <Badge className={cn("text-[10px] px-1.5 h-4 uppercase", PRIORITY_COLORS[bug.priority || 'medium'])}>
          {bug.priority || 'medium'}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{bug.description}</p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
            {bug.user?.username?.charAt(0).toUpperCase()}
          </div>
          <span className="text-[10px] text-muted-foreground">{bug.app?.name}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {bug.recordingUrl && <Copy className="h-3 w-3 text-blue-500" />}
          <span className="text-[10px]">{new Date(bug.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function BugTriage() {
  const [bugs, setBugs] = useState([]);
  const [apps, setApps] = useState([]);
  const [appId, setAppId] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeBug, setActiveBug] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchApps();
    fetchBugs();
  }, [appId]);

  const fetchApps = async () => {
    try {
      const res = await getAdminApps();
      setApps(res.data || []);
    } catch (err) {}
  };

  const fetchBugs = async () => {
    setLoading(true);
    try {
      const params = appId === "all" ? {} : { appId };
      const res = await getTriageBugs(params);
      setBugs(res.data || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch bugs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const bugId = active.id;
    const overId = over.id;

    // Check if dragged over a column or another bug
    const overColumn = COLUMNS.find(c => c.id === overId);
    let newStatus = overColumn ? overColumn.id : null;

    if (!newStatus) {
      const targetBug = bugs.find(b => b.id === overId);
      if (targetBug) newStatus = targetBug.status;
    }

    if (newStatus && bugs.find(b => b.id === bugId).status !== newStatus) {
      // Optimistic update
      const updatedBugs = bugs.map(b => b.id === bugId ? { ...b, status: newStatus } : b);
      setBugs(updatedBugs);

      try {
        await updateBugStatus(bugId, newStatus);
        toast({ title: "Status Updated", description: `Bug moved to ${newStatus}` });
      } catch (err) {
        fetchBugs(); // Rollback
        toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      }
    }
  };

  const onBugClick = (bug) => {
    setActiveBug(bug);
    setIsDetailOpen(true);
  };

  const handleUpdatePriority = async (priority) => {
    try {
      await updateBugPriority(activeBug.id, priority);
      setBugs(bugs.map(b => b.id === activeBug.id ? { ...b, priority } : b));
      setActiveBug({ ...activeBug, priority });
      toast({ title: "Priority Updated" });
    } catch (err) {}
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    try {
      await replyToBug(activeBug.id, replyText);
      setReplyText("");
      toast({ title: "Reply Sent", description: "The tester has been notified." });
    } catch (err) {}
  };

  const filteredBugs = bugs.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bug Triage Board</h1>
          <p className="text-muted-foreground mt-1">Manage and prioritize reported issues.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search bugs..." 
              className="pl-9" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={appId} onValueChange={setAppId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Apps" />
            </SelectTrigger>
            <SelectContent>
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
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map(column => (
            <div key={column.id} className="flex-1 min-w-[300px] flex flex-col bg-muted/30 rounded-xl border p-3">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider">{column.title}</h3>
                  <Badge variant="secondary" className="h-5 min-w-5 px-1 flex items-center justify-center rounded-full text-[10px]">
                    {filteredBugs.filter(b => b.status === column.id).length}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                <SortableContext 
                  id={column.id}
                  items={filteredBugs.filter(b => b.status === column.id).map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="min-h-[100px]">
                    {filteredBugs.filter(b => b.status === column.id).map(bug => (
                      <SortableBugCard key={bug.id} bug={bug} onClick={onBugClick} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            </div>
          ))}
        </div>
      </DndContext>

      {/* Bug Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-xl w-full">
          {activeBug && (
            <div className="flex flex-col h-full">
              <SheetHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={COLUMNS.find(c => c.id === activeBug.status)?.color}>
                    {activeBug.status}
                  </Badge>
                  <Badge variant="outline">{activeBug.app?.name}</Badge>
                </div>
                <SheetTitle className="text-xl">{activeBug.title}</SheetTitle>
                <SheetDescription>
                  Reported by {activeBug.user?.username} on {new Date(activeBug.createdAt).toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto my-6 space-y-6 pr-2">
                <section>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg border">{activeBug.description}</p>
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <section>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Priority</h4>
                    <Select value={activeBug.priority} onValueChange={handleUpdatePriority}>
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
                  </section>
                  <section>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Assignee</h4>
                    <Select defaultValue="unassigned">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        <SelectItem value="me">Me (Admin)</SelectItem>
                      </SelectContent>
                    </Select>
                  </section>
                </div>

                {activeBug.recordingUrl && (
                  <section>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Media</h4>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                      <video src={activeBug.recordingUrl} controls className="max-h-full max-w-full" />
                    </div>
                  </section>
                )}

                <section>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Quick Reply</h4>
                  <Textarea 
                    placeholder="Type a message to the tester..." 
                    className="min-h-[100px]"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm" onClick={handleSendReply}>
                      <MessageSquare className="h-4 w-4 mr-2" />Send Reply
                    </Button>
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Internal Notes</h4>
                  <Textarea 
                    placeholder="Notes for admins only..." 
                    defaultValue={activeBug.internalNotes}
                    onBlur={(e) => updateBugNotes(activeBug.id, e.target.value)}
                  />
                </section>
              </div>

              <SheetFooter className="flex-row gap-2 sm:justify-start">
                <Button variant="outline" className="flex-1" onClick={() => setIsDuplicateDialogOpen(true)}>
                  <Copy className="h-4 w-4 mr-2" />Duplicate
                </Button>
                <Button variant="destructive" className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />Close Bug
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
