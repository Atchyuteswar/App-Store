import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ChevronRight, Star } from "lucide-react";
import * as api from "@/services/api";

export default function HeroBanner({ apps }) {
  const navigate = useNavigate();
  const featured = apps[0]; // Take the most recent featured app

  if (!featured) return null;

  return (
    <section className="container py-8 md:py-12">
      <div className="relative overflow-hidden rounded-[2rem] premium-gradient text-white shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Star className="h-64 w-64 animate-float" />
        </div>
        
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center p-8 md:p-16">
          <div className="space-y-6">
            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md px-4 py-1">
              Editor's Choice
            </Badge>
            
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                {featured.name}
              </h1>
              <p className="text-lg md:text-xl text-white/70 max-w-md">
                {featured.tagline}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-white/90 rounded-full px-8"
                onClick={() => navigate(`/app/${featured.slug}`)}
              >
                View Details
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full px-8 backdrop-blur-md"
                onClick={() => window.open(api.getFileUrl(featured.apk_file), '_blank')}
              >
                <Download className="mr-2 h-5 w-5" />
                Quick Install
              </Button>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="relative w-64 h-64 md:w-80 md:h-80 group">
              <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-700" />
              <img 
                src={api.getFileUrl(featured.icon)} 
                alt={featured.name}
                className="relative z-10 w-full h-full object-cover rounded-[3rem] shadow-2xl animate-float border-4 border-white/10"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
