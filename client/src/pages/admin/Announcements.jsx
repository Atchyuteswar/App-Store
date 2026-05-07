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
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Mail, Users, Info, Plus, Megaphone, Trash2, Calendar, Clock, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
    <div className="space-y-12 pb-20 selection:bg-primary/30">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 h-6 mb-2">Neural Broadcast</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-premium uppercase leading-tight">Communications</h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Synchronize platform-wide intelligence & researcher updates</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-[0_0_30px_-10px_rgba(34,197,94,0.5)] transition-all hover:scale-105 active:scale-95">
              <Plus className="h-5 w-5 mr-2" /> New Broadcast
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f0f0f] border-white/10 text-white p-10 max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
            <DialogHeader className="relative z-10">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-6">
                <Megaphone className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-tight">Initialize Broadcast</DialogTitle>
              <DialogDescription className="text-white/40 font-medium pt-2">
                Define the parameters for your platform-wide synchronization event.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-8 py-10 relative z-10">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Target Segment</Label>
                <Select 
                  value={formData.appId} 
                  onValueChange={(val) => setFormData({ ...formData, appId: val })}
                >
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-white/10 text-white rounded-2xl p-2">
                    <SelectItem value="all" className="rounded-xl py-3 font-bold uppercase tracking-widest text-[10px]">PLATFORM-WIDE (GLOBAL)</SelectItem>
                    {apps.map(app => (
                      <SelectItem key={app.id} value={app.id} className="rounded-xl py-3 font-bold uppercase tracking-widest text-[10px]">{app.name.toUpperCase()} RESEARCHERS</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Mission Subject</Label>
                <Input 
                  placeholder="e.g. Architectural Revisions v2.4.0 Live" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold placeholder:text-white/10"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Intelligence Payload</Label>
                <Textarea 
                  placeholder="Draft the technical synchronization brief..." 
                  className="min-h-[160px] bg-white/5 border-white/10 rounded-[2rem] font-medium p-8 resize-none placeholder:text-white/10"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white">External Transmission</Label>
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[8px] font-black uppercase tracking-widest">EMAIL SYNC</Badge>
                  </div>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Synchronize with external researcher terminals.</p>
                </div>
                <Switch 
                  checked={formData.sendEmail}
                  onCheckedChange={(val) => setFormData({ ...formData, sendEmail: val })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-4 relative z-10">
              <Button onClick={handleSubmit} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-[0_0_30px_-10px_rgba(34,197,94,0.5)] transition-all hover:scale-[1.02]">
                <Send className="h-5 w-5 mr-3" /> Execute Broadcast
              </Button>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Abort Mission</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics or Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="p-10 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Operational Guide</h3>
            </div>
            
            <div className="space-y-8">
              {[
                { title: "Precise Targeting", desc: "Segment your audience by selecting specific research branches for mission-critical updates.", icon: Users },
                { title: "Global Reach", desc: "Utilize the external transmission protocol for urgent, high-priority synchronizations.", icon: Mail },
                { title: "Universal Sync", desc: "All broadcasts are automatically archived in researcher notification matrices.", icon: Info }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/30 transition-all">
                    <item.icon className="h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{item.title}</h4>
                    <p className="text-[11px] text-white/30 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-10 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Network Telemetry</h3>
              <Zap className="h-4 w-4 text-primary/40" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Events</span>
                <span className="text-xl font-black text-white tracking-tighter">{announcements.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">External Syncs</span>
                <span className="text-xl font-black text-white tracking-tighter">{announcements.filter(a => a.sendEmail).length}</span>
              </div>
              <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                <Clock className="h-3 w-3 text-white/10" />
                <span className="text-[9px] font-black text-white/10 uppercase tracking-widest italic">
                  Last event synchronized: {announcements[0] ? new Date(announcements[0].createdAt).toLocaleDateString() : 'NEVER'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 p-10 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tighter text-premium uppercase flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
              Mission Logs
            </h2>
          </div>
          
          <div className="space-y-6 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
            {loading ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-[2rem] bg-white/5" />)
            ) : announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-10">
                <Megaphone className="h-16 w-16" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Archive clear</p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/[0.08] transition-all duration-500 relative overflow-hidden">
                  {ann.sendEmail && (
                    <div className="absolute top-0 right-0 p-6">
                      <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-blue-400" />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-white/5 border-white/10 text-white/40 font-black uppercase tracking-widest text-[8px] px-3 h-6">
                        {ann.app_id ? apps.find(a => a.id === ann.app_id)?.name.toUpperCase() : "GLOBAL NETWORK"}
                      </Badge>
                      <div className="h-1 w-1 rounded-full bg-white/10" />
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{new Date(ann.createdAt).toLocaleString()}</span>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-white tracking-tight uppercase group-hover:text-primary transition-colors">{ann.title}</h4>
                      <p className="text-[11px] text-white/30 leading-relaxed font-medium mt-3 italic line-clamp-3 group-hover:text-white/40 transition-colors">
                        "{ann.body}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-white/20" />
                          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                            TARGET: {ann.app_id ? "SEGMENTED NODE" : "GLOBAL MATRIX"}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-red-500/20 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
