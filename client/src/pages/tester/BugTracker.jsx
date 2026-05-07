import React, { useState, useEffect } from "react";
import { getTesterEnrollments, getTesterBugs, addTesterBug, getSimilarBugs } from "@/services/api";
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
  Bug, 
  Plus, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Search,
  MessageSquare,
  Package,
  Video,
  StopCircle,
  Play,
  Copy,
  Terminal,
  Activity,
  Layers,
  Zap,
  User,
  Hash
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const severityColors = {
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]",
};

export default function BugTracker() {
  const [enrollments, setEnrollments] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedBug, setExpandedBug] = useState(null);
  const { toast } = useToast();

  const [filterApp, setFilterApp] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState({
    appSlug: "",
    title: "",
    description: "",
    severity: "medium",
    steps: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const [similarBugs, setSimilarBugs] = useState([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: enrolls } = await getTesterEnrollments();
      setEnrollments(enrolls || []);
      if (enrolls?.length > 0) {
        fetchAllBugs(enrolls);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBugs = async (enrolls) => {
    try {
      const bugPromises = enrolls.map(e => getTesterBugs(e.app.slug));
      const results = await Promise.all(bugPromises);
      const allBugs = results.flatMap(r => r.data || []);
      setBugs(allBugs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTitleBlur = async () => {
    if (formData.title.length < 5 || !formData.appSlug) return;
    setIsCheckingDuplicates(true);
    try {
      const res = await getSimilarBugs({ title: formData.title, appSlug: formData.appSlug });
      setSimilarBugs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      toast({ title: "Recording Error", description: "Could not start screen recording.", variant: "destructive" });
    }
  };

  const stopRecording = () => { if (mediaRecorder) { mediaRecorder.stop(); setIsRecording(false); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.appSlug || !formData.title || !formData.description) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const finalData = new FormData();
      finalData.append('title', formData.title);
      finalData.append('description', formData.description);
      finalData.append('severity', formData.severity);
      finalData.append('steps', formData.steps);
      if (videoBlob) finalData.append('recording', videoBlob, 'recording.webm');
      await addTesterBug(formData.appSlug, finalData);
      toast({ title: "Anomaly Synchronized", description: "Intelligence successfully added to the research archive." });
      setIsModalOpen(false);
      resetForm();
      fetchAllBugs(enrollments);
    } catch (err) {
      toast({ title: "Error", description: "Failed to submit anomaly report.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ appSlug: "", title: "", description: "", severity: "medium", steps: "" });
    setVideoBlob(null);
    setVideoUrl(null);
    setSimilarBugs([]);
  };

  const filteredBugs = bugs.filter(bug => {
    const matchApp = filterApp === "all" || bug.app?.slug === filterApp;
    const matchSeverity = filterSeverity === "all" || bug.severity === filterSeverity;
    const matchStatus = filterStatus === "all" || bug.status === filterStatus;
    return matchApp && matchSeverity && matchStatus;
  });

  return (
    <div className="space-y-12 pb-20 selection:bg-primary/30">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 h-6 mb-2">Research Dossier</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-premium uppercase leading-tight">Anomalies</h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Cross-platform technical issue archives & telemetry</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-[0_0_30px_-10px_rgba(34,197,94,0.5)] transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5 mr-3" /> Initialize Anomaly
        </Button>
      </div>

      {/* Filter Matrix */}
      <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-wrap items-center gap-8 shadow-2xl">
        <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-6 h-12 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
          <Filter className="h-4 w-4 text-primary" /> Parameter Sync
        </div>
        
        <Select value={filterApp} onValueChange={setFilterApp}>
          <SelectTrigger className="w-[240px] h-14 bg-black/40 border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 focus:ring-0">
            <SelectValue placeholder="ALL RESEARCH" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f0f0f] border-white/10 text-white rounded-2xl p-2">
            <SelectItem value="all" className="rounded-xl py-3 font-bold">ALL RESEARCH</SelectItem>
            {enrollments.map(e => (
              <SelectItem key={e.app.id} value={e.app.slug} className="rounded-xl py-3 font-bold uppercase tracking-widest text-[10px]">{e.app.name.toUpperCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-[200px] h-14 bg-black/40 border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 focus:ring-0">
            <SelectValue placeholder="CRITICALITY" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f0f0f] border-white/10 text-white rounded-2xl p-2">
            <SelectItem value="all" className="rounded-xl py-3 font-bold">ANY CRITICALITY</SelectItem>
            <SelectItem value="low" className="rounded-xl py-3 font-bold">LOW THREAT</SelectItem>
            <SelectItem value="medium" className="rounded-xl py-3 font-bold">MEDIUM THREAT</SelectItem>
            <SelectItem value="high" className="rounded-xl py-3 font-bold text-orange-400">HIGH SEVERITY</SelectItem>
            <SelectItem value="critical" className="rounded-xl py-3 font-bold text-red-500 animate-pulse">CRITICAL FAILURE</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px] h-14 bg-black/40 border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 focus:ring-0">
            <SelectValue placeholder="STATE" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f0f0f] border-white/10 text-white rounded-2xl p-2">
            <SelectItem value="all" className="rounded-xl py-3 font-bold">ANY STATE</SelectItem>
            <SelectItem value="open" className="rounded-xl py-3 font-bold">DETECTED (OPEN)</SelectItem>
            <SelectItem value="in progress" className="rounded-xl py-3 font-bold text-amber-400">ANALYSIS (IN PROGRESS)</SelectItem>
            <SelectItem value="resolved" className="rounded-xl py-3 font-bold text-primary">SYNCHRONIZED (RESOLVED)</SelectItem>
            <SelectItem value="closed" className="rounded-xl py-3 font-bold text-white/20">ARCHIVED (CLOSED)</SelectItem>
          </SelectContent>
        </Select>

        {(filterApp !== "all" || filterSeverity !== "all" || filterStatus !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterApp("all"); setFilterSeverity("all"); setFilterStatus("all"); }} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all ml-auto">
            Reset Sync
          </Button>
        )}
      </div>

      {/* Archive Matrix */}
      <div className="rounded-[3rem] bg-black/40 border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="p-8 font-black text-[10px] uppercase tracking-[0.3em] text-white/20 w-16"></th>
                <th className="p-8 font-black text-[10px] uppercase tracking-[0.3em] text-white/20">Research Node</th>
                <th className="p-8 font-black text-[10px] uppercase tracking-[0.3em] text-white/20">Subject</th>
                <th className="p-8 font-black text-[10px] uppercase tracking-[0.3em] text-white/20">Criticality</th>
                <th className="p-8 font-black text-[10px] uppercase tracking-[0.3em] text-white/20">State</th>
                <th className="p-8 font-black text-[10px] uppercase tracking-[0.3em] text-white/20 text-right">Synchronization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBugs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-32 text-center relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                    <div className="relative z-10 space-y-6">
                      <Bug className="h-20 w-20 mx-auto text-white/[0.03]" />
                      <div>
                        <p className="text-2xl font-black text-premium uppercase tracking-tighter">Archive Matrix Clear</p>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-2">Zero technical anomalies detected in current sync</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBugs.map((bug) => (
                  <React.Fragment key={bug.id}>
                    <tr 
                      className={cn(
                        "hover:bg-white/[0.02] transition-all cursor-pointer group border-l-4 border-transparent",
                        expandedBug === bug.id && "bg-white/[0.04] border-primary"
                      )}
                      onClick={() => setExpandedBug(expandedBug === bug.id ? null : bug.id)}
                    >
                      <td className="p-8 text-center">
                        <div className={cn("transition-transform duration-500", expandedBug === bug.id ? "rotate-180" : "rotate-0")}>
                          <ChevronDown className={cn("h-5 w-5", expandedBug === bug.id ? "text-primary" : "text-white/10 group-hover:text-white/40")} />
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-black text-primary shadow-inner">
                            {bug.app?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="font-black text-xs text-white uppercase tracking-[0.1em]">{bug.app?.name || "UNIDENTIFIED NODE"}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className="font-bold text-xs text-white/70 group-hover:text-white transition-colors uppercase tracking-tight">{bug.title}</span>
                      </td>
                      <td className="p-8">
                        <Badge className={cn("text-[9px] font-black uppercase tracking-[0.2em] px-4 h-7 rounded-xl border", severityColors[bug.severity])}>
                          {bug.severity}
                        </Badge>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]", 
                            bug.status === 'resolved' ? 'bg-primary' : 
                            bug.status === 'in progress' ? 'bg-amber-400 animate-pulse' : 
                            bug.status === 'closed' ? 'bg-white/10' : 'bg-red-500'
                          )} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{bug.status.toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center justify-end gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(bug.created_at), "MMM d, yyyy")}
                        </span>
                      </td>
                    </tr>
                    {expandedBug === bug.id && (
                      <tr className="bg-white/[0.01]">
                        <td colSpan="6" className="p-0">
                          <div className="p-16 animate-in slide-in-from-top-8 duration-700 relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 h-96 w-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mb-48 pointer-events-none" />
                            
                            <div className="grid lg:grid-cols-2 gap-20 relative z-10">
                              <div className="space-y-12">
                                <section className="space-y-6">
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                                    <div className="w-1 h-1 rounded-full bg-primary" />
                                    MANIFESTATION LOG
                                  </h4>
                                  <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                                    <p className="text-sm font-medium text-white/60 leading-relaxed italic">"{bug.description}"</p>
                                  </div>
                                </section>
                                
                                {bug.steps && (
                                  <section className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-3">
                                      <Terminal className="h-4 w-4" /> REPRODUCTION PROTOCOL
                                    </h4>
                                    <div className="p-10 rounded-[2.5rem] bg-black/40 border border-white/5 text-[11px] font-mono text-white/30 leading-loose whitespace-pre-wrap shadow-inner">
                                      {bug.steps}
                                    </div>
                                  </section>
                                )}
                              </div>

                              <div className="space-y-12">
                                {bug.recordingUrl && (
                                  <section className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-3">
                                      <Video className="h-4 w-4" /> VISUAL INTELLIGENCE
                                    </h4>
                                    <div className="aspect-video bg-black rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] group/video">
                                      <video src={bug.recordingUrl} controls className="h-full w-full grayscale-[40%] group-hover/video:grayscale-0 transition-all duration-1000" />
                                    </div>
                                  </section>
                                )}

                                <section className="space-y-6">
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                                    <MessageSquare className="h-4 w-4" /> COMMAND CENTER INTEL
                                  </h4>
                                  <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 h-24 w-24 bg-primary/10 blur-3xl rounded-full" />
                                    <p className="text-xs font-bold text-white/40 italic leading-relaxed uppercase tracking-wider">
                                      {bug.internalNotes ? bug.internalNotes : "Intelligence synchronization in progress. Official resolution pending analysis."}
                                    </p>
                                  </div>
                                </section>

                                <div className="flex justify-end gap-6 pt-6">
                                  <Button variant="ghost" className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                                    ESTABLISH COMMS
                                  </Button>
                                  <Button variant="ghost" className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-red-500/30 hover:text-red-500 hover:bg-red-500/5 transition-all">
                                    TERMINATE REPORT
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Initialization Portal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white p-0 max-w-3xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_-20px_rgba(34,197,94,0.2)]">
          <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
          
          <DialogHeader className="p-12 border-b border-white/5 relative z-10">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_-10px_rgba(239,68,68,0.5)]">
                <Bug className="h-10 w-10 text-red-500" />
              </div>
              <div className="space-y-1">
                <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] font-black uppercase tracking-widest px-3 h-6">Initialization Protocol</Badge>
                <DialogTitle className="text-4xl font-black tracking-tighter uppercase leading-tight">Sync Anomaly</DialogTitle>
                <DialogDescription className="text-white/40 font-bold text-[10px] uppercase tracking-widest">Cross-platform technical vulnerability logging</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="p-12 space-y-10 relative z-10">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">RESEARCH NODE</Label>
                <Select 
                  value={formData.appSlug} 
                  onValueChange={(val) => setFormData({...formData, appSlug: val})}
                >
                  <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                    <SelectValue placeholder="CHOOSE TARGET" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-white/10 text-white rounded-2xl p-2">
                    {enrollments.map(e => (
                      <SelectItem key={e.app.id} value={e.app.slug} className="rounded-xl py-4 font-bold uppercase tracking-widest text-[10px]">{e.app.name.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">THREAT LEVEL</Label>
                <div className="flex p-2 bg-white/5 rounded-2xl border border-white/5 h-16 shadow-inner">
                  {['low', 'medium', 'high', 'critical'].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setFormData({...formData, severity: sev})}
                      className={cn(
                        "flex-1 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-500",
                        formData.severity === sev 
                          ? "bg-primary text-white shadow-[0_0_20px_-5px_rgba(34,197,94,0.8)] scale-105"
                          : "text-white/20 hover:text-white/40"
                      )}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">ANOMALY SUBJECT</Label>
              <Input 
                placeholder="CONCISE ARCHIVE IDENTIFIER" 
                className="h-16 bg-white/5 border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-white/60 focus-visible:ring-0 placeholder:text-white/10 px-8"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                onBlur={handleTitleBlur}
              />
              {similarBugs.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8 animate-in slide-in-from-top-8 shadow-2xl">
                  <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                    <Copy className="h-4 w-4" /> POTENTIAL ARCHIVE DUPLICATES DETECTED
                  </div>
                  <ul className="space-y-4">
                    {similarBugs.map(b => (
                      <li key={b.id} className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-3 group/item">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover/item:bg-primary transition-colors" />
                        {b.title} <span className="text-[8px] opacity-30">[{b.status.toUpperCase()}]</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">MANIFESTATION ARCHIVE</Label>
              <Textarea 
                placeholder="DETAILED TECHNICAL LOG OF THE ANOMALY..." 
                className="bg-white/5 border-white/10 rounded-[2rem] min-h-[160px] resize-none font-medium p-8 placeholder:text-white/10 focus:bg-white/[0.08] transition-all"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">REPRODUCTION PROTOCOL</Label>
              <Textarea 
                placeholder="1. INITIALIZE BINARY&#10;2. EXECUTE KERNEL TRIGGER..." 
                className="bg-white/5 border-white/10 rounded-[2rem] min-h-[120px] font-mono text-[11px] leading-loose p-8 placeholder:text-white/10 focus:bg-white/[0.08] transition-all"
                value={formData.steps}
                onChange={(e) => setFormData({...formData, steps: e.target.value})}
              />
            </div>

            <div className="space-y-6">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">VISUAL INTELLIGENCE</Label>
              <div className="space-y-6">
                {!videoUrl ? (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className={cn("w-full h-20 rounded-[1.5rem] border-2 border-dashed border-white/5 bg-white/[0.02] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 transition-all duration-700 hover:bg-white/5 hover:border-white/10", isRecording && "border-red-500 text-red-500 bg-red-500/5 animate-pulse")}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <><StopCircle className="h-6 w-6" /> TERMINATE INTELLIGENCE STREAM</>
                    ) : (
                      <><Video className="h-6 w-6 opacity-20" /> INITIALIZE SCREEN CAPTURE</>
                    )}
                  </Button>
                ) : (
                  <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group/prev">
                    <video src={videoUrl} controls className="h-full w-full grayscale-[40%]" />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute top-6 right-6 h-12 w-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/40 hover:text-red-500 transition-all opacity-0 group-hover/prev:opacity-100"
                      onClick={() => { setVideoBlob(null); setVideoUrl(null); }}
                    >
                      <XCircle className="h-6 w-6" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center justify-center gap-3 py-2">
                  <Zap className="h-3 w-3 text-primary animate-pulse" />
                  <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.3em]">VISUAL EVIDENCE ACCELERATES RESOLUTION BANDWIDTH BY 400%</p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-6 pt-6">
              <Button 
                type="submit" 
                className="w-full h-20 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_50px_-10px_rgba(34,197,94,0.6)] transition-all hover:scale-[1.02] active:scale-95"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Activity className="h-6 w-6 mr-4 animate-spin" />
                    SYNCHRONIZING ARCHIVE...
                  </>
                ) : (
                  <>
                    SYNCHRONIZE TO ARCHIVE
                    <ArrowRight className="h-6 w-6 ml-4" />
                  </>
                )}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all h-12">ABORT ARCHIVE ENTRY</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ArrowRight(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
