import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTesterEnrollments, unenrollTesterApp, getAppBySlug } from "@/services/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  Download, 
  Info, 
  ArrowRight, 
  ChevronRight, 
  AlertCircle,
  History,
  Trash2,
  ExternalLink,
  ChevronLeft
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function MyAppList() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isUnenrollDialogOpen, setIsUnenrollDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const { data } = await getTesterEnrollments();
      setEnrollments(data || []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to fetch enrolled apps.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (slug) => {
    try {
      const { data } = await getAppBySlug(slug);
      setSelectedApp(data);
      setIsSheetOpen(true);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load app details.",
        variant: "destructive",
      });
    }
  };

  const handleUnenroll = async () => {
    if (!selectedApp) return;
    try {
      await unenrollTesterApp(selectedApp.id);
      toast({
        title: "Success",
        description: `Successfully left beta for ${selectedApp.name}`,
      });
      setIsUnenrollDialogOpen(false);
      setIsSheetOpen(false);
      fetchEnrollments();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to leave beta.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (apkUrl, appName) => {
    if (!apkUrl) {
      toast({
        title: "Download Failed",
        description: "No APK file available for this version.",
        variant: "destructive",
      });
      return;
    }
    window.open(apkUrl, "_blank");
    toast({
      title: "Download Started",
      description: `Downloading ${appName}...`,
    });
  };

  if (loading) return <GridSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">My Apps</h1>
        <p className="text-muted-foreground">Manage the applications you are currently beta testing.</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/20">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-semibold">No Enrolled Apps</h2>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            You haven't joined any testing programs yet. Browse the store to find apps looking for testers.
          </p>
          <Button asChild className="mt-8 bg-green-600 hover:bg-green-700">
            <Link to="/">Browse App Store</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {enrollments.map((enroll) => (
            <Card key={enroll.id} className="overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm group hover:shadow-xl transition-all">
              <CardHeader className="flex flex-row items-start gap-4 pb-4">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center shrink-0 border shadow-inner overflow-hidden">
                  {enroll.app.icon ? (
                    <img src={enroll.app.icon} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">{enroll.app.name}</CardTitle>
                    <Badge variant="outline" className="text-[10px] uppercase">{enroll.app.category}</Badge>
                  </div>
                  <CardDescription className="line-clamp-1 mt-1">{enroll.app.tagline}</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-[10px] font-mono h-5">v{enroll.app.version}</Badge>
                    {/* Update Alert Logic */}
                    {Math.random() > 0.7 && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 animate-pulse">
                        <AlertCircle className="h-3 w-3" />
                        UPDATE AVAILABLE
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Last Activity: {format(new Date(enroll.created_at), "MMM d, yyyy")}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 grid grid-cols-2 gap-2 p-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2 text-xs h-9"
                  onClick={() => handleViewDetails(enroll.app.slug)}
                >
                  <Info className="h-3.5 w-3.5" /> Details
                </Button>
                <Button 
                  size="sm" 
                  className="w-full gap-2 text-xs h-9 bg-green-600 hover:bg-green-700"
                  onClick={() => handleDownload(enroll.app.apk_file, enroll.app.name)}
                >
                  <Download className="h-3.5 w-3.5" /> Install APK
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* App Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto custom-scrollbar p-0">
          {selectedApp && (
            <div className="flex flex-col min-h-screen">
              <div className="relative h-48 bg-gradient-to-br from-green-600 to-green-800">
                <div className="absolute inset-0 bg-black/20" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 left-4 text-white hover:bg-white/20"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-3xl bg-card border-4 border-card shadow-xl flex items-center justify-center overflow-hidden">
                  {selectedApp.icon ? (
                    <img src={selectedApp.icon} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="pt-14 px-8 pb-8 space-y-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">{selectedApp.name}</h2>
                    <p className="text-lg text-muted-foreground mt-1">{selectedApp.tagline}</p>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{selectedApp.category}</Badge>
                      <Badge variant="outline" className="font-mono">v{selectedApp.version}</Badge>
                    </div>
                  </div>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 gap-2 shadow-lg"
                    onClick={() => handleDownload(selectedApp.apkFile, selectedApp.name)}
                  >
                    <Download className="h-4 w-4" /> Install Now
                  </Button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Info className="h-5 w-5 text-green-600" />
                    About this Beta
                  </h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedApp.description}
                  </p>
                </div>

                {/* Screenshots Carousel */}
                {selectedApp.screenshots?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold">Screenshots</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-8 px-8">
                      {selectedApp.screenshots.map((ss, i) => (
                        <div key={i} className="flex-shrink-0 w-48 h-80 rounded-2xl border bg-muted overflow-hidden shadow-md">
                          <img src={ss} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Version History Table */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <History className="h-5 w-5 text-green-600" />
                    Version History
                  </h3>
                  <div className="rounded-2xl border overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="text-left p-4 font-bold">Version</th>
                          <th className="text-left p-4 font-bold hidden sm:table-cell">Notes</th>
                          <th className="text-right p-4 font-bold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {/* Current Version */}
                        <tr className="bg-green-50/30">
                          <td className="p-4">
                            <div className="font-bold">{selectedApp.version}</div>
                            <div className="text-[10px] text-green-600 font-bold uppercase mt-0.5">Active Build</div>
                          </td>
                          <td className="p-4 text-muted-foreground hidden sm:table-cell max-w-xs">
                            <p className="line-clamp-2">{selectedApp.whatsNew || "Initial beta release."}</p>
                          </td>
                          <td className="p-4 text-right">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => handleDownload(selectedApp.apkFile, selectedApp.name)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                        {/* History */}
                        {selectedApp.versionHistory?.map((hist, i) => (
                          <tr key={i} className="hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div className="font-medium text-muted-foreground">{hist.version}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(hist.date), "MMM d, yyyy")}</div>
                            </td>
                            <td className="p-4 text-muted-foreground hidden sm:table-cell max-w-xs">
                              <p className="line-clamp-2 text-xs">{hist.whatsNew || "No release notes."}</p>
                            </td>
                            <td className="p-4 text-right">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleDownload(hist.apkFile, `${selectedApp.name} v${hist.version}`)}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-8 border-t">
                  <Button 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full justify-start gap-2"
                    onClick={() => setIsUnenrollDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" /> Leave Beta Program
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Unenroll Confirmation Dialog */}
      <AlertDialog open={isUnenrollDialogOpen} onOpenChange={setIsUnenrollDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove you from the beta testing program for <strong>{selectedApp?.name}</strong>. 
              You will no longer receive updates or be able to submit bugs for this app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleUnenroll}>
              Leave Beta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function Clock({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
