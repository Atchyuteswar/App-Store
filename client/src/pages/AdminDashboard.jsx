import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Download, Star, Eye, EyeOff, Pencil, Trash2, Plus, LogOut, Upload, Home, ArrowLeft, ArrowRight, X,
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
  const [editingApp, setEditingApp] = useState(null);
  const [form, setForm] = useState(emptyForm);
  
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
      fetchApps();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || "Upload failed. Check console." });
    } finally {
      setSubmitting(false);
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
      name: app.name, tagline: app.tagline, description: app.description,
      whatsNew: app.whats_new || "", category: app.category, tags: (app.tags || []).join(", "),
      platform: app.platform, version: app.version, minOSVersion: app.min_os_version || "",
    });
    setExistingScreenshots(app.screenshots || []);
    setIconFile(null); setScreenshotFiles([]); setAppFile(null); setVideoFile(null); setUploadProgress(0); setDialogOpen(true);
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
          <div className="border rounded-lg bg-card overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead>App</TableHead><TableHead className="hidden sm:table-cell">Category</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {apps.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell><div className="flex items-center gap-3"><img src={api.getFileUrl(app.icon)} alt="" className="h-10 w-10 rounded-lg object-cover bg-muted" /><span className="font-medium">{app.name}</span></div></TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge variant="secondary">{app.category}</Badge></TableCell>
                    <TableCell><div className="flex gap-1">{app.published ? <Badge>Live</Badge> : <Badge variant="outline">Draft</Badge>}{app.featured && <Badge variant="secondary">★</Badge>}</div></TableCell>
                    <TableCell className="text-right"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => api.togglePublish(app._id).then(fetchApps)}>{app.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><Button variant="ghost" size="icon" onClick={() => api.toggleFeatured(app._id).then(fetchApps)}><Star className={`h-4 w-4 ${app.featured ? "fill-yellow-500 text-yellow-500" : ""}`} /></Button><Button variant="ghost" size="icon" onClick={() => openEdit(app)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={() => api.deleteApp(app._id).then(fetchApps)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{editingApp ? "Edit App" : "Add New App"}</DialogTitle>
            <DialogDescription>{editingApp ? "Update your app's information and files." : "Enter the details for your new application."}</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 px-6">
            <form onSubmit={handleSubmit} id="admin-form" className="space-y-6 pb-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>App Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Tagline *</Label><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} required /></div>
              </div>
              <div className="space-y-2"><Label>Description *</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
              <div className="space-y-2"><Label>What's New</Label><Textarea rows={2} value={form.whatsNew} onChange={(e) => setForm({ ...form, whatsNew: e.target.value })} /></div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Category *</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Tags</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
              </div>

              <div className="space-y-2">
                <Label>Platform *</Label>
                <RadioGroup value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })} className="flex gap-4">
                  {["android", "ios", "both"].map(p => <div key={p} className="flex items-center gap-2"><RadioGroupItem value={p} id={`p-${p}`} /><Label htmlFor={`p-${p}`} className="capitalize">{p}</Label></div>)}
                </RadioGroup>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Version</Label><Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></div>
                <div className="space-y-2"><Label>Min OS</Label><Input value={form.minOSVersion} onChange={(e) => setForm({ ...form, minOSVersion: e.target.value })} /></div>
              </div>

              <Separator />
              
              {/* Screenshot Manager */}
              {existingScreenshots.length > 0 && (
                <div className="space-y-3">
                  <Label>Manage Screenshots (Order matters!)</Label>
                  <ScrollArea className="w-full whitespace-nowrap border rounded-lg p-4">
                    <div className="flex space-x-4">
                      {existingScreenshots.map((url, i) => (
                        <div key={url} className="relative w-32 shrink-0 group">
                          <img src={api.getFileUrl(url)} alt="" className="h-48 w-full object-cover rounded-md border" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <div className="flex gap-1">
                              <Button type="button" size="icon" variant="secondary" className="h-8 w-8" onClick={() => moveScreenshot(i, -1)} disabled={i === 0}><ArrowLeft className="h-4 w-4" /></Button>
                              <Button type="button" size="icon" variant="secondary" className="h-8 w-8" onClick={() => moveScreenshot(i, 1)} disabled={i === existingScreenshots.length - 1}><ArrowRight className="h-4 w-4" /></Button>
                            </div>
                            <Button type="button" size="icon" variant="destructive" className="h-8 w-8" onClick={() => removeScreenshot(i)}><X className="h-4 w-4" /></Button>
                          </div>
                          <Badge className="absolute top-2 left-2 bg-black/50">{i + 1}</Badge>
                        </div>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Add Icon</Label><Input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0])} /></div>
                <div className="space-y-2"><Label>Add Screenshots</Label><Input type="file" accept="image/*" multiple onChange={(e) => setScreenshotFiles(Array.from(e.target.files || []))} /></div>
                <div className="space-y-2"><Label>Add Video (MP4)</Label><Input type="file" accept="video/mp4,video/*" onChange={(e) => setVideoFile(e.target.files?.[0])} /></div>
                <div className="space-y-2"><Label>App File (.apk/.ipa)</Label><Input type="file" accept=".apk,.ipa" onChange={(e) => setAppFile(e.target.files?.[0])} /></div>
              </div>

              {submitting && <div className="space-y-2 pt-2"><Progress value={uploadProgress} /><p className="text-xs text-center text-muted-foreground">{uploadProgress}% - Processing...</p></div>}
            </form>
          </ScrollArea>

          <DialogFooter className="p-6 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" form="admin-form" disabled={submitting}><Upload className="h-4 w-4 mr-1" />{submitting ? "Uploading..." : "Save App"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
