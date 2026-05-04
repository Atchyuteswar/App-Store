import { useNavigate } from "react-router-dom";
import { Star, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as api from "@/services/api";

export default function AppCard({ app }) {
  const navigate = useNavigate();

  return (
    <Card 
      className="group overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/app/${app.slug}`)}
    >
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-4">
          <img 
            src={api.getFileUrl(app.icon || app.iconUrl)} 
            alt={app.name}
            className="h-16 w-16 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{app.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{app.tagline}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px] h-4">
                {app.category}
              </Badge>
              <span className="flex items-center text-[10px] text-muted-foreground">
                <Star className="h-2 w-2 mr-0.5 fill-yellow-500 text-yellow-500" />
                0.0
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">{app.size}</span>
          <Button 
            size="sm" 
            variant="outline"
            className="h-8"
            onClick={(e) => {
              e.stopPropagation();
              const url = app.apk_file || app.apkFile;
              if (url) window.open(api.getFileUrl(url), '_blank');
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            Install
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
