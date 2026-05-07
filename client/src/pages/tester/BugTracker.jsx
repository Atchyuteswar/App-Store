import React, { useState, useEffect } from "react";
import { getTesterEnrollments, getTesterBugs, addTesterBug } from "@/services/api";
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
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSimilarBugs } from "@/services/api";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const severityColors = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse",
};

const statusIcons = {
  open: <AlertCircle className="h-3 w-3" />,
  "in progress": <Clock className="h-3 w-3" />,
  resolved: <CheckCircle2 className="h-3 w-3" />,
  closed: <XCircle className="h-3 w-3" />,
};

export default function BugTracker() {
  const [enrollments, setEnrollments] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedBug, setExpandedBug] = useState(null);
  const { toast } = useToast();

  // Filters
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
  
  // Screen Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  // Duplicate Check State
  const [similarBugs, setSimilarBugs] = useState([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: enrolls } = await getTesterEnrollments();
      setEnrollments(enrolls || []);
      
      // Fetch bugs for the first app by default or all if possible
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

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      setRecordedChunks([]);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      toast({ title: "Recording Error", description: "Could not start screen recording.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.appSlug || !formData.title || !formData.description) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let recordingUrl = null;
      if (videoBlob) {
        // Upload logic would go here, assuming addTesterBug handles multipart or we send as field
        // For now, we'll assume the API can handle a FormData object
        const finalData = new FormData();
        finalData.append('title', formData.title);
        finalData.append('description', formData.description);
        finalData.append('severity', formData.severity);
        finalData.append('steps', formData.steps);
        if (videoBlob) finalData.append('recording', videoBlob, 'recording.webm');
        
        await addTesterBug(formData.appSlug, finalData);
      } else {
        await addTesterBug(formData.appSlug, {
          title: formData.title,
          description: formData.description,
          severity: formData.severity,
          steps: formData.steps,
        });
      }
      
      toast({ title: "Bug Reported", description: "Thank you! Our team will investigate this." });
      setIsModalOpen(false);
      resetForm();
      fetchAllBugs(enrollments);
    } catch (err) {
      toast({ title: "Error", description: "Failed to submit bug report.", variant: "destructive" });
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bug Reports</h1>
          <p className="text-muted-foreground">Track and report issues across your enrolled applications.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 shadow-lg gap-2"
        >
          <Plus className="h-4 w-4" /> Report a Bug
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-widest mr-2">
            <Filter className="h-4 w-4" /> Filters
          </div>
          
          <Select value={filterApp} onValueChange={setFilterApp}>
            <SelectTrigger className="w-[180px] h-9 bg-background">
              <SelectValue placeholder="All Apps" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Apps</SelectItem>
              {enrollments.map(e => (
                <SelectItem key={e.app.id} value={e.app.slug}>{e.app.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-[140px] h-9 bg-background">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Severity</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-9 bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {(filterApp !== "all" || filterSeverity !== "all" || filterStatus !== "all") && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterApp("all"); setFilterSeverity("all"); setFilterStatus("all"); }}>
              Reset
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Bug List */}
      <Card className="border-none shadow-xl overflow-hidden bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-4 text-left font-bold w-10"></th>
                <th className="p-4 text-left font-bold">Application</th>
                <th className="p-4 text-left font-bold">Title</th>
                <th className="p-4 text-left font-bold">Severity</th>
                <th className="p-4 text-left font-bold">Status</th>
                <th className="p-4 text-right font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredBugs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-muted-foreground">
                    <Bug className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-medium">No bug reports found</p>
                    <p className="text-sm">Try adjusting your filters or report a new bug.</p>
                  </td>
                </tr>
              ) : (
                filteredBugs.map((bug) => (
                  <React.Fragment key={bug.id}>
                    <tr 
                      className={cn(
                        "hover:bg-muted/30 transition-colors cursor-pointer group",
                        expandedBug === bug.id && "bg-muted/40"
                      )}
                      onClick={() => setExpandedBug(expandedBug === bug.id ? null : bug.id)}
                    >
                      <td className="p-4">
                        {expandedBug === bug.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </td>
                      <td className="p-4 font-bold text-primary flex items-center gap-2">
                        <Package className="h-3.5 w-3.5" />
                        {bug.app?.name || "Unknown App"}
                      </td>
                      <td className="p-4 font-medium max-w-xs truncate">{bug.title}</td>
                      <td className="p-4">
                        <Badge className={cn("text-[10px] uppercase font-bold", severityColors[bug.severity])}>
                          {bug.severity}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold flex items-center gap-1.5 w-fit">
                          {statusIcons[bug.status]}
                          {bug.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right text-muted-foreground whitespace-nowrap">
                        {format(new Date(bug.created_at), "MMM d, yyyy")}
                      </td>
                    </tr>
                    {expandedBug === bug.id && (
                      <tr className="bg-muted/20 animate-in slide-in-from-top-2 duration-200">
                        <td colSpan="6" className="p-6 border-b">
                          <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Description</h4>
                                <p className="text-sm leading-relaxed">{bug.description}</p>
                              </div>
                              {bug.steps && (
                                <div>
                                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Steps to Reproduce</h4>
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap italic opacity-80">{bug.steps}</p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-4">
                              {bug.recordingUrl && (
                                <div>
                                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Recording</h4>
                                  <div className="aspect-video bg-black rounded-lg overflow-hidden border">
                                    <video src={bug.recordingUrl} controls className="h-full w-full" />
                                  </div>
                                </div>
                              )}
                              <div className="p-4 rounded-xl border bg-card/50">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <MessageSquare className="h-3 w-3" /> Admin Response
                                </h4>
                                <p className="text-sm text-muted-foreground italic">
                                  {bug.internalNotes ? bug.internalNotes : "No response from the developer team yet."}
                                </p>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" className="h-8 text-xs">
                                  Send Message
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500">
                                  Withdraw Report
                                </Button>
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
      </Card>

      {/* Report Bug Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Bug className="h-6 w-6 text-red-500" />
              Report a New Bug
            </DialogTitle>
            <DialogDescription>
              Provide as much detail as possible to help developers fix this issue quickly.
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
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Severity *</label>
                <div className="flex p-1 bg-muted/30 rounded-lg">
                  {['low', 'medium', 'high', 'critical'].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setFormData({...formData, severity: sev})}
                      className={cn(
                        "flex-1 py-1 text-[10px] font-bold uppercase rounded-md transition-all",
                        formData.severity === sev 
                          ? (sev === 'critical' ? "bg-red-500 text-white" : "bg-white dark:bg-zinc-800 shadow-sm text-primary")
                          : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bug Title *</label>
              <Input 
                placeholder="e.g. App crashes when opening profile" 
                className="bg-muted/30"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                onBlur={handleTitleBlur}
              />
              {similarBugs.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-bold mb-2">
                    <Copy className="h-3 w-3" /> Similar bugs already reported:
                  </div>
                  <ul className="space-y-1">
                    {similarBugs.map(b => (
                      <li key={b.id} className="text-[10px] text-amber-700 flex items-center gap-1">
                        <div className="h-1 w-1 rounded-full bg-amber-400" />
                        {b.title} ({b.status})
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-amber-600 mt-2 italic">Please check if your bug is unique before submitting.</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description *</label>
              <Textarea 
                placeholder="Describe what happened..." 
                className="bg-muted/30 min-h-[100px] resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Steps to Reproduce</label>
              <Textarea 
                placeholder="1. Open the app&#10;2. Click on..." 
                className="bg-muted/30 min-h-[80px] font-mono text-xs"
                value={formData.steps}
                onChange={(e) => setFormData({...formData, steps: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Screen Recording (Evidence)</label>
              <div className="flex flex-col gap-3">
                {!videoUrl ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className={cn("w-full h-12 border-dashed flex items-center gap-2", isRecording && "border-red-500 text-red-500 animate-pulse")}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <><StopCircle className="h-5 w-5" /> Stop Recording</>
                    ) : (
                      <><Video className="h-5 w-5" /> Start Screen Recording</>
                    )}
                  </Button>
                ) : (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden border">
                    <video src={videoUrl} controls className="h-full w-full" />
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={() => { setVideoBlob(null); setVideoUrl(null); }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground italic text-center">
                  Visual evidence helps our developers fix bugs 10x faster.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 min-w-[120px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Bug"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


