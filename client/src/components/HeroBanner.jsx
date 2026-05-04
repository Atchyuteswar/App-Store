import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as api from "@/services/api";

export default function HeroBanner({ apps }) {
  const navigate = useNavigate();
  const featured = apps[0];

  if (!featured) return null;

  return (
    <section className="container py-4 sm:py-6">
      <div className="relative overflow-hidden rounded-xl bg-primary text-primary-foreground p-6 md:p-12">
        <div className="relative z-10 max-w-2xl space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold">{featured.name}</h1>
          <p className="text-base sm:text-lg opacity-90">{featured.tagline}</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate(`/app/${featured.slug}`)}>
              View Details
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-primary-foreground/10" onClick={() => window.open(api.getFileUrl(featured.apk_file), '_blank')}>
              <Download className="mr-2 h-5 w-5" />
              Download
            </Button>
          </div>
        </div>
        <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden md:block opacity-20">
          <img src={api.getFileUrl(featured.icon)} alt="" className="h-64 w-64 rounded-3xl object-cover" />
        </div>
      </div>
    </section>
  );
}
