import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Download, Star, Eye, EyeOff, Pencil, Trash2, Plus, LogOut, Upload, Home,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/services/api";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [iconFile, setIconFile] = useState(null);
  const [screenshotFiles, setScreenshotFiles] = useState([]);
  const [appFile, setAppFile] = useState(null);
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
    setUploadProgress(10); // Start progress

    try {
      let iconUrl = editingApp?.icon || "";
      let screenshotUrls = editingApp?.screenshots || [];
      let apkUrl = editingApp?.apkFile || "";
      let size = editingApp?.size || "0 MB";

      // 1. Direct Upload Icon
      if (iconFile) {
        setUploadProgress(20);
        iconUrl = await uploadFile(iconFile, 'icons');
      }

      // 2. Direct Upload Screenshots
      if (screenshotFiles.length > 0) {
        setUploadProgress(40);
        const newUrls = await Promise.all(screenshotFiles.map(f => uploadFile(f, 'screenshots')));
        screenshotUrls = [...screenshotUrls, ...newUrls].slice(0, 8);
      }

      // 3. Direct Upload App File (The big one!)
      if (appFile) {
        setUploadProgress(60);
        apkUrl = await uploadFile(appFile, 'apps');
        size = `${(appFile.size / (1024 * 1024)).toFixed(1)} MB`;
      }

      setUploadProgress(90);

      // 4. Send ONLY metadata to your Render server
      const payload = {
        ...form,
        icon: iconUrl,
        screenshots: JSON.stringify(screenshotUrls),
        apkFile: apkUrl,
        size: size
      };

      if (editingApp) {
        await api.updateApp(editingApp._id, payload);
        toast({ title: "Updated", description: `${form.name} updated successfully` });
      } else {
        await api.createApp(payload);
        toast({ title: "Created", description: `${form.name} added to the store` });
      }

      setUploadProgress(100);
      setDialogOpen(false);
      fetchApps();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "Upload failed. Check console for details." });
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => ({
    total: apps.length,
    downloads: apps.reduce((s, a) => s + (a.downloads || 0), 0),
    featured: apps.filter((a) => a.featured).length,
    published: apps.filter((a) => a.published).length,
    unpublished: apps.filter((a) => !a.published).length,
  }), [apps]);

  const openAdd = () => { setEditingApp(null); setForm(emptyForm); setIconFile(null); setScreenshotFiles([]); setAppFile(null); setUploadProgress(0); setDialogOpen(true); };
  const openEdit = (app) => {
    setEditingApp(app);
    setForm({
      name: app.name, tagline: app.tagline, description: app.description,
      whatsNew: app.whatsNew || "", category: app.category, tags: (app.tags || []).join(", "),
      platform: app.platform, version: app.version, minOSVersion: app.minOSVersion || "",
    });
    setIconFile(null); setScreenshotFiles([]); setAppFile(null); setUploadProgress(0); setDialogOpen(true);
  };

  const handleDelete = async (id, name) => {
    try { await api.deleteApp(id); toast({ title: "Deleted", description: `${name} removed` }); fetchApps(); }
    catch { toast({ variant: "destructive", title: "Error", description: "Failed to delete" }); }
  };

  const handleTogglePublish = async (id) => {
    try { await api.togglePublish(id); fetchApps(); } catch { toast({ variant: "destructive", title: "Error", description: "Error" }); }
  };

  const handleToggleFeatured = async (id) => {
    try { await api.toggleFeatured(id); fetchApps(); } catch { toast({ variant: "destructive", title: "Error", description: "Error" }); }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
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
        ) : apps.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground border rounded-lg bg-card">No apps yet.</div>
        ) : (
          <div className="border rounded-lg bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={api.getFileUrl(app.icon)} alt="" className="h-10 w-10 rounded-lg object-cover bg-muted" onError={(e) => e.target.style.display='none'} />
                        <span className="font-medium">{app.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge variant="secondary">{app.category}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell capitalize">{app.platform}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {app.published ? <Badge>Live</Badge> : <Badge variant="outline">Draft</Badge>}
                        {app.featured && <Badge variant="secondary">★</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleTogglePublish(app._id)}>{app.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleFeatured(app._id)}><Star className={`h-4 w-4 ${app.featured ? "fill-yellow-500 text-yellow-500" : ""}`} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(app)}><Pencil className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Delete {app.name}?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(app._id, app.name)} className="bg-destructive">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingApp ? "Edit App" : "Add New App"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>App Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Tagline *</Label><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} required /></div>
            </div>
            <div className="space-y-2"><Label>Description *</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Tags</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Version</Label><Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></div>
              <div className="space-y-2"><Label>Min OS</Label><Input value={form.minOSVersion} onChange={(e) => setForm({ ...form, minOSVersion: e.target.value })} /></div>
            </div>
            <Separator />
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Icon</Label><Input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0])} /></div>
              <div className="space-y-2"><Label>Screenshots</Label><Input type="file" accept="image/*" multiple onChange={(e) => setScreenshotFiles(Array.from(e.target.files || []))} /></div>
              <div className="space-y-2"><Label>App File (.apk/.ipa)</Label><Input type="file" accept=".apk,.ipa" onChange={(e) => setAppFile(e.target.files?.[0])} /></div>
            </div>
            {submitting && <div className="space-y-2"><Progress value={uploadProgress} /><p className="text-xs text-center text-muted-foreground">{uploadProgress}% - Don't close this window</p></div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}><Upload className="h-4 w-4 mr-1" />{submitting ? "Uploading..." : "Save App"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
