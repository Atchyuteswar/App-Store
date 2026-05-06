import { useState, useEffect, useRef } from "react";
import { getTesterEnrollments, getTesterMessages, addTesterMessage } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageSquare, 
  Send, 
  Package, 
  User, 
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function MessageCenter() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    if (selectedApp) {
      fetchMessages(selectedApp.slug);
      setShowMobileSidebar(false);
    }
  }, [selectedApp]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchEnrollments = async () => {
    try {
      const { data } = await getTesterEnrollments();
      setEnrollments(data || []);
      if (data?.length > 0 && !selectedApp) {
        // Don't auto-select on mobile to show sidebar first
        if (window.innerWidth >= 768) {
          setSelectedApp(data[0].app);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (slug) => {
    setMsgLoading(true);
    try {
      const { data } = await getTesterMessages(slug);
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedApp) return;

    const content = newMessage;
    setNewMessage("");

    try {
      await addTesterMessage(selectedApp.slug, { message: content });
      fetchMessages(selectedApp.slug);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEnrollments = enrollments.filter(e => 
    e.app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <ChatSkeleton />;

  return (
    <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)] flex overflow-hidden border rounded-2xl shadow-xl bg-card/50 backdrop-blur-md animate-in fade-in duration-500">
      
      {/* App List (Sidebar) */}
      <div className={cn(
        "w-full md:w-80 flex flex-col border-r bg-muted/10 shrink-0",
        !showMobileSidebar && "hidden md:flex"
      )}>
        <div className="p-4 border-b bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search apps..." 
              className="pl-9 h-10 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredEnrollments.map((enroll) => (
            <button
              key={enroll.id}
              onClick={() => setSelectedApp(enroll.app)}
              className={cn(
                "w-full p-4 flex items-center gap-4 transition-all hover:bg-muted/50 text-left border-b last:border-0",
                selectedApp?.id === enroll.app.id ? "bg-primary/10 border-r-4 border-r-primary" : ""
              )}
            >
              <div className="h-12 w-12 rounded-xl bg-background border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {enroll.app.icon ? (
                  <img src={enroll.app.icon} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm truncate">{enroll.app.name}</h4>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {format(new Date(enroll.created_at), "MMM d")}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground truncate italic">
                    Start a conversation...
                  </p>
                  {/* Mock Unread Badge */}
                  {Math.random() > 0.8 && (
                    <Badge className="h-4 w-4 p-0 flex items-center justify-center bg-green-600 border-none scale-90">
                      1
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
          {filteredEnrollments.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">No apps found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 bg-background/30",
        showMobileSidebar && "hidden md:flex"
      )}>
        {selectedApp ? (
          <>
            {/* Chat Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b bg-card/80 backdrop-blur-sm z-10 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden -ml-2"
                  onClick={() => setShowMobileSidebar(true)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-10 w-10 rounded-lg bg-muted border flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                  {selectedApp.icon ? (
                    <img src={selectedApp.icon} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{selectedApp.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dev Team Online</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </header>

            {/* Messages Feed */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed"
            >
              {msgLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-3/4 rounded-2xl" />
                  <Skeleton className="h-12 w-1/2 rounded-2xl ml-auto" />
                  <Skeleton className="h-12 w-2/3 rounded-2xl" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="p-4 bg-primary/5 rounded-full mb-4">
                    <MessageSquare className="h-12 w-12 text-primary opacity-20" />
                  </div>
                  <h4 className="font-bold">No messages yet</h4>
                  <p className="text-sm text-muted-foreground max-w-xs mt-2">
                    Send a message to the developers of <strong>{selectedApp.name}</strong> to get started.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isOwn = msg.user?.username === user?.username;
                  return (
                    <div key={msg.id} className={cn(
                      "flex flex-col max-w-[85%] md:max-w-[70%]",
                      isOwn ? "ml-auto items-end" : "items-start"
                    )}>
                      {!isOwn && (
                        <span className="text-[10px] font-bold text-muted-foreground mb-1 ml-3 uppercase tracking-tighter">
                          Admin Team
                        </span>
                      )}
                      <div className={cn(
                        "p-3.5 rounded-2xl shadow-sm relative group transition-all",
                        isOwn 
                          ? "bg-green-600 text-white rounded-tr-none" 
                          : "bg-card border rounded-tl-none"
                      )}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        <div className={cn(
                          "flex items-center gap-1.5 mt-2",
                          isOwn ? "justify-end text-green-200" : "text-muted-foreground"
                        )}>
                          <span className="text-[9px] font-medium">
                            {format(new Date(msg.created_at), "h:mm a")}
                          </span>
                          {isOwn && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card/80 backdrop-blur-sm border-t z-10 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-3 max-w-5xl mx-auto">
                <div className="flex-1 relative">
                  <Input 
                    placeholder={`Message ${selectedApp.name} team...`} 
                    className="h-12 bg-muted/30 border-none focus-visible:ring-primary rounded-xl px-4 text-sm"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-12 w-12 bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shrink-0"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground opacity-10 mb-4" />
            <h3 className="text-lg font-bold">Select a Conversation</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Choose an application from the list to start messaging the development team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="h-[calc(100vh-14rem)] flex overflow-hidden border rounded-2xl animate-pulse">
      <div className="w-80 border-r bg-muted/10 p-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col p-6 space-y-6">
        <Skeleton className="h-12 w-1/3 rounded-xl" />
        <div className="flex-1 flex flex-col gap-4">
          <Skeleton className="h-20 w-3/4 rounded-2xl" />
          <Skeleton className="h-20 w-2/3 rounded-2xl ml-auto" />
          <Skeleton className="h-20 w-1/2 rounded-2xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl mt-auto" />
      </div>
    </div>
  );
}
