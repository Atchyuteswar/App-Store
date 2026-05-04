import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, Star, ArrowLeft, Smartphone, Monitor, Globe, Calendar, HardDrive, Tag } from "lucide-react";
import { getAppBySlug, getFileUrl, getDownloadUrl, getApps } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  const [app, setApp] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);

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
          <div className="grid md:grid-cols-[1fr_1.5fr] gap-8">
            {/* Left column */}
            <div className="space-y-6">
              <div className="flex items-start gap-5">
                {app.icon ? (
                  <img src={getFileUrl(app.icon)} alt={app.name} className="h-24 w-24 rounded-2xl object-cover shadow-md" />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center">
                    <span className="text-3xl font-bold text-muted-foreground">{app.name[0]}</span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{app.name}</h1>
                  <p className="text-muted-foreground text-sm mt-0.5">by Atchyuteswar Gottumukkala</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-4 w-4 ${s <= Math.round(app.rating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}`} />
                      ))}
                      <span className="text-sm ml-1">{app.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" />{app.downloads}</span>
                    <span className="flex items-center gap-1">{plat.icon}{plat.label}</span>
                  </div>
                </div>
              </div>

              <Button asChild size="lg" className="w-full">
                <a href={getDownloadUrl(app.slug)}>
                  <Download className="h-5 w-5 mr-2" /> Download ({app.size})
                </a>
              </Button>
            </div>

            {/* Right column - Screenshots */}
            {app.screenshots && app.screenshots.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Screenshots</h3>
                <Carousel className="w-full" opts={{ align: "start" }}>
                  <CarouselContent className="-ml-2">
                    {app.screenshots.map((ss, i) => (
                      <CarouselItem key={i} className="pl-2 basis-1/2 md:basis-1/3">
                        <img
                          src={getFileUrl(ss)}
                          alt={`Screenshot ${i + 1}`}
                          className="rounded-lg border cursor-pointer hover:opacity-90 transition-opacity object-cover aspect-[9/16] w-full"
                          onClick={() => setLightboxImg(getFileUrl(ss))}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="-left-3" />
                  <CarouselNext className="-right-3" />
                </Carousel>
              </div>
            )}
          </div>

          <Separator className="my-8" />

          {/* Description */}
          <div className="grid md:grid-cols-[2fr_1fr] gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <ScrollArea className="max-h-80">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{app.description}</p>
                </ScrollArea>
              </div>

              {app.whatsNew && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">What&apos;s New</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.whatsNew}</p>
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
        <DialogContent className="max-w-3xl p-2">
          {lightboxImg && <img src={lightboxImg} alt="Screenshot" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
