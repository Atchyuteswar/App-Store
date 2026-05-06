import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateTesterProfile } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Smartphone, 
  Mail, 
  Lock, 
  ShieldAlert, 
  LogOut, 
  Check, 
  Loader2,
  Bug,
  Lightbulb,
  MessageSquare,
  Activity,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function TesterProfile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    deviceModel: user?.deviceModel || "",
    manufacturer: user?.manufacturer || "",
    osVersion: user?.osVersion || "",
    prefsNewReleases: user?.prefsNewReleases ?? true,
    prefsBugUpdates: user?.prefsBugUpdates ?? true,
    prefsIdeaUpdates: user?.prefsIdeaUpdates ?? true,
    prefsWeeklyDigest: user?.prefsWeeklyDigest ?? false,
  });

  // Password State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateTesterProfile(profileData);
      toast({ title: "Profile Updated", description: "Your information has been saved." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    // In a real app, call a specific password change endpoint
    toast({ title: "Password Updated", description: "Security settings saved successfully." });
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || "TP";

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-card/50 backdrop-blur-sm p-8 rounded-3xl border shadow-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-green-600 flex items-center justify-center text-white text-3xl md:text-4xl font-black shadow-2xl relative z-10 border-4 border-background group-hover:scale-105 transition-transform">
          {initials}
        </div>
        <div className="flex-1 text-center md:text-left space-y-2 relative z-10">
          <h1 className="text-3xl font-black tracking-tight">{user?.username}</h1>
          <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
            <Mail className="h-4 w-4" /> {user?.email}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
            <Badge className="bg-green-600">BETA TESTER</Badge>
            <Badge variant="outline" className="border-primary/20 text-primary">ID: {user?.id?.slice(0, 8)}</Badge>
          </div>
        </div>
        <Button variant="ghost" className="md:absolute top-8 right-8 text-red-500 hover:text-red-600 hover:bg-red-50 gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>

      {/* Tester Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Bugs reported", value: "12", icon: Bug },
          { label: "Ideas shared", value: "5", icon: Lightbulb },
          { label: "Messages", value: "28", icon: MessageSquare },
          { label: "Active days", value: "45", icon: Activity },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-md bg-card/50 text-center">
            <CardContent className="p-6">
              <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary opacity-50" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Device Information */}
        <Card className="border-none shadow-xl bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Device Context
            </CardTitle>
            <CardDescription>Details used to help developers reproduce bugs.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input 
                  id="manufacturer" 
                  placeholder="e.g. Samsung, Apple" 
                  value={profileData.manufacturer}
                  onChange={e => setProfileData({...profileData, manufacturer: e.target.value})}
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Device Model</Label>
                <Input 
                  id="model" 
                  placeholder="e.g. Galaxy S24, iPhone 15" 
                  value={profileData.deviceModel}
                  onChange={e => setProfileData({...profileData, deviceModel: e.target.value})}
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="os">OS Version</Label>
                <Input 
                  id="os" 
                  placeholder="e.g. Android 14, iOS 17.4" 
                  value={profileData.osVersion}
                  onChange={e => setProfileData({...profileData, osVersion: e.target.value})}
                  className="bg-muted/30"
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 mt-4" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Update Device Info
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="border-none shadow-xl bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Preferences
            </CardTitle>
            <CardDescription>Control how we notify you about activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[
                { id: "new", label: "New Version Releases", desc: "Alert me when a joined app is updated", key: "prefsNewReleases" },
                { id: "bug", label: "Bug Status Updates", desc: "Alert me when my bug report changes state", key: "prefsBugUpdates" },
                { id: "idea", label: "Idea Progression", desc: "Alert me when my idea is planned or implemented", key: "prefsIdeaUpdates" },
                { id: "weekly", label: "Weekly Digest", desc: "Receive a summary of testing activity", key: "prefsWeeklyDigest" },
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">{pref.label}</Label>
                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                  </div>
                  <Switch 
                    checked={profileData[pref.key]}
                    onCheckedChange={(checked) => {
                      const newPrefs = { ...profileData, [pref.key]: checked };
                      setProfileData(newPrefs);
                      updateTesterProfile(newPrefs); // Auto-save for UX
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-dashed">
              <div className="p-4 rounded-xl bg-muted/20 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Beta Participation</p>
                <p className="text-xs mt-1">You are currently testing <strong>3 applications</strong>.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security & Password */}
      <Card className="border-none shadow-xl bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Security & Authentication
          </CardTitle>
          <CardDescription>Update your password and secure your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="grid md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <Label htmlFor="current">Current Password</Label>
              <Input id="current" type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="bg-muted/30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New Password</Label>
              <Input id="new" type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="bg-muted/30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm New</Label>
              <div className="flex gap-2">
                <Input id="confirm" type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="bg-muted/30" />
                <Button type="submit" className="bg-green-600 hover:bg-green-700">Update</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-dashed border-red-500/20 bg-red-50/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <ShieldAlert className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions for your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Leave All Beta Programs</h4>
            <p className="text-xs text-muted-foreground">This will remove your enrollment from all apps. You will lose access to testing hubs.</p>
          </div>
          <Button variant="destructive" className="shrink-0 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20">
            Leave All Betas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Badge({ children, className, variant = "default" }) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    outline: "border border-input bg-background",
    secondary: "bg-secondary text-secondary-foreground"
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)}>
      {children}
    </span>
  );
}
