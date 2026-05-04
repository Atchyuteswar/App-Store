import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Download, Star, Eye, EyeOff, Pencil, Trash2, Plus, LogOut, Upload, Home, ArrowLeft, ArrowRight, X, Rocket, History, RotateCcw, MoreHorizontal
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/services/api";
import { supabase } from "@/lib/supabaseClient";

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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="font-bold text-lg">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{admin?.email}</span>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}><Home className="h-4 w-4 mr-1" />Store</Button>
            <Button variant="outline" size="sm" onClick={async () => { await logout(); navigate("/admin/login"); }}><LogOut className="h-4 w-4 mr-1" />Logout</Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Apps", value: stats.total, icon: Package },
            { label: "Downloads", value: stats.downloads, icon: Download },
            { label: "Featured", value: stats.featured, icon: Star },
            { label: "Published", value: stats.published, icon: Eye },
            { label: "Unpublished", value: stats.unpublished, icon: EyeOff },
          ].map((s) => (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted"><s.icon className="h-5 w-5 text-muted-foreground" /></div>
              <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Apps</h2>
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add New App</Button>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : (
          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader><TableRow><TableHead>App</TableHead><TableHead className="hidden sm:table-cell">Category</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {apps.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell><div className="flex items-center gap-3"><img src={api.getFileUrl(app.icon)} alt="" className="h-10 w-10 rounded-lg object-cover bg-muted shrink-0" /><span className="font-medium max-w-[120px] sm:max-w-none truncate">{app.name}</span></div></TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge variant="secondary">{app.category}</Badge></TableCell>
                    <TableCell><div className="flex gap-1">{app.published ? <Badge>Live</Badge> : <Badge variant="outline">Draft</Badge>}{app.featured && <Badge variant="secondary">★</Badge>}</div></TableCell>
                    <TableCell className="text-right">
                      {/* Desktop Actions */}
                      <div className="hidden sm:flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Publish Update" onClick={() => openRelease(app)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"><Rocket className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title="Manage Versions" onClick={() => openRollback(app)} className="text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"><History className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title="Toggle Visibility" onClick={() => api.togglePublish(app._id).then(fetchApps)}>{app.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                        <Button variant="ghost" size="icon" title="Toggle Featured" onClick={() => api.toggleFeatured(app._id).then(fetchApps)}><Star className={`h-4 w-4 ${app.featured ? "fill-yellow-500 text-yellow-500" : ""}`} /></Button>
                        <Button variant="ghost" size="icon" title="Edit App Details" onClick={() => openEdit(app)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" title="Delete App" className="text-destructive" onClick={() => api.deleteApp(app._id).then(fetchApps)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      {/* Mobile Actions Dropdown */}
                      <div className="sm:hidden flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openRelease(app)}><Rocket className="mr-2 h-4 w-4 text-blue-500" /> Publish Update</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openRollback(app)}><History className="mr-2 h-4 w-4 text-orange-500" /> Manage Versions</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => api.togglePublish(app._id).then(fetchApps)}>{app.published ? <><EyeOff className="mr-2 h-4 w-4" /> Unpublish</> : <><Eye className="mr-2 h-4 w-4" /> Publish</>}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => api.toggleFeatured(app._id).then(fetchApps)}><Star className={`mr-2 h-4 w-4 ${app.featured ? "fill-yellow-500 text-yellow-500" : ""}`} /> {app.featured ? "Unfeature" : "Feature"}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEdit(app)}><Pencil className="mr-2 h-4 w-4" /> Edit Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => api.deleteApp(app._id).then(fetchApps)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete App</DropdownMenuItem>
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
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[800px] w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 border-b bg-card shrink-0">
            <DialogTitle className="text-xl font-bold">{editingApp ? "Edit App" : "Add New App"}</DialogTitle>
            <DialogDescription>{editingApp ? "Update your app's information and files." : "Enter the details for your new application."}</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form onSubmit={handleSubmit} id="admin-form" className="space-y-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-sm font-semibold">App Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. My Awesome App" required /></div>
                <div className="space-y-2"><Label className="text-sm font-semibold">Tagline *</Label><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Short catchy description" required /></div>
              </div>

              <div className="space-y-2"><Label className="text-sm font-semibold">Description *</Label><Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
              <div className="space-y-2"><Label className="text-sm font-semibold">What's New</Label><Textarea rows={3} value={form.whatsNew} onChange={(e) => setForm({ ...form, whatsNew: e.target.value })} placeholder="Release notes..." /></div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Category *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-sm font-semibold">Tags</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="fitness, tools, etc." /></div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Platform *</Label>
                <RadioGroup value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })} className="flex gap-6">
                  {["android", "ios", "both"].map(p => <div key={p} className="flex items-center gap-2"><RadioGroupItem value={p} id={`p-${p}`} /><Label htmlFor={`p-${p}`} className="capitalize cursor-pointer">{p}</Label></div>)}
                </RadioGroup>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-sm font-semibold">Version</Label><Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></div>
                <div className="space-y-2"><Label className="text-sm font-semibold">Min OS</Label><Input value={form.minOSVersion} onChange={(e) => setForm({ ...form, minOSVersion: e.target.value })} /></div>
              </div>

              <Separator />
              
              {/* Screenshot Manager */}
              {existingScreenshots.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><Label className="text-sm font-semibold">Manage Screenshots</Label><Badge variant="outline">{existingScreenshots.length} images</Badge></div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {existingScreenshots.map((url, i) => (
                      <div key={url} className="relative aspect-[9/16] group rounded-lg overflow-hidden border bg-muted">
                        <img src={api.getFileUrl(url)} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <div className="flex gap-1">
                            <Button type="button" size="icon" variant="secondary" className="h-7 w-7" onClick={() => moveScreenshot(i, -1)} disabled={i === 0}><ArrowLeft className="h-3 w-3" /></Button>
                            <Button type="button" size="icon" variant="secondary" className="h-7 w-7" onClick={() => moveScreenshot(i, 1)} disabled={i === existingScreenshots.length - 1}><ArrowRight className="h-3 w-3" /></Button>
                          </div>
                          <Button type="button" size="icon" variant="destructive" className="h-7 w-7" onClick={() => removeScreenshot(i)}><X className="h-3 w-3" /></Button>
                        </div>
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-[10px] text-white">{i + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-sm font-semibold">Icon</Label><Input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0])} /></div>
                <div className="space-y-2"><Label className="text-sm font-semibold">Additional Screenshots</Label><Input type="file" accept="image/*" multiple onChange={(e) => setScreenshotFiles(Array.from(e.target.files || []))} /></div>
                <div className="space-y-2"><Label className="text-sm font-semibold">Video Preview (MP4)</Label><Input type="file" accept="video/mp4,video/*" onChange={(e) => setVideoFile(e.target.files?.[0])} /></div>
                <div className="space-y-2"><Label className="text-sm font-semibold">App File (.apk/.ipa)</Label><Input type="file" accept=".apk,.ipa" onChange={(e) => setAppFile(e.target.files?.[0])} /></div>
              </div>

              {submitting && <div className="space-y-3 pt-2"><Progress value={uploadProgress} className="h-2" /><p className="text-xs text-center font-medium animate-pulse">{uploadProgress}% - Uploading Assets...</p></div>}
            </form>
          </div>

          <DialogFooter className="p-6 border-t bg-card shrink-0 flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" form="admin-form" disabled={submitting} className="min-w-[120px]"><Upload className="h-4 w-4 mr-2" />{submitting ? "Saving..." : "Save App"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Update Dialog */}
      <Dialog open={releaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Rocket className="h-5 w-5 text-blue-500" /> Release Update</DialogTitle>
            <DialogDescription>
              Publish a new version for <strong className="text-foreground">{editingApp?.name}</strong>. Previous versions will be archived in the version history.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReleaseSubmit} id="release-form" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Version Number *</Label>
              <Input value={releaseForm.version} onChange={(e) => setReleaseForm({ ...releaseForm, version: e.target.value })} placeholder="e.g. 1.0.1" required />
            </div>
            <div className="space-y-2">
              <Label>Release Notes (What's New) *</Label>
              <Textarea rows={4} value={releaseForm.whatsNew} onChange={(e) => setReleaseForm({ ...releaseForm, whatsNew: e.target.value })} placeholder="Describe what's changed in this update..." required />
            </div>
            <div className="space-y-2">
              <Label>New App File (.apk/.ipa) *</Label>
              <Input type="file" accept=".apk,.ipa" onChange={(e) => setAppFile(e.target.files?.[0])} required />
            </div>
            {submitting && (
              <div className="space-y-2 pt-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-center font-medium animate-pulse">{uploadProgress}% - Uploading Update...</p>
              </div>
            )}
          </form>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setReleaseDialogOpen(false)}>Cancel</Button>
            <Button type="submit" form="release-form" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Rocket className="h-4 w-4 mr-2" />
              {submitting ? "Publishing..." : "Publish Release"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Versions (Rollback) Dialog */}
      <Dialog open={rollbackDialogOpen} onOpenChange={setRollbackDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2"><History className="h-5 w-5 text-orange-500" /> Manage Versions</DialogTitle>
            <DialogDescription>
              View past releases for <strong className="text-foreground">{editingApp?.name}</strong>. You can rollback to an older version if the current one has issues.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Current Version */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Current Live Version</h4>
                <div className="p-4 border border-green-500/30 bg-green-500/5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">v{editingApp?.version}</span>
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1"><strong>Released:</strong> {editingApp?.updatedAt ? new Date(editingApp.updatedAt).toLocaleDateString() : 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2"><strong>Notes:</strong> {editingApp?.whatsNew || "No release notes"}</p>
                </div>
              </div>

              <Separator />

              {/* History */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Version History</h4>
                {(!editingApp?.versionHistory || editingApp.versionHistory.length === 0) ? (
                  <p className="text-sm text-muted-foreground text-center py-4 italic">No previous versions found.</p>
                ) : (
                  <div className="space-y-3">
                    {editingApp.versionHistory.map((hist, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold">v{hist.version}</span>
                            <span className="text-xs text-muted-foreground">({new Date(hist.date).toLocaleDateString()})</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{hist.whatsNew || "No release notes"}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="shrink-0 text-orange-500 border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/50"
                          onClick={() => handleRollback(idx)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Rollback
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
