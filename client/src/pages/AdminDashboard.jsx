import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Download, Star, Eye, EyeOff, Pencil, Trash2, Plus, LogOut, Upload, Home, ArrowLeft, ArrowRight, X, Rocket, History, RotateCcw, MoreHorizontal, Beaker
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/services/api";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

const categories = ["Productivity", "Utility", "Games", "Education", "Health", "Finance", "Other"];

const emptyForm = {
  name: "", tagline: "", description: "", whatsNew: "", category: "Utility",
  tags: "", platform: "android", version: "1.0.0", minOSVersion: "",
};

export default function AdminDashboard() {
  const { isAuthenticated, loading: authLoading, logout, admin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [releaseForm, setReleaseForm] = useState({ version: "", whatsNew: "" });
  
  // Existing files
  const [existingScreenshots, setExistingScreenshots] = useState([]);
  
  // New uploads
  const [iconFile, setIconFile] = useState(null);
  const [screenshotFiles, setScreenshotFiles] = useState([]);
  const [appFile, setAppFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/admin/login", { replace: true });
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) fetchApps();
  }, [isAuthenticated]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const { data } = await api.getAdminApps();
      setApps(data);
    } catch { toast({ variant: "destructive", title: "Error", description: "Failed to load apps" }); }
    finally { setLoading(false); }
  };

  const uploadFile = async (file, folder) => {
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
    const { data, error } = await supabase.storage.from('uploads').upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setUploadProgress(10);

    try {
      let iconUrl = editingApp?.icon || "";
      let apkUrl = editingApp?.apkFile || editingApp?.apk_file || "";
      let videoUrl = editingApp?.video_url || "";
      let size = editingApp?.size || "0 MB";

      if (iconFile) {
        setUploadProgress(15);
        iconUrl = await uploadFile(iconFile, 'icons');
      }

      if (appFile) {
        setUploadProgress(40);
        apkUrl = await uploadFile(appFile, 'apps');
        size = `${(appFile.size / (1024 * 1024)).toFixed(1)} MB`;
      }

      if (videoFile) {
        setUploadProgress(60);
        videoUrl = await uploadFile(videoFile, 'videos');
      }

      let finalScreenshots = [...existingScreenshots];
      if (screenshotFiles.length > 0) {
        setUploadProgress(80);
        const newUrls = await Promise.all(screenshotFiles.map(f => uploadFile(f, 'screenshots')));
        finalScreenshots = [...finalScreenshots, ...newUrls];
      }

      setUploadProgress(95);

      const payload = {
        ...form,
        icon: iconUrl,
        screenshots: JSON.stringify(finalScreenshots),
        apkFile: apkUrl,
        videoUrl: videoUrl,
        size: size
      };

      if (editingApp) {
        await api.updateApp(editingApp._id, payload);
        toast({ title: "Updated", description: "App updated successfully" });
      } else {
        await api.createApp(payload);
        toast({ title: "Created", description: "App added to store" });
      }

      setUploadProgress(100);
      setDialogOpen(false);
      setIconFile(null);
      setScreenshotFiles([]);
      setAppFile(null);
      setVideoFile(null);
      fetchApps();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || "Upload failed. Check console." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseSubmit = async (e) => {
    e.preventDefault();
    if (!appFile) return toast({ variant: "destructive", title: "Missing File", description: "Please upload the new APK/IPA file." });

    setSubmitting(true);
    setUploadProgress(10);

    try {
      setUploadProgress(40);
      const apkUrl = await uploadFile(appFile, 'apps');
      const size = `${(appFile.size / (1024 * 1024)).toFixed(1)} MB`;

      setUploadProgress(80);
      
      const payload = {
        version: releaseForm.version,
        whatsNew: releaseForm.whatsNew,
        apkFile: apkUrl,
        size: size
      };

      await api.releaseAppUpdate(editingApp._id, payload);
      toast({ title: "Update Released! 🚀", description: `Version ${releaseForm.version} is now live.` });

      setUploadProgress(100);
      setReleaseDialogOpen(false);
      setAppFile(null);
      fetchApps();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || "Release failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRollback = async (historyIndex) => {
    if (!confirm("Are you sure you want to rollback to this version? The current buggy version will be archived.")) return;
    
    try {
      await api.rollbackAppUpdate(editingApp._id, historyIndex);
      toast({ title: "Rolled Back Successfully", description: "The app has been reverted to the older version." });
      setRollbackDialogOpen(false);
      fetchApps();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || "Rollback failed." });
    }
  };

  const openAdd = () => { 
    setEditingApp(null); 
    setForm(emptyForm); 
    setExistingScreenshots([]);
    setIconFile(null); setScreenshotFiles([]); setAppFile(null); setVideoFile(null); setUploadProgress(0); setDialogOpen(true); 
  };
  
  const openEdit = (app) => {
    setEditingApp(app);
    setForm({
      name: app.name,
      tagline: app.tagline,
      description: app.description,
      whatsNew: app.whatsNew || "",
      category: app.category,
      tags: (app.tags || []).join(", "),
      platform: app.platform,
      version: app.version,
      minOSVersion: app.minOSVersion || "",
    });
    setExistingScreenshots(app.screenshots || []);
    setIconFile(null); 
    setScreenshotFiles([]); 
    setAppFile(null); 
    setVideoFile(null); 
    setUploadProgress(0); 
    setDialogOpen(true);
  };

  const openRelease = (app) => {
    setEditingApp(app);
    // Suggest next minor version by default
    let nextVersion = app.version || "1.0.0";
    try {
      const parts = nextVersion.split('.');
      if (parts.length > 0 && !isNaN(parts[parts.length-1])) {
        parts[parts.length-1] = parseInt(parts[parts.length-1]) + 1;
        nextVersion = parts.join('.');
      }
    } catch (e) {}

    setReleaseForm({ version: nextVersion, whatsNew: "" });
    setAppFile(null);
    setUploadProgress(0);
    setReleaseDialogOpen(true);
  };

  const openRollback = (app) => {
    setEditingApp(app);
    setRollbackDialogOpen(true);
  };

  const moveScreenshot = (index, direction) => {
    const newSS = [...existingScreenshots];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newSS.length) return;
    [newSS[index], newSS[newIndex]] = [newSS[newIndex], newSS[index]];
    setExistingScreenshots(newSS);
  };

  const removeScreenshot = (index) => {
    setExistingScreenshots(existingScreenshots.filter((_, i) => i !== index));
  };

  const stats = useMemo(() => ({
    total: apps.length,
    downloads: apps.reduce((s, a) => s + (a.downloads || 0), 0),
    featured: apps.filter((a) => a.featured).length,
    published: apps.filter((a) => a.published).length,
    unpublished: apps.filter((a) => !a.published).length,
  }), [apps]);

  if (authLoading) return null;

  return (
    <div className="space-y-12 pb-20 selection:bg-primary/30">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 h-6 mb-2">Central Intelligence</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-premium uppercase leading-tight">Command Center</h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Platform-wide application orchestration & research management</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={openAdd}
            className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-[0_0_30px_-10px_rgba(1,135,95,0.5)] transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5 mr-2" /> Initialize App
          </Button>
          <Button 
            variant="ghost" 
            onClick={logout}
            className="h-14 px-6 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
          >
            <LogOut className="h-4 w-4 mr-2" /> Terminate Session
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[
          { label: "Active Deployments", value: stats.total, icon: Package, color: "text-primary", bg: "bg-primary/10" },
          { label: "Total Installs", value: stats.downloads, icon: Download, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Priority Builds", value: stats.featured, icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10" },
          { label: "Online Assets", value: stats.published, icon: Eye, color: "text-green-400", bg: "bg-green-400/10" },
          { label: "Offline Assets", value: stats.unpublished, icon: EyeOff, color: "text-red-400", bg: "bg-red-400/10" }
        ].map((s) => (
          <div key={s.label} className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md group hover:bg-white/[0.08] transition-all duration-500">
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", s.bg)}>
              <s.icon className={cn("h-6 w-6", s.color)} />
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tighter">{s.value}</p>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black tracking-tighter text-premium uppercase flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(1,135,95,0.5)]" />
            Registry
          </h2>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 w-full rounded-[2rem] bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="rounded-[2.5rem] border border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
            <Table>
              <TableHeader className="bg-white/[0.02] border-b border-white/5">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-white/20 font-black uppercase tracking-[0.2em] text-[10px] pl-8 h-16">Application</TableHead>
                  <TableHead className="hidden sm:table-cell text-white/20 font-black uppercase tracking-[0.2em] text-[10px] h-16">Department</TableHead>
                  <TableHead className="text-white/20 font-black uppercase tracking-[0.2em] text-[10px] h-16">Status</TableHead>
                  <TableHead className="text-right text-white/20 font-black uppercase tracking-[0.2em] text-[10px] pr-8 h-16">Directives</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((app) => (
                  <TableRow key={app._id} className="group hover:bg-white/[0.02] border-white/5 transition-all">
                    <TableCell className="py-6 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-white/10 shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:border-primary/50">
                          <img src={api.getFileUrl(app.icon)} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-sm text-white tracking-tight">{app.name}</span>
                          <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Build v{app.version}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className="bg-white/5 border-white/10 text-white/40 font-black uppercase tracking-widest text-[9px] px-3 h-6">
                        {app.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {app.published ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest shadow-[0_0_20px_-5px_rgba(1,135,95,0.3)]">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(1,135,95,1)]" />
                            Live
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-white/20 border border-white/10 text-[9px] font-black uppercase tracking-widest">
                            <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                            Draft
                          </div>
                        )}
                        {app.featured && (
                          <div className="h-7 w-7 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-[0_0_15px_-5px_rgba(234,179,8,0.3)]">
                            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex items-center justify-end gap-3">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openRelease(app)} 
                          className="h-11 w-11 rounded-2xl text-blue-400 hover:bg-blue-400/10 hover:text-blue-300 transition-all active:scale-90 border border-transparent hover:border-blue-400/20"
                          title="Deploy Update"
                        >
                          <Rocket className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openRollback(app)} 
                          className="h-11 w-11 rounded-2xl text-orange-400 hover:bg-orange-400/10 hover:text-orange-300 transition-all active:scale-90 border border-transparent hover:border-orange-400/20"
                          title="Archive Logs"
                        >
                          <History className="h-5 w-5" />
                        </Button>
                        
                        <div className="w-[1px] h-6 bg-white/10 mx-1" />

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-white/20 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64 bg-[#0f0f0f] border-white/10 text-white p-2 rounded-2xl shadow-2xl backdrop-blur-xl">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 px-3 py-2">Operational Parameters</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5 mx-2" />
                            <DropdownMenuItem onClick={() => api.togglePublish(app._id).then(fetchApps)} className="rounded-xl cursor-pointer py-3 hover:bg-white/5 transition-colors focus:bg-white/5">
                              {app.published ? <><EyeOff className="mr-3 h-4 w-4 text-red-400" /> Offline Mode</> : <><Eye className="mr-3 h-4 w-4 text-primary" /> Synchronize Online</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => api.toggleFeatured(app._id).then(fetchApps)} className="rounded-xl cursor-pointer py-3 hover:bg-white/5 transition-colors focus:bg-white/5">
                              <Star className={cn("mr-3 h-4 w-4", app.featured ? "fill-yellow-500 text-yellow-500" : "text-white/20")} /> 
                              {app.featured ? "De-prioritize Build" : "Priority Deployment"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => api.toggleAbTesting(app._id).then(fetchApps)} className="rounded-xl cursor-pointer py-3 hover:bg-white/5 transition-colors focus:bg-white/5">
                              <Beaker className={cn("mr-3 h-4 w-4", app.abTestingEnabled ? "text-purple-400 fill-purple-400/20" : "text-white/20")} /> 
                              {app.abTestingEnabled ? "Terminate Research" : "Initialize Research"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5 mx-2" />
                            <DropdownMenuItem onClick={() => openEdit(app)} className="rounded-xl cursor-pointer py-3 hover:bg-white/5 transition-colors focus:bg-white/5">
                              <Pencil className="mr-3 h-4 w-4 text-white/40" /> Adjust Parameters
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => api.deleteApp(app._id).then(fetchApps)} className="rounded-xl text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer py-3">
                              <Trash2 className="mr-3 h-4 w-4" /> Purge Records
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Initialize/Edit Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white p-0 max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col h-[90vh]">
          <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
          <DialogHeader className="p-10 border-b border-white/5 relative z-10 shrink-0">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-6">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-tight">{editingApp ? "Parameter Adjustment" : "Project Initialization"}</DialogTitle>
            <DialogDescription className="text-white/40 font-medium pt-2">
              {editingApp ? "Update the core parameters of your existing deployment." : "Define the technical specifications for your new research subject."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
            <form onSubmit={handleSubmit} id="admin-form" className="space-y-12">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Subject Designation</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold placeholder:text-white/10" placeholder="e.g. Project Orion" required />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Mission Tagline</Label>
                  <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold placeholder:text-white/10" placeholder="Brief operational summary" required />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Technical Dossier</Label>
                <Textarea rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-white/5 border-white/10 rounded-2xl font-medium resize-none placeholder:text-white/10" placeholder="Full technical description..." required />
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Classification</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0f0f0f] border-white/10 text-white">{categories.map((c) => <SelectItem key={c} value={c} className="font-bold">{c.toUpperCase()}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Meta Tags</Label>
                  <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold placeholder:text-white/10" placeholder="research, security, etc." />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Environment Compatibility</Label>
                <RadioGroup value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })} className="flex gap-10 bg-white/5 p-6 rounded-2xl border border-white/5">
                  {["android", "ios", "both"].map(p => (
                    <div key={p} className="flex items-center gap-3">
                      <RadioGroupItem value={p} id={`p-${p}`} className="border-white/20 data-[state=checked]:bg-primary" />
                      <Label htmlFor={`p-${p}`} className="capitalize cursor-pointer font-black text-xs text-white/60 tracking-wider uppercase">{p}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Baseline Revision</Label>
                  <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold placeholder:text-white/10" placeholder="1.0.0" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Min Kernel Specification</Label>
                  <Input value={form.minOSVersion} onChange={(e) => setForm({ ...form, minOSVersion: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold placeholder:text-white/10" placeholder="Android 13+" />
                </div>
              </div>

              <div className="w-full h-[1px] bg-white/5" />
              
              {/* Media Archive Management */}
              {existingScreenshots.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Media Archive Assets</Label>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase">{existingScreenshots.length} UNITS</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {existingScreenshots.map((url, i) => (
                      <div key={url} className="relative aspect-[9/16] group rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:border-primary/30">
                        <img src={api.getFileUrl(url)} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                          <div className="flex gap-2">
                            <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-primary hover:text-white" onClick={() => moveScreenshot(i, -1)} disabled={i === 0}><ArrowLeft className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-primary hover:text-white" onClick={() => moveScreenshot(i, 1)} disabled={i === existingScreenshots.length - 1}><ArrowRight className="h-4 w-4" /></Button>
                          </div>
                          <Button type="button" size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white" onClick={() => removeScreenshot(i)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-black/60 border border-white/10 text-[9px] font-black text-white tracking-widest backdrop-blur-md">U-{i + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Identify Interface (Icon)</Label>
                  <div className="relative">
                    <Input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0])} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold file:bg-primary file:text-white file:border-none file:rounded-lg file:px-4 file:h-8 file:mr-4 file:text-[10px] file:font-black file:uppercase file:tracking-widest cursor-pointer" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Visual Evidence (Screenshots)</Label>
                  <Input type="file" accept="image/*" multiple onChange={(e) => setScreenshotFiles(Array.from(e.target.files || []))} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold file:bg-primary file:text-white file:border-none file:rounded-lg file:px-4 file:h-8 file:mr-4 file:text-[10px] file:font-black file:uppercase file:tracking-widest cursor-pointer" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Operational Loop (MP4)</Label>
                  <Input type="file" accept="video/mp4,video/*" onChange={(e) => setVideoFile(e.target.files?.[0])} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold file:bg-primary file:text-white file:border-none file:rounded-lg file:px-4 file:h-8 file:mr-4 file:text-[10px] file:font-black file:uppercase file:tracking-widest cursor-pointer" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Executable Binary (.APK/.IPA)</Label>
                  <Input type="file" accept=".apk,.ipa" onChange={(e) => setAppFile(e.target.files?.[0])} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold file:bg-primary file:text-white file:border-none file:rounded-lg file:px-4 file:h-8 file:mr-4 file:text-[10px] file:font-black file:uppercase file:tracking-widest cursor-pointer" />
                </div>
              </div>

              {submitting && (
                <div className="space-y-4 pt-4 bg-white/5 p-8 rounded-[2rem] border border-white/5 animate-in fade-in zoom-in duration-500">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Transmission Pipeline</span>
                    <span className="text-[10px] font-black text-white/60">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-3 bg-white/5 overflow-hidden rounded-full [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-primary/50 shadow-[0_0_15px_-5px_rgba(1,135,95,0.5)]" />
                  <p className="text-[10px] text-center font-black uppercase tracking-[0.2em] text-white/20 animate-pulse mt-4">Transmitting assets to secure storage node...</p>
                </div>
              )}
            </form>
          </div>

          <DialogFooter className="p-10 border-t border-white/5 bg-black/40 relative z-10 shrink-0 flex gap-4">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="h-14 px-8 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] flex-1">Abort Mission</Button>
            <Button type="submit" form="admin-form" disabled={submitting} className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-[0_0_30px_-10px_rgba(1,135,95,0.5)] transition-all hover:scale-[1.02] flex-[2]"><Upload className="h-5 w-5 mr-3" />{submitting ? "Transmitting..." : "Finalize Deployment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deploy Update Dialog */}
      <Dialog open={releaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white p-10 max-w-lg rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 h-64 w-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          <DialogHeader className="relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6">
              <Rocket className="h-8 w-8 text-blue-400" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-tight">Deploy Revision</DialogTitle>
            <DialogDescription className="text-white/40 font-medium pt-2 text-sm leading-relaxed">
              Initialize a new build cycle for <strong className="text-white font-black">{editingApp?.name}</strong>. Previous versions will be archived in the technical repository.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReleaseSubmit} id="release-form" className="space-y-8 pt-10 relative z-10">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">New Build Identifier</Label>
              <Input value={releaseForm.version} onChange={(e) => setReleaseForm({ ...releaseForm, version: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold placeholder:text-white/10" placeholder="e.g. 1.0.1" required />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Technical Release Logs</Label>
              <Textarea rows={4} value={releaseForm.whatsNew} onChange={(e) => setReleaseForm({ ...releaseForm, whatsNew: e.target.value })} className="bg-white/5 border-white/10 rounded-2xl font-medium resize-none placeholder:text-white/10" placeholder="Describe the architectural improvements..." required />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Target Binary Payload (.APK/.IPA)</Label>
              <Input type="file" accept=".apk,.ipa" onChange={(e) => setAppFile(e.target.files?.[0])} className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold file:bg-blue-500 file:text-white file:border-none file:rounded-lg file:px-4 file:h-8 file:mr-4 file:text-[10px] file:font-black file:uppercase file:tracking-widest cursor-pointer" required />
            </div>
            {submitting && (
              <div className="space-y-4 pt-2 bg-white/5 p-6 rounded-2xl border border-white/5">
                <Progress value={uploadProgress} className="h-2 bg-white/5 overflow-hidden rounded-full [&>div]:bg-blue-500" />
                <p className="text-[9px] text-center font-black uppercase tracking-widest text-blue-400/60 animate-pulse">{uploadProgress}% - Synchronizing Build Payload...</p>
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-col gap-4 pt-4">
              <Button type="submit" form="release-form" disabled={submitting} className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-[0_0_30px_-10px_rgba(37,99,235,0.5)] transition-all hover:scale-[1.02]">
                <Rocket className="h-5 w-5 mr-3" />
                {submitting ? "Deploying..." : "Finalize Deployment"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setReleaseDialogOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Abort Cycle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Archive Management (Rollback) Modal */}
      <Dialog open={rollbackDialogOpen} onOpenChange={setRollbackDialogOpen}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white p-0 max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
          <div className="absolute top-0 right-0 h-64 w-64 bg-orange-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          <DialogHeader className="p-10 border-b border-white/5 relative z-10 shrink-0">
            <div className="h-16 w-16 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 mb-6">
              <History className="h-8 w-8 text-orange-400" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-tight">Archive Management</DialogTitle>
            <DialogDescription className="text-white/40 font-medium pt-2 text-sm leading-relaxed">
              Navigate the technical evolution of <strong className="text-white font-black">{editingApp?.name}</strong>. Revert state to previous stable revisions if necessary.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 p-10 relative z-10 custom-scrollbar">
            <div className="space-y-12">
              {/* Active Build */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(1,135,95,1)]" />
                  Active Operational Revision
                </h4>
                <div className="p-8 border border-primary/20 bg-primary/5 rounded-[2rem] shadow-[0_0_40px_-15px_rgba(1,135,95,0.3)] backdrop-blur-md">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-black text-3xl text-white tracking-tighter">BUILD v{editingApp?.version}</span>
                    <Badge className="bg-primary text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 h-6">STABLE ACTIVE</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Deployment Sync</p>
                      <p className="text-xs font-bold text-white/60">{editingApp?.updatedAt ? new Date(editingApp.updatedAt).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Payload Size</p>
                      <p className="text-xs font-bold text-white/60">{editingApp?.size || "N/A"}</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-primary/10">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Technical Logs</p>
                    <p className="text-xs font-medium text-white/40 leading-relaxed italic line-clamp-3">"{editingApp?.whatsNew || "No release logs recorded for this revision."}"</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* Revision History */}
              <div className="space-y-6 pb-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Legacy Records Archive</h4>
                {(!editingApp?.versionHistory || editingApp.versionHistory.length === 0) ? (
                  <div className="p-12 rounded-[2rem] border border-white/5 bg-white/[0.02] text-center">
                    <RotateCcw className="h-8 w-8 text-white/10 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">No legacy revisions available in local archive.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {editingApp.versionHistory.map((hist, idx) => (
                      <div key={idx} className="p-6 border border-white/5 bg-white/[0.02] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white/5 transition-all group">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-black text-sm text-white/80 group-hover:text-white transition-colors">REV v{hist.version}</span>
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">SYNC: {new Date(hist.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] font-medium text-white/30 italic line-clamp-1 group-hover:text-white/40 transition-colors">"{hist.whatsNew || "No technical logs"}"</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-11 px-5 rounded-xl text-orange-400 bg-orange-400/5 hover:bg-orange-500 hover:text-white transition-all font-black uppercase tracking-widest text-[9px] border border-orange-400/20 active:scale-95"
                          onClick={() => handleRollback(idx)}
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-2" />
                          Initialize Rollback
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
