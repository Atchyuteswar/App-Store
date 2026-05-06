import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTesterNotifications, markTesterNotificationRead } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bell, 
  CheckCheck, 
  Package, 
  Bug, 
  MessageSquare, 
  Lightbulb, 
  Megaphone,
  ChevronRight,
  Clock,
  Inbox
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const typeConfig = {
  version_release: { icon: Package, color: "text-green-500", bg: "bg-green-500/10", path: "/tester/apps" },
  bug_update: { icon: Bug, color: "text-red-500", bg: "bg-red-500/10", path: "/tester/bugs" },
  message_reply: { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10", path: "/tester/messages" },
  idea_update: { icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10", path: "/tester/ideas" },
  broadcast: { icon: Megaphone, color: "text-purple-500", bg: "bg-purple-500/10", path: "/tester/dashboard" },
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await getTesterNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, path) => {
    try {
      await markTesterNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      if (path) navigate(path);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      // In a real app, we'd have an API endpoint for this
      // For now, loop through unread
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => markTesterNotificationRead(n.id)));
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <NotificationSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with the latest activity from your beta programs.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-none shadow-sm bg-card hover:bg-muted"
          onClick={markAllRead}
          disabled={!notifications.some(n => !n.is_read)}
        >
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-6 bg-muted/20 rounded-full">
                <Inbox className="h-12 w-12 text-muted-foreground opacity-20" />
              </div>
              <div>
                <h3 className="text-xl font-bold">All caught up!</h3>
                <p className="text-muted-foreground max-w-xs mt-1">
                  You don't have any notifications right now. We'll alert you when there's news.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-muted/10">
              {notifications.map((note) => {
                const config = typeConfig[note.type] || typeConfig.broadcast;
                const Icon = config.icon;
                
                return (
                  <div 
                    key={note.id}
                    onClick={() => handleMarkAsRead(note.id, config.path)}
                    className={cn(
                      "p-6 flex items-start gap-6 hover:bg-muted/30 transition-all cursor-pointer relative group",
                      !note.is_read && "bg-primary/5"
                    )}
                  >
                    {!note.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    
                    <div className={cn("p-3 rounded-2xl shrink-0 shadow-sm transition-transform group-hover:scale-110", config.bg)}>
                      <Icon className={cn("h-6 w-6", config.color)} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className={cn(
                          "text-base tracking-tight",
                          !note.is_read ? "font-bold" : "font-medium text-muted-foreground"
                        )}>
                          {note.title}
                        </h4>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {note.message}
                      </p>
                    </div>

                    <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-md" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
