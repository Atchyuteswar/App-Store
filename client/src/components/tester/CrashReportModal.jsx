import React, { useState, useEffect } from "react";
import { reportTesterCrash, getTesterEnrollments } from "@/services/api";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Bug, AlertCircle, Laptop, Smartphone, Terminal, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CrashReportModal({ open, onOpenChange }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    appId: "",
    appVersion: "",
    os: "Windows",
    osVersion: "",
    deviceModel: "",
    manufacturer: "",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchApps();
      // Auto-detect OS info if possible
      const ua = navigator.userAgent;
      setFormData(prev => ({
        ...prev,
        os: ua.includes("Windows") ? "Windows" : (ua.includes("Mac") ? "macOS" : (ua.includes("Android") ? "Android" : "iOS")),
      }));
    }
  }, [open]);

  const fetchApps = async () => {
    try {
      const { data } = await getTesterEnrollments();
      setApps(data || []);
      if (data.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          appId: data[0].app.id,
          appVersion: data[0].app.version 
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description) return;

    setLoading(true);
    try {
      await reportTesterCrash(formData);
      toast({ title: "Crash report sent", description: "Thank you for helping us improve!" });
      onOpenChange(false);
      setFormData({
        appId: "",
        appVersion: "",
        os: "Windows",
        osVersion: "",
        deviceModel: "",
        manufacturer: "",
        description: ""
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send report." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-none shadow-2xl">
        <DialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <Bug className="h-6 w-6 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-bold">Report an App Crash</DialogTitle>
          <DialogDescription>
            Did an app stop working? Provide the details below to help developers fix it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select App</Label>
              <Select 
                value={formData.appId} 
                onValueChange={(val) => {
                  const app = apps.find(a => a.app.id === val);
                  setFormData({ ...formData, appId: val, appVersion: app?.app.version || "" });
                }}
              >
                <SelectTrigger className="bg-muted/30 border-none h-10">
                  <SelectValue placeholder="Pick an app" />
                </SelectTrigger>
                <SelectContent>
                  {apps.map(a => (
                    <SelectItem key={a.app.id} value={a.app.id}>{a.app.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">App Version</Label>
              <Input 
                value={formData.appVersion} 
                readOnly 
                className="bg-muted/30 border-none h-10 font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">What happened?</Label>
            <Textarea 
              placeholder="e.g. App closed suddenly after clicking the search button..." 
              className="bg-muted/30 border-none min-h-[100px] resize-none text-sm"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="pt-2 border-t border-dashed">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
              <Smartphone className="h-3 w-3" /> System Metadata (Optional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input 
                placeholder="OS Version (e.g. Android 13)" 
                className="bg-muted/20 border-none h-9 text-xs"
                value={formData.osVersion}
                onChange={(e) => setFormData({ ...formData, osVersion: e.target.value })}
              />
              <Input 
                placeholder="Device Model (e.g. Pixel 7)" 
                className="bg-muted/20 border-none h-9 text-xs"
                value={formData.deviceModel}
                onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2 bg-red-600 hover:bg-red-700">
            {loading ? <Terminal className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
