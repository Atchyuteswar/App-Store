import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Download, Star, ArrowLeft, Smartphone, Monitor, Globe, Calendar, HardDrive, Tag, Beaker, Zap, Activity, ShieldCheck, ExternalLink, History, Share2, Info, ChevronRight, Layout, Terminal } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
      toast({ title: "Neural Link Required", description: "You must establish a link to request enrollment." });
      navigate("/login", { state: { from: location } });
      return;
    }
    setEnrollModalOpen(true);
  };

  const submitEnrollment = async (e) => {
    e.preventDefault();
    if (!agreedTerms.copy || !agreedTerms.exploit || !agreedTerms.terms) {
      return toast({ variant: "destructive", title: "Protocol Breach", description: "All security terms must be accepted." });
    }
    setEnrolling(true);
    try {
      await enrollAbTesting(app.slug, enrollForm);
      toast({ title: "Clearance Granted", description: "Your enrollment has been successfully registered." });
      setEnrollModalOpen(false);
    } catch (err) {
      toast({ variant: "destructive", title: "Entry Failed", description: err.response?.data?.message || "Enrollment protocol rejected." });
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
      <div className="min-h-screen flex flex-col bg-[#050505]">
        <Navbar />
        <div className="container py-20 space-y-12 animate-pulse">
          <div className="flex flex-col md:flex-row gap-12">
            <Skeleton className="h-40 w-40 rounded-[2.5rem] bg-white/5" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-12 w-3/4 bg-white/5" />
              <Skeleton className="h-6 w-1/2 bg-white/5" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-full rounded-[3rem] bg-white/5" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen flex flex-col bg-[#050505]">
        <Navbar />
        <div className="container py-40 flex-1 text-center space-y-8">
          <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
            <Info className="h-10 w-10 text-white/20" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter uppercase text-premium">Archive Not Found</h2>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">The requested experimental node does not exist</p>
          </div>
          <Button asChild className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest transition-all hover:scale-105"><Link to="/">Return to Hub</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const plat = platformInfo[app.platform] || platformInfo.android;

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] selection:bg-primary/30 text-white">
      <Navbar />

      <main className="flex-1 overflow-hidden relative">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 right-0 h-[800px] w-[800px] bg-primary/5 blur-[160px] rounded-full -mr-96 -mt-96 pointer-events-none" />
        <div className="absolute top-1/2 left-0 h-[600px] w-[600px] bg-blue-500/5 blur-[140px] rounded-full -ml-80 -mt-80 pointer-events-none" />

        <div className="container py-12 relative z-10">
          {/* Back Navigation */}
          <Link to="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all mb-12 group">
            <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-primary/50 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Central Registry
          </Link>

          {/* Premium Header Architecture */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 mb-20 animate-in fade-in slide-in-from-top-12 duration-1000">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10 text-center sm:text-left">
              {app.icon ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="relative z-10 h-36 w-36 md:h-44 md:w-44 rounded-[3rem] bg-[#0f0f0f] border border-white/10 p-2 shadow-2xl group-hover:border-primary/50 transition-all duration-700">
                    <img src={getFileUrl(app.icon)} alt={app.name} className="h-full w-full object-cover rounded-[2.5rem]" />
                  </div>
                </div>
              ) : (
                <div className="h-36 w-36 md:h-44 md:w-44 rounded-[3rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl">
                  <span className="text-6xl font-black text-white/10">{app.name[0]}</span>
                </div>
              )}
              
              <div className="flex flex-col justify-center pt-2 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-4 h-7">Live Node</Badge>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{app.category}</span>
                  </div>
                  <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-premium uppercase leading-[0.9]">{app.name}</h1>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] flex items-center justify-center sm:justify-start gap-3">
                    <Terminal className="h-3.5 w-3.5" />
                    ARCHITECT: Atchyuteswar Gottumukkala
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-10">
                  <div className="flex flex-col items-center sm:items-start">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg font-black text-white">4.{app.rating % 10 || 9}</span>
                      <Star className="h-4 w-4 fill-primary text-primary" />
                    </div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Global Performance</span>
                  </div>
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-lg font-black text-white">{app.downloads}+</span>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Telemetry Syncs</span>
                  </div>
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-lg font-black text-white uppercase">{plat.label}</span>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Environment Node</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-4 pt-6">
              <Button asChild className="w-full md:w-[280px] h-20 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] shadow-[0_0_50px_-10px_rgba(34,197,94,0.5)] transition-all hover:scale-[1.02] active:scale-95 text-base relative overflow-hidden group/btn">
                <a href={getDownloadUrl(app.slug)}>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                  <Download className="h-6 w-6 mr-4 relative z-10" /> 
                  <span className="relative z-10">Initialize Sync</span>
                </a>
              </Button>
              <div className="flex items-center justify-between px-2">
                <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">Payload: {app.size}</span>
                <div className="h-1 w-1 rounded-full bg-white/10" />
                <span className="text-[9px] font-black text-white/10 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" /> Encrypted
                </span>
              </div>
            </div>
          </div>

          {/* Visual Evidence Showcase */}
          <div className="space-y-8 mb-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            <div className="flex items-end justify-between border-b border-white/5 pb-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tighter text-premium uppercase">Interface Archive</h3>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Interaction paradigms and visual architecture</p>
              </div>
              <div className="flex gap-3">
                <Badge className="bg-white/5 text-white/30 border-white/10 text-[9px] font-black h-7">RECOGNITION: UHD</Badge>
              </div>
            </div>
            
            <div className="relative px-1">
              <Carousel className="w-full" opts={{ align: "start" }}>
                <CarouselContent className="-ml-8">
                  {app.video_url && (
                    <CarouselItem className="pl-8 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                      <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 aspect-[9/16] bg-black group shadow-2xl">
                        <video
                          src={getFileUrl(app.video_url)}
                          controls
                          className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000"
                          poster={app.screenshots?.[0] ? getFileUrl(app.screenshots[0]) : ""}
                        />
                        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10" />
                        <div className="absolute top-6 left-6 h-10 w-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-primary animate-pulse" />
                        </div>
                      </div>
                    </CarouselItem>
                  )}
                  {app.screenshots && app.screenshots.filter(ss => ss && typeof ss === 'string').map((ss, i) => (
                    <CarouselItem key={i} className="pl-8 basis-[75%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                      <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 aspect-[9/16] group shadow-2xl cursor-pointer" onClick={() => setLightboxImg(getFileUrl(ss))}>
                        <img
                          src={getFileUrl(ss)}
                          alt={`Screenshot ${i + 1}`}
                          className="w-full h-full object-cover transition-all duration-1000 grayscale-[60%] group-hover:grayscale-0 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-primary/40 transition-all duration-1000" />
                        <div className="absolute bottom-6 right-6 h-10 w-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                          <Layout className="h-5 w-5 text-white/40" />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex -left-6 h-14 w-14 bg-black/80 backdrop-blur-md border-white/10 text-white/40 hover:text-white hover:border-primary/50 transition-all shadow-2xl" />
                <CarouselNext className="hidden sm:flex -right-6 h-14 w-14 bg-black/80 backdrop-blur-md border-white/10 text-white/40 hover:text-white hover:border-primary/50 transition-all shadow-2xl" />
              </Carousel>
            </div>
          </div>

          {/* Technical Data Mesh */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-24 mb-32">
            <div className="space-y-20">
              <section className="space-y-8 animate-in fade-in duration-1000 delay-300">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-black tracking-tighter text-premium uppercase">Manifesto</h3>
                  <div className="h-[1px] flex-1 bg-white/5" />
                </div>
                <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-base font-medium text-white/50 leading-loose italic">
                    "{app.description}"
                  </p>
                </div>
              </section>

              {app.whatsNew && (
                <section className="space-y-8 animate-in fade-in duration-1000 delay-400">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-black tracking-tighter text-premium uppercase">Revision Logs (v{app.version})</h3>
                    <div className="h-[1px] flex-1 bg-white/5" />
                  </div>
                  <div className="p-10 rounded-[3rem] bg-black/40 border border-white/5 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 h-32 w-32 bg-blue-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-xs text-white/40 whitespace-pre-wrap font-mono leading-[2.2] group-hover:text-white/60 transition-colors">
                      {app.whatsNew}
                    </p>
                  </div>
                </section>
              )}

              {/* Version Matrix */}
              {app.versionHistory && app.versionHistory.length > 0 && (
                <section className="space-y-10 animate-in fade-in duration-1000 delay-500">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-black tracking-tighter text-premium uppercase">Historical Mesh</h3>
                    <div className="h-[1px] flex-1 bg-white/5" />
                  </div>
                  <div className="space-y-12 relative before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-[2px] before:bg-white/5">
                    {app.versionHistory.map((history, idx) => (
                      <div key={idx} className="relative pl-14 group">
                        <div className="absolute left-0 top-2 h-8 w-8 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-700 z-10 shadow-xl">
                          <div className="h-2 w-2 rounded-full bg-white/10 group-hover:bg-primary transition-all duration-700 shadow-[0_0_8px_rgba(34,197,94,0)] group-hover:shadow-[0_0_8px_rgba(34,197,94,1)]" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-4">
                            <span className="font-black text-sm uppercase tracking-[0.2em] text-white">REVISION {history.version}</span>
                            {idx === 0 && <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black h-5 px-2">CURRENT</Badge>}
                          </div>
                          <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">{formatDate(history.date)}</span>
                        </div>
                        <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-all">
                          <p className="text-xs text-white/30 leading-loose font-medium mb-6">
                            {history.whatsNew || "No technical telemetry logs for this revision."}
                          </p>
                          {history.size && (
                            <div className="inline-flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-4 h-8 rounded-full border border-primary/10 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]">
                              <HardDrive className="h-3.5 w-3.5 mr-3" /> {history.size}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Side Parameter Mesh */}
            <div className="space-y-16">
              <section className="space-y-8 animate-in fade-in duration-1000 delay-600">
                <h3 className="text-[10px] font-black tracking-[0.4em] text-white/20 uppercase ml-2">NODE PARAMETERS</h3>
                <div className="rounded-[2.5rem] bg-black/40 border border-white/5 p-10 space-y-8 backdrop-blur-md shadow-2xl shadow-primary/5">
                  {[
                    { label: "Designation", value: app.version },
                    { label: "Data Payload", value: app.size },
                    { label: "Core Category", value: app.category.toUpperCase() },
                    { label: "Environment", value: plat.label.toUpperCase() },
                    { label: "Min Kernel", value: (app.minOSVersion || "N/A").toUpperCase() },
                    { label: "Last Sync", value: formatDate(app.updatedAt).toUpperCase() }
                  ].map((param, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex justify-between items-center group/param">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest group-hover/param:text-white/40 transition-colors">{param.label}</span>
                        <span className="font-black text-xs text-white tracking-widest">{param.value}</span>
                      </div>
                      {i < 5 && <div className="h-[1px] w-full bg-white/5" />}
                    </div>
                  ))}
                </div>
              </section>

              {app.tags && app.tags.length > 0 && (
                <section className="space-y-8 animate-in fade-in duration-1000 delay-700">
                  <h3 className="text-[10px] font-black tracking-[0.4em] text-white/20 uppercase ml-2">TAG MATRIX</h3>
                  <div className="flex flex-wrap gap-3">
                    {app.tags.map((tag) => (
                      <Badge key={tag} className="bg-white/5 text-white/30 border-white/10 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all text-[9px] font-black uppercase tracking-widest px-4 h-9 rounded-xl">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-8 animate-in fade-in duration-1000 delay-800">
                <h3 className="text-[10px] font-black tracking-[0.4em] text-white/20 uppercase ml-2">COMMUNICATIONS</h3>
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/[0.08] transition-all cursor-pointer group">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/50 transition-all duration-500">
                      <Share2 className="h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Share Archive</p>
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Broadcast node coordinates</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Research Enrollment Section */}
          {app.abTestingEnabled && (
            <div className="mb-40 animate-in fade-in slide-in-from-bottom-20 duration-1000">
              <div className="relative overflow-hidden rounded-[4rem] bg-black border border-white/5 p-12 md:p-24 flex flex-col lg:flex-row items-center gap-16 group shadow-2xl">
                <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-primary/10 blur-[160px] rounded-full -mr-80 -mt-80 pointer-events-none group-hover:bg-primary/20 transition-all duration-1000" />
                <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-blue-500/5 blur-[120px] rounded-full -ml-60 -mb-60 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-1000" />
                
                <div className="relative z-10 h-32 w-32 rounded-[3rem] bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 shadow-[0_0_60px_-10px_rgba(34,197,94,0.4)]">
                  <Beaker className="h-14 w-14 text-primary" />
                </div>
                
                <div className="relative z-10 flex-1 text-center lg:text-left space-y-6">
                  <div className="space-y-4">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] px-4 h-7">PIONEER INITIATIVE</Badge>
                    <h3 className="text-4xl md:text-6xl font-black tracking-tighter text-premium uppercase leading-[0.9]">Request Research Entry</h3>
                    <p className="text-sm text-white/40 font-medium leading-[2.2] max-w-2xl italic">
                      Gain prioritized access to unreleased architectural revisions for {app.name}. Help shape the technical future of this experiment through the research console.
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handleEnrollClick}
                    className="h-20 px-14 rounded-[1.5rem] bg-white text-black hover:bg-white/90 font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 mt-6 shadow-2xl"
                  >
                    Establish Pioneer Link
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Related Explorations */}
          {related.length > 0 && (
            <div className="mb-20 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500">
              <div className="flex items-end justify-between mb-12">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tighter text-premium uppercase">Adjacent Nodes</h3>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Related experimental archives in the registry</p>
                </div>
                <Link to="/" className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-white flex items-center gap-2 transition-all">
                  Registry Root <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {related.map((a) => (
                  <AppCard key={a._id} app={a} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Lightbox Protocol */}
      <Dialog open={!!lightboxImg} onOpenChange={() => setLightboxImg(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center animate-in zoom-in duration-500">
          <div className="relative w-full h-full flex items-center justify-center p-12">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl -z-10" />
            <img src={lightboxImg} className="max-w-full max-h-full object-contain rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5" alt="Preview" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Enrollment Protocol Modal */}
      <Dialog open={enrollModalOpen} onOpenChange={setEnrollModalOpen}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white p-0 max-w-lg rounded-[3rem] overflow-hidden shadow-[0_0_100px_-20px_rgba(34,197,94,0.3)]">
          <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
          
          <DialogHeader className="p-12 border-b border-white/5 relative z-10">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl">
                <Beaker className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black h-5 uppercase tracking-widest px-3">Protocol Initialized</Badge>
                <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-tight">Request Clearance</DialogTitle>
                <DialogDescription className="text-white/30 font-black uppercase tracking-[0.2em] text-[8px]">Submit credentials for experiment authorization</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={submitEnrollment} className="p-12 space-y-10 relative z-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">IDENTIFIER NAME</Label>
                <Input 
                  value={enrollForm.fullName} 
                  onChange={(e) => setEnrollForm({...enrollForm, fullName: e.target.value})} 
                  placeholder="FULL LEGAL DESIGNATION" 
                  className="h-16 bg-white/5 border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white placeholder:text-white/5 focus-visible:ring-0 px-8 transition-all focus:bg-white/[0.08]"
                  required 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">SYNC CHANNEL (PHONE)</Label>
                <Input 
                  value={enrollForm.phoneNumber} 
                  onChange={(e) => setEnrollForm({...enrollForm, phoneNumber: e.target.value})} 
                  placeholder="+X (XXX) XXX-XXXX" 
                  className="h-16 bg-white/5 border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white placeholder:text-white/5 focus-visible:ring-0 px-8 transition-all focus:bg-white/[0.08]"
                  required 
                />
              </div>
            </div>

            <div className="space-y-6 bg-black/60 p-8 rounded-[2rem] border border-white/5 shadow-inner">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-2">SECURITY PROTOCOLS</p>
              {[
                { id: "copy", label: "I acknowledge that duplication of this build is a breach of security.", key: "copy" },
                { id: "exploit", label: "I will report all discovered vulnerabilities via the research node.", key: "exploit" },
                { id: "terms", label: "I accept the General Research Service Protocols (v2.4).", key: "terms" }
              ].map((term) => (
                <div key={term.id} className="flex items-start space-x-4 group/check">
                  <Checkbox 
                    id={term.id} 
                    checked={agreedTerms[term.key]} 
                    onCheckedChange={(val) => setAgreedTerms({...agreedTerms, [term.key]: !!val})} 
                    className="mt-1 border-white/10 data-[state=checked]:bg-primary h-5 w-5 rounded-lg transition-all" 
                  />
                  <Label htmlFor={term.id} className="text-[10px] text-white/30 leading-relaxed font-black uppercase tracking-wider group-hover/check:text-white/50 transition-colors cursor-pointer">{term.label}</Label>
                </div>
              ))}
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-4">
              <Button 
                type="submit" 
                disabled={enrolling} 
                className="w-full h-18 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_-10px_rgba(34,197,94,0.6)] transition-all hover:scale-[1.02] active:scale-95"
              >
                {enrolling ? (
                  <>
                    <Activity className="h-5 w-5 mr-3 animate-pulse" />
                    Initializing clearance...
                  </>
                ) : "Request Entry Clearance"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEnrollModalOpen(false)} className="w-full text-[10px] text-white/20 font-black uppercase tracking-widest hover:text-white transition-all h-12">Abort Initialization</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
