import { Link } from "react-router-dom";
import { Star, Download, Smartphone, Monitor, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFileUrl } from "@/services/api";

const platformIcon = {
  android: <Smartphone className="h-3 w-3" />,
  ios: <Monitor className="h-3 w-3" />,
  both: <Globe className="h-3 w-3" />,
};

const platformLabel = { android: "Android", ios: "iOS", both: "Both" };

export default function AppCard({ app }) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Icon */}
          <div className="shrink-0">
            {app.icon ? (
              <img
                src={getFileUrl(app.icon)}
                alt={app.name}
                className="h-16 w-16 rounded-xl object-cover shadow-sm"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground">
                  {app.name?.[0] || "A"}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{app.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{app.tagline}</p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {app.category}
              </Badge>
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span>{app.rating?.toFixed(1) || "0.0"}</span>
              </div>
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Download className="h-3 w-3" />
                <span>{app.downloads || 0}</span>
              </div>
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                {platformIcon[app.platform] || platformIcon.android}
                <span>{platformLabel[app.platform] || "Android"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="mt-4">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to={`/app/${app.slug}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
