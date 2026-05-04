import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Star } from "lucide-react";
import { getFileUrl, getDownloadUrl } from "@/services/api";

export default function AppModal({ app, open, onOpenChange }) {
  if (!app) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {app.icon ? (
              <img src={getFileUrl(app.icon)} alt={app.name} className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground">{app.name?.[0]}</span>
              </div>
            )}
            <div>
              <DialogTitle>{app.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{app.tagline}</p>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{app.category}</Badge>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              {app.rating?.toFixed(1)}
            </div>
            <span className="text-sm text-muted-foreground">{app.downloads} downloads</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-4">{app.description}</p>
          <Button asChild className="w-full">
            <a href={getDownloadUrl(app.slug)}>
              <Download className="h-4 w-4 mr-2" /> Download ({app.size})
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
