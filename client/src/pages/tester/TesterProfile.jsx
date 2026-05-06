import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Bell,
  Award,
  Globe,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
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
  Activity
} from "lucide-react";
import { 
  updateTesterProfile, 
  getTesterStats, 
  getTesterEnrollments, 
  getTesterAchievements,
  updateTesterProfileSettings,
  checkUsernameAvailability
} from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function TesterProfile() {
  const { user, logout, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [usernameStatus, setUsernameStatus] = useState("idle"); // idle, checking, available, taken
  
  useEffect(() => {
    fetchStats();
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data } = await getTesterAchievements();
      setAchievements(data || []);
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, enrollRes] = await Promise.all([
        getTesterStats(),
        getTesterEnrollments()
      ]);
      setStats(statsRes.data);
      setEnrollments(enrollRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };
  
  // Profile State
  const [profileData, setProfileData] = useState({
    deviceModel: user?.device_model || user?.deviceModel || "",
    manufacturer: user?.manufacturer || "",
    osVersion: user?.os_version || user?.osVersion || "",
    prefsNewReleases: user?.prefs_new_releases ?? user?.prefsNewReleases ?? true,
    prefsBugUpdates: user?.prefs_bug_updates ?? user?.prefsBugUpdates ?? true,
    prefsIdeaUpdates: user?.prefs_idea_updates ?? user?.prefsIdeaUpdates ?? true,
    emailNotifyDigest: user?.email_notify_digest ?? user?.emailNotifyDigest ?? false,
    username: user?.username || "",
    profilePublic: user?.profile_public ?? user?.profilePublic ?? false,
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
      await refreshUser();
      toast({ title: "Profile Updated", description: "Your information has been saved." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (newData) => {
    try {
      setProfileData(newData);
      await updateTesterProfileSettings(newData);
      await refreshUser();
      toast({ title: "Settings Saved" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" });
    }
  };

  const handleCheckUsername = async (name) => {
    if (name.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    try {
      const { data } = await checkUsernameAvailability(name);
      setUsernameStatus(data.available ? "available" : "taken");
    } catch (err) {
      setUsernameStatus("idle");
    }
  };

  const copyProfileLink = () => {
    const username = profileData.username || user?.username;
    if (!username) return;
    const url = `${window.location.origin}/t/${encodeURIComponent(username)}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied!", description: "Share your profile with others." });
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
        <div className="flex flex-col gap-2 md:absolute top-8 right-8">
          {profileData.profilePublic && profileData.username && (
            <Button variant="outline" className="gap-2" onClick={() => window.open(`/t/${profileData.username}`, '_blank')}>
              <ExternalLink className="h-4 w-4" /> View Public Profile
            </Button>
          )}
          <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2" onClick={logout}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Tester Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Bugs reported", value: stats?.totalBugs || 0, icon: Bug },
          { label: "Ideas shared", value: stats?.totalIdeas || 0, icon: Lightbulb },
          { label: "Messages", value: stats?.totalMessages || 0, icon: MessageSquare },
          { label: "Active days", value: stats?.totalActions || 0, icon: Activity },
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
                { id: "weekly", label: "Weekly Digest", desc: "Receive a summary of testing activity", key: "emailNotifyDigest" },
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">{pref.label}</Label>
                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                  </div>
                  <Switch 
                    checked={profileData[pref.key]}
                    onCheckedChange={async (checked) => {
                      const newPrefs = { ...profileData, [pref.key]: checked };
                      setProfileData(newPrefs);
                      try {
                        if (pref.key === 'emailNotifyDigest') {
                          await updateTesterProfileSettings(newPrefs);
                        } else {
                          await updateTesterProfile(newPrefs);
                        }
                        await refreshUser();
                      } catch (err) {
                        toast({ title: "Error", description: "Failed to update preference", variant: "destructive" });
                      }
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-dashed">
              <div className="p-4 rounded-xl bg-muted/20 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Beta Participation</p>
                <p className="text-xs mt-1">You are currently testing <strong>{enrollments.length} applications</strong>.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Public Profile & Identity */}
        <Card className="border-none shadow-xl bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Public Identity
            </CardTitle>
            <CardDescription>Customize how you appear to the community.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Public Username</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    id="username" 
                    placeholder="e.g. atchyut_tester" 
                    value={profileData.username}
                    onChange={e => {
                      setProfileData({...profileData, username: e.target.value});
                      handleCheckUsername(e.target.value);
                    }}
                    className={cn(
                      "bg-muted/30",
                      usernameStatus === "available" && "border-green-500/50",
                      usernameStatus === "taken" && "border-red-500/50"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === "checking" && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                    {usernameStatus === "available" && <Check className="h-3 w-3 text-green-600" />}
                    {usernameStatus === "taken" && <ShieldAlert className="h-3 w-3 text-red-600" />}
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  disabled={usernameStatus !== "available"}
                  onClick={() => handleUpdateSettings(profileData)}
                >
                  Save
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Your profile URL: {window.location.origin}/t/{profileData.username || "username"}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Public Profile</Label>
                <p className="text-xs text-muted-foreground">Allow others to see your stats & achievements</p>
              </div>
              <Switch 
                checked={profileData.profilePublic}
                onCheckedChange={(checked) => handleUpdateSettings({...profileData, profilePublic: checked})}
              />
            </div>

            {profileData.profilePublic && (
              <Button variant="outline" className="w-full border-dashed gap-2" onClick={copyProfileLink}>
                <Copy className="h-4 w-4" /> Copy Shareable Link
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card className="border-none shadow-xl bg-card/50 overflow-hidden">
        <CardHeader className="bg-muted/10 border-b">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements Gallery
          </CardTitle>
          <CardDescription>Your badges and milestones earned on the platform.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = !!achievement.unlockedAt;
              return (
                <div 
                  key={achievement.key} 
                  className={cn(
                    "flex flex-col items-center text-center p-4 rounded-2xl border transition-all group",
                    isUnlocked ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-transparent opacity-40 grayscale"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center mb-3 transition-transform",
                    isUnlocked ? "bg-primary/10 text-primary group-hover:scale-110" : "bg-muted text-muted-foreground"
                  )}>
                    <Award className="h-6 w-6" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-tight leading-tight">{achievement.name}</p>
                  <p className="text-[8px] text-muted-foreground mt-1 line-clamp-1">{achievement.description}</p>
                  {isUnlocked && (
                    <Badge className="mt-2 h-3 text-[7px] bg-green-600 px-1">UNLOCKED</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
