import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Download, Star, ArrowLeft, Smartphone, Monitor, Globe, Calendar, HardDrive, Tag, Beaker } from "lucide-react";
import { getAppBySlug, getFileUrl, getDownloadUrl, getApps, enrollAbTesting } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AppCard from "@/components/AppCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatDate } from "@/lib/utils";

const platformInfo = {
  android: { icon: <Smartphone className="h-4 w-4" />, label: "Android" },
  ios: { icon: <Monitor className="h-4 w-4" />, label: "iOS" },
  both: { icon: <Globe className="h-4 w-4" />, label: "Android & iOS" },
};

export default function AppDetail() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [app, setApp] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);
  
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ fullName: "", phoneNumber: "" });
  const [agreedTerms, setAgreedTerms] = useState({ copy: false, exploit: false, terms: false });
  const [enrolling, setEnrolling] = useState(false);

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      toast({ title: "Login Required", description: "You must be signed in to enroll." });
      navigate("/login", { state: { from: location } });
      return;
    }
    setEnrollModalOpen(true);
  };

  const submitEnrollment = async (e) => {
    e.preventDefault();
    if (!agreedTerms.copy || !agreedTerms.exploit || !agreedTerms.terms) {
      return toast({ variant: "destructive", title: "Error", description: "You must agree to all terms." });
    }
    setEnrolling(true);
    try {
      await enrollAbTesting(app.slug, enrollForm);
      toast({ title: "Enrolled!", description: "You have successfully enrolled in the A/B Testing program. A confirmation email has been sent." });
      setEnrollModalOpen(false);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || "Enrollment failed." });
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getAppBySlug(slug)
      .then(({ data }) => {
        setApp(data);
        return getApps({ category: data.category });
      })
      .then(({ data }) => {
        setRelated(data.filter((a) => a.slug !== slug).slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-8 space-y-6 flex-1">
          <Skeleton className="h-8 w-48" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-32 w-32 rounded-2xl" />
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-12 w-40" />
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container py-20 flex-1 text-center">
          <h2 className="text-2xl font-bold">App not found</h2>
          <p className="text-muted-foreground mt-2">The app you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild className="mt-6"><Link to="/">Go Home</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const plat = platformInfo[app.platform] || platformInfo.android;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-6">
          {/* Back */}
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
          </Button>

          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
            {/* Left side: Icon & Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              {app.icon ? (
                <img src={getFileUrl(app.icon)} alt={app.name} className="h-28 w-28 md:h-32 md:w-32 rounded-3xl object-cover shadow-2xl border border-border/50" />
              ) : (
                <div className="h-28 w-28 md:h-32 md:w-32 rounded-3xl bg-muted flex items-center justify-center shadow-2xl border border-border/50">
                  <span className="text-4xl font-bold text-muted-foreground">{app.name[0]}</span>
                </div>
              )}
              <div className="flex flex-col justify-center h-full pt-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{app.name}</h1>
                <p className="text-primary font-medium text-sm md:text-base mt-1">Atchyuteswar Gottumukkala</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2.5 py-1.5 rounded-lg">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${s <= Math.round(app.rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`} />
                    ))}
                    <span className="text-sm font-bold ml-1">{app.rating?.toFixed(1)}</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground"><Download className="h-4 w-4" />{app.downloads}</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">{plat.icon}{plat.label}</span>
                </div>
              </div>
            </div>

            {/* Right side: Download Button */}
            <div className="w-full md:w-auto shrink-0 md:pl-8">
              <Button asChild size="lg" className="w-full md:w-[220px] h-14 text-lg shadow-xl shadow-primary/20 transition-transform active:scale-95">
                <a href={getDownloadUrl(app.slug)}>
                  <Download className="h-5 w-5 mr-2" /> Download <span className="text-sm opacity-80 font-normal ml-1">({app.size})</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Media Section - Full Width */}
          <div className="space-y-4 mb-10">
            <h3 className="text-xl font-bold mb-4">Screenshots</h3>
            <div className="relative px-2 sm:px-8">
                <Carousel className="w-full" opts={{ align: "start" }}>
                  <CarouselContent className="-ml-4">
                    {/* Video First */}
                    {app.video_url && (
                      <CarouselItem className="pl-4 basis-[80%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                        <div className="relative rounded-2xl overflow-hidden border aspect-[9/16] bg-black group shadow-xl">
                          <video
                            src={getFileUrl(app.video_url)}
                            controls
                            className="w-full h-full object-cover"
                            poster={app.screenshots?.[0] ? getFileUrl(app.screenshots[0]) : ""}
                          />
                        </div>
                      </CarouselItem>
                    )}
                    {/* Screenshots */}
                    {app.screenshots && app.screenshots.map((ss, i) => (
                      <CarouselItem key={i} className="pl-4 basis-[70%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                        <img
                          src={getFileUrl(ss)}
                          alt={`Screenshot ${i + 1}`}
                          className="rounded-2xl border shadow-xl cursor-pointer hover:scale-[1.02] transition-transform object-cover aspect-[9/16] w-full"
                          onClick={() => setLightboxImg(getFileUrl(ss))}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex -left-4 shadow-xl" />
                  <CarouselNext className="hidden sm:flex -right-4 shadow-xl" />
                </Carousel>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Description */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
              <div className="space-y-6">
                <div>
                <h3 className="text-xl font-bold mb-3">Description</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{app.description}</p>
              </div>
                </div>

                {app.whatsNew && (
                  <div>
                  <h3 className="text-xl font-bold mb-3">What&apos;s New in v{app.version}</h3>
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.whatsNew}</p>
                  </div>
                </div>
                )}

                {app.versionHistory && app.versionHistory.length > 0 && (
                  <div className="pt-8 mt-8 border-t border-border/50">
                  <h3 className="text-xl font-bold mb-6">Version History</h3>
                    <div className="space-y-6">
                      {app.versionHistory.map((history, idx) => (
                        <div key={idx} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-[-24px] before:w-px before:bg-border last:before:hidden">
                          {/* Timeline Bullet */}
                          <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-background" />

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1 sm:gap-4">
                            <span className="font-bold text-foreground">Version {history.version}</span>
                            <span className="text-xs text-muted-foreground font-medium">{formatDate(history.date)}</span>
                          </div>

                          <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {history.whatsNew ? history.whatsNew : <span className="italic">No release notes provided.</span>}
                          </div>

                          {history.size && (
                            <div className="mt-3 inline-flex items-center text-xs font-medium bg-muted/50 px-2 py-1 rounded text-muted-foreground">
                              <HardDrive className="h-3 w-3 mr-1" /> {history.size}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* App Info Table */}
              <div>
                <h3 className="text-lg font-semibold mb-3">App Info</h3>
                <Card>
                  <CardContent className="p-4 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span className="font-medium">{app.version}</span></div>
                    <Separator />
                    <div className="flex justify-between"><span className="text-muted-foreground">Size</span><span className="font-medium">{app.size}</span></div>
                    <Separator />
                    <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium">{app.category}</span></div>
                    <Separator />
                    <div className="flex justify-between"><span className="text-muted-foreground">Platform</span><span className="font-medium">{plat.label}</span></div>
                    <Separator />
                    <div className="flex justify-between"><span className="text-muted-foreground">Min OS</span><span className="font-medium">{app.minOSVersion || "N/A"}</span></div>
                    <Separator />
                    <div className="flex justify-between"><span className="text-muted-foreground">Updated</span><span className="font-medium">{formatDate(app.updatedAt)}</span></div>
                  </CardContent>
                </Card>

                {app.tags && app.tags.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {app.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* A/B Testing Section */}
            {app.abTestingEnabled && (
              <>
                <Separator className="my-8" />
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 text-center md:text-left flex flex-col md:flex-row items-center gap-6">
                  <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Beaker className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">Help Us Improve {app.name}</h3>
                    <p className="text-muted-foreground">
                      Join the A/B Testing program to get early access to experimental features, help find bugs, and shape the future of this app.
                    </p>
                  </div>
                  <Button size="lg" onClick={handleEnrollClick} className="shrink-0 font-bold whitespace-nowrap">
                    Enroll in A/B Testing
                  </Button>
                </div>
              </>
            )}

            {/* Related Apps */}
            {related.length > 0 && (
              <>
                <Separator className="my-8" />
                <div>
                  <h3 className="text-lg font-semibold mb-4">Related Apps</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {related.map((a) => <AppCard key={a._id} app={a} />)}
                  </div>
                </div>
              </>
            )}
          </div>
      </main>

      <Footer />

      {/* Lightbox */}
      <Dialog open={!!lightboxImg} onOpenChange={() => setLightboxImg(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
          {lightboxImg && (
            <img
              src={lightboxImg}
              alt="Screenshot"
              className="max-h-[90vh] w-auto h-auto rounded-lg shadow-2xl object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* A/B Testing Enrollment Modal */}
      <Dialog open={enrollModalOpen} onOpenChange={setEnrollModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Beaker className="h-5 w-5 text-primary" /> A/B Testing Enrollment</DialogTitle>
            <DialogDescription>
              Please provide your details and accept the terms to join the testing program for <strong className="text-foreground">{app?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEnrollment} className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name (as per Govt ID) *</Label>
                <Input id="fullName" required value={enrollForm.fullName} onChange={(e) => setEnrollForm({...enrollForm, fullName: e.target.value})} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input id="phoneNumber" required value={enrollForm.phoneNumber} onChange={(e) => setEnrollForm({...enrollForm, phoneNumber: e.target.value})} placeholder="+1 234 567 8900" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted text-muted-foreground" />
                <p className="text-xs text-muted-foreground">This email will be used for testing communications.</p>
              </div>
            </div>
            
            <div className="space-y-3 bg-muted/50 p-4 rounded-lg border text-sm">
              <div className="flex items-start gap-2">
                <Checkbox id="term-copy" checked={agreedTerms.copy} onCheckedChange={(c) => setAgreedTerms({...agreedTerms, copy: c})} />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="term-copy" className="font-medium cursor-pointer">I agree not to copy, reverse engineer, or distribute the app.</label>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="term-exploit" checked={agreedTerms.exploit} onCheckedChange={(c) => setAgreedTerms({...agreedTerms, exploit: c})} />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="term-exploit" className="font-medium cursor-pointer">I agree not to exploit vulnerabilities, but to report them immediately.</label>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="term-terms" checked={agreedTerms.terms} onCheckedChange={(c) => setAgreedTerms({...agreedTerms, terms: c})} />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="term-terms" className="font-medium cursor-pointer">I accept the full A/B Testing Terms and Conditions.</label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEnrollModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={enrolling || !agreedTerms.copy || !agreedTerms.exploit || !agreedTerms.terms}>
                {enrolling ? "Enrolling..." : "Submit Enrollment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
