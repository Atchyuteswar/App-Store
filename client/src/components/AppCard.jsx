import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import * as api from "@/services/api";

export default function AppCard({ app }) {
  const navigate = useNavigate();

  return (
    <div 
      className="group cursor-pointer p-2 rounded-2xl hover:bg-secondary/50 transition-colors"
      onClick={() => navigate(`/app/${app.slug}`)}
    >
      <div className="aspect-square relative mb-3">
        <img 
          src={api.getFileUrl(app.icon || app.iconUrl)} 
          alt={app.name}
          className="w-full h-full rounded-[20%] object-cover shadow-sm group-hover:shadow-md transition-shadow duration-300"
        />
        {app.featured && (
          <div className="absolute top-2 right-2 h-2.5 w-2.5 bg-primary rounded-full border-2 border-background" />
        )}
      </div>
      
      <div className="space-y-0.5 px-1">
        <h3 className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
          {app.name}
        </h3>
        <p className="text-[12px] text-muted-foreground truncate">
          {app.category}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <span>4.9</span>
          <Star className="h-2.5 w-2.5 fill-current" />
          <span className="opacity-50">•</span>
          <span>{app.size}</span>
        </div>
      </div>
    </div>
  );
}
