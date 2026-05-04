import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { getFileUrl, getDownloadUrl } from "@/services/api";
import { useRef } from "react";

export default function HeroBanner({ apps }) {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  if (!apps || apps.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container">
        <Carousel plugins={[plugin.current]} className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {apps.map((app) => (
              <CarouselItem key={app._id}>
                <div className="rounded-xl border bg-card p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                  {/* Icon */}
                  <div className="shrink-0">
                    {app.icon ? (
                      <img
                        src={getFileUrl(app.icon)}
                        alt={app.name}
                        className="h-28 w-28 md:h-36 md:w-36 rounded-2xl object-cover shadow-md"
                      />
                    ) : (
                      <div className="h-28 w-28 md:h-36 md:w-36 rounded-2xl bg-muted flex items-center justify-center">
                        <span className="text-4xl font-bold text-muted-foreground">{app.name?.[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{app.name}</h2>
                    <p className="text-lg text-muted-foreground mt-1">{app.tagline}</p>
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2 max-w-lg">
                      {app.description}
                    </p>
                    <div className="mt-6 flex gap-3 justify-center md:justify-start">
                      <Button asChild size="lg">
                        <a href={getDownloadUrl(app.slug)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link to={`/app/${app.slug}`}>Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {apps.length > 1 && (
            <>
              <CarouselPrevious className="hidden md:flex -left-4" />
              <CarouselNext className="hidden md:flex -right-4" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
}
