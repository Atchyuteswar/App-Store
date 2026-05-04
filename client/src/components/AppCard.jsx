import { useNavigate } from "react-router-dom";
import { Star, Download, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as api from "@/services/api";

export default function AppCard({ app }) {
  const navigate = useNavigate();

  return (
    <Card 
      className="group overflow-hidden border-none bg-secondary/50 hover:bg-secondary transition-all duration-500 hover:scale-[1.02] cursor-pointer rounded-[2rem]"
      onClick={() => navigate(`/app/${app.slug}`)}
    >
      <CardContent className="p-5 space-y-4">
        <div className="flex gap-4">
          <div className="relative shrink-0">
            <img 
              src={api.getFileUrl(app.icon)} 
              alt={app.name}
              className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl object-cover shadow-lg group-hover:shadow-xl transition-shadow duration-500"
            />
            {app.featured && (
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-500 rounded-full border-2 border-background shadow-sm" />
            )}
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors">
              {app.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate mb-1">
              {app.tagline}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] px-2 py-0 h-4 bg-muted/50">
                {app.category}
              </Badge>
              <span className="flex items-center text-[10px] text-muted-foreground">
                <Star className="h-2 w-2 mr-0.5 fill-yellow-500 text-yellow-500" />
                4.9
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-medium flex items-center">
              <ShieldCheck className="h-3 w-3 mr-1 text-green-500" />
              Verified
            </span>
            <span className="text-xs font-bold">{app.size}</span>
          </div>
          <Button 
            size="sm" 
            className="rounded-full px-6 h-8 bg-primary hover:bg-primary/90 text-[10px] font-bold"
            onClick={(e) => {
              e.stopPropagation();
              window.open(api.getFileUrl(app.apk_file), '_blank');
            }}
          >
            GET
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
