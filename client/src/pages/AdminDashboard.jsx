import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Download, Star, Eye, EyeOff, Pencil, Trash2, Plus, LogOut, Upload, X, Home,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/services/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Stats
  const stats = useMemo(() => ({
    total: apps.length,
    downloads: apps.reduce((s, a) => s + (a.downloads || 0), 0),
    featured: apps.filter((a) => a.featured).length,
    published: apps.filter((a) => a.published).length,
    unpublished: apps.filter((a) => !a.published).length,
  }), [apps]);

  // Dialog handlers
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setUploadProgress(0);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (iconFile) fd.append("icon", iconFile);
    screenshotFiles.forEach((f) => fd.append("screenshots", f));
    if (appFile) fd.append("appFile", appFile);

    try {
      if (editingApp) {
        await api.updateApp(editingApp._id, fd, setUploadProgress);
        toast({ title: "Updated", description: `${form.name} updated successfully` });
      } else {
        await api.createApp(fd, setUploadProgress);
        toast({ title: "Created", description: `${form.name} added to the store` });
      }
      setDialogOpen(false);
      fetchApps();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || "Something went wrong" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    try {
      await api.deleteApp(id);
      toast({ title: "Deleted", description: `${name} has been removed` });
      fetchApps();
    } catch { toast({ variant: "destructive", title: "Error", description: "Failed to delete app" }); }
  };

  const handleTogglePublish = async (id) => {
    try { await api.togglePublish(id); fetchApps(); } catch { toast({ variant: "destructive", title: "Error", description: "Failed to toggle publish" }); }
  };

  const handleToggleFeatured = async (id) => {
    try { await api.toggleFeatured(id); fetchApps(); } catch { toast({ variant: "destructive", title: "Error", description: "Failed to toggle featured" }); }
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out" });
    navigate("/admin/login");
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="font-bold text-lg">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{admin?.email}</span>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}><Home className="h-4 w-4 mr-1" />Store</Button>
            <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4 mr-1" />Logout</Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Apps", value: stats.total, icon: Package },
            { label: "Downloads", value: stats.downloads, icon: Download },
            { label: "Featured", value: stats.featured, icon: Star },
            { label: "Published", value: stats.published, icon: Eye },
            { label: "Unpublished", value: stats.unpublished, icon: EyeOff },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted"><s.icon className="h-5 w-5 text-muted-foreground" /></div>
                <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Apps</h2>
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add New App</Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : apps.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No apps yet. Click "Add New App" to get started.</CardContent></Card>
        ) : (
          <Card>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead className="hidden md:table-cell">Platform</TableHead>
                    <TableHead className="hidden md:table-cell">Version</TableHead>
                    <TableHead className="hidden lg:table-cell">Downloads</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apps.map((app) => (
                    <TableRow key={app._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {app.icon ? (
                            <img src={api.getFileUrl(app.icon)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">{app.name[0]}</div>
                          )}
                          <span className="font-medium truncate max-w-[150px]">{app.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell"><Badge variant="secondary" className="text-xs">{app.category}</Badge></TableCell>
                      <TableCell className="hidden md:table-cell capitalize">{app.platform}</TableCell>
                      <TableCell className="hidden md:table-cell">{app.version}</TableCell>
                      <TableCell className="hidden lg:table-cell">{app.downloads}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {app.published ? <Badge className="text-xs">Live</Badge> : <Badge variant="outline" className="text-xs">Draft</Badge>}
                          {app.featured && <Badge variant="secondary" className="text-xs">★</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleTogglePublish(app._id)} title={app.published ? "Unpublish" : "Publish"}>
                            {app.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleFeatured(app._id)} title={app.featured ? "Unfeature" : "Feature"}>
                            <Star className={`h-4 w-4 ${app.featured ? "fill-yellow-500 text-yellow-500" : ""}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(app)}><Pencil className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {app.name}?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete the app and all its files. This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(app._id, app.name)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingApp ? "Edit App" : "Add New App"}</DialogTitle>
            <DialogDescription>{editingApp ? "Update the app details below." : "Fill in the details to add a new app."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">App Name *</Label>
                <Input id="app-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-tagline">Tagline *</Label>
                <Input id="app-tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-description">Description *</Label>
              <Textarea id="app-description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-whatsnew">What&apos;s New</Label>
              <Textarea id="app-whatsnew" rows={2} value={form.whatsNew} onChange={(e) => setForm({ ...form, whatsNew: e.target.value })} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-tags">Tags (comma-separated)</Label>
                <Input id="app-tags" placeholder="offline, free, dark mode" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Platform *</Label>
              <RadioGroup value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })} className="flex gap-4">
                {[["android", "Android"], ["ios", "iOS"], ["both", "Both"]].map(([val, label]) => (
                  <div key={val} className="flex items-center gap-2">
                    <RadioGroupItem value={val} id={`platform-${val}`} />
                    <Label htmlFor={`platform-${val}`} className="font-normal">{label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-version">Version</Label>
                <Input id="app-version" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-minos">Min OS Version</Label>
                <Input id="app-minos" placeholder="Android 8.0" value={form.minOSVersion} onChange={(e) => setForm({ ...form, minOSVersion: e.target.value })} />
              </div>
            </div>

            <Separator />

            {/* File uploads */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>App Icon</Label>
                <Input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setIconFile(e.target.files?.[0] || null)} />
                {iconFile && <p className="text-xs text-muted-foreground truncate">{iconFile.name}</p>}
              </div>
              <div className="space-y-2">
                <Label>Screenshots (max 8)</Label>
                <Input type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={(e) => setScreenshotFiles(Array.from(e.target.files || []).slice(0, 8))} />
                {screenshotFiles.length > 0 && <p className="text-xs text-muted-foreground">{screenshotFiles.length} file(s)</p>}
              </div>
              <div className="space-y-2">
                <Label>App File (.apk/.ipa)</Label>
                <Input type="file" accept=".apk,.ipa" onChange={(e) => setAppFile(e.target.files?.[0] || null)} />
                {appFile && <p className="text-xs text-muted-foreground truncate">{appFile.name} ({(appFile.size / 1024 / 1024).toFixed(1)} MB)</p>}
              </div>
            </div>

            {submitting && uploadProgress > 0 && (
              <div className="space-y-1">
                <Progress value={uploadProgress} />
                <p className="text-xs text-muted-foreground text-center">{uploadProgress}%</p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                <Upload className="h-4 w-4 mr-1" />
                {submitting ? "Uploading..." : editingApp ? "Update App" : "Add App"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
