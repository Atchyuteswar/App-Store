import React, { useState, useEffect } from "react";
import { 
  getAnnouncements, 
  createAnnouncement, 
  getAdminApps 
} from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Mail, Users, Info, Plus, Megaphone, Trash2, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Announcements() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    appId: "all",
    title: "",
    body: "",
    sendEmail: false
  });

  useEffect(() => {
    fetchApps();
    fetchAnnouncements();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await getAdminApps();
      setApps(res.data || []);
    } catch (err) {}
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await getAnnouncements();
      setAnnouncements(res.data || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch announcements", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.body) {
      toast({ title: "Validation Error", description: "Title and body are required", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        ...formData,
        appId: formData.appId === "all" ? null : formData.appId
      };
      await createAnnouncement(payload);
      setIsDialogOpen(false);
      setFormData({ appId: "all", title: "", body: "", sendEmail: false });
      fetchAnnouncements();
      toast({ title: "Broadcasted", description: "Announcement sent to all targeted testers." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to broadcast", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
            Broadcast Announcements
          </h1>
          <p className="text-white/40 mt-2 font-medium">Send mass updates and notifications to your testers.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
              <Plus className="h-5 w-5 mr-2" /> New Broadcast
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-[#0f0f0f] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select 
                  value={formData.appId} 
                  onValueChange={(val) => setFormData({ ...formData, appId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Platform-Wide (All Testers)</SelectItem>
                    {apps.map(app => (
                      <SelectItem key={app.id} value={app.id}>{app.name} Testers</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject / Title</Label>
                <Input 
                  placeholder="e.g. New Version Available for Testing" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Message Content</Label>
                <Textarea 
                  placeholder="Write your announcement here..." 
                  className="min-h-[150px]"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label className="text-base">Email Broadcast</Label>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Pro</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Send a copy of this message to all target emails.</p>
                </div>
                <Switch 
                  checked={formData.sendEmail}
                  onCheckedChange={(val) => setFormData({ ...formData, sendEmail: val })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                <Send className="h-4 w-4 mr-2" /> Send Broadcast
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics or Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Bell className="h-5 w-5" /> Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 h-fit rounded-lg bg-white shadow-sm border">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Smart Targeting</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    Select a specific app to notify only the testers enrolled in that project.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 h-fit rounded-lg bg-white shadow-sm border">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Email Reach</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    Enable email broadcast for critical updates that shouldn't be missed.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 h-fit rounded-lg bg-white shadow-sm border">
                  <Info className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">In-App Notifications</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    All broadcasts are automatically added to the testers' notification centers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Reach Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Announcements</span>
                <span className="font-bold">{announcements.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Email Broadcasts</span>
                <span className="font-bold">{announcements.filter(a => a.sendEmail).length}</span>
              </div>
              <div className="pt-2 border-t text-[10px] text-muted-foreground flex items-center gap-1 italic">
                <Clock className="h-3 w-3" /> Last broadcast {announcements[0] ? new Date(announcements[0].createdAt).toLocaleDateString() : 'never'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Broadcast History</CardTitle>
            <CardDescription>A log of all messages sent through the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Megaphone className="h-12 w-12 opacity-10 mb-4" />
                <p>No announcements found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann.id} className="group p-4 border rounded-xl hover:border-primary/50 transition-colors bg-card relative overflow-hidden">
                    {ann.sendEmail && <div className="absolute top-0 right-0 h-10 w-10 overflow-hidden">
                      <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[8px] font-bold px-4 py-1 rotate-45 translate-x-3 translate-y-[-1px] border-b border-blue-200">
                        EMAIL
                      </div>
                    </div>}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm truncate">{ann.title}</h4>
                          <Badge variant="outline" className="text-[10px] h-4">
                            {ann.app_id ? apps.find(a => a.id === ann.app_id)?.name : "Platform"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {ann.body}
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {new Date(ann.createdAt).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> Sent to {ann.app_id ? "App Segment" : "All Users"}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
