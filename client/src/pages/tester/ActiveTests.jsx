import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTesterEnrollments, getFileUrl } from "@/services/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ArrowRight, Smartphone, Monitor, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const platformInfo = {
  android: { icon: <Smartphone className="h-3 w-3 mr-1" />, label: "Android" },
  ios: { icon: <Monitor className="h-3 w-3 mr-1" />, label: "iOS" },
  both: { icon: <Globe className="h-3 w-3 mr-1" />, label: "Android & iOS" },
};

export default function ActiveTests() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const { data } = await getTesterEnrollments();
      setEnrollments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Active Tests</h1>
          <p className="text-muted-foreground">Apps you are currently helping test.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Active Tests</h1>
        <p className="text-muted-foreground text-lg">
          Select an app to enter its Testing Hub, report bugs, and share feedback.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed rounded-2xl bg-muted/20">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Active Tests</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            You haven't enrolled in any testing programs yet. Browse the store and look for apps with A/B Testing enabled to join.
          </p>
          <Link to="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Browse Apps
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => {
            const app = enrollment.app;
            const plat = platformInfo[app.platform] || platformInfo.android;

            return (
              <Card key={enrollment.id} className="overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                <div className="h-32 bg-muted relative overflow-hidden flex shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  {app.icon ? (
                    <>
                      <img src={getFileUrl(app.icon)} alt="" className="w-full h-full object-cover blur-sm opacity-50 scale-110 group-hover:scale-125 transition-transform duration-500" />
                      <div className="absolute inset-0 z-20 flex items-end p-4">
                        <img src={getFileUrl(app.icon)} alt={app.name} className="h-16 w-16 rounded-xl shadow-lg border-2 border-white/20 object-cover" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Package className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-20">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-none shadow-sm text-xs">
                      v{app.version}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h3 className="font-bold text-lg truncate" title={app.name}>{app.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {app.tagline}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-auto">
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold text-muted-foreground">
                      {app.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold flex items-center text-muted-foreground">
                      {plat.icon} {plat.label}
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 border-t mt-auto">
                  <Link 
                    to={`/tester/apps/${app.slug}`} 
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors py-2 rounded-md text-sm font-semibold"
                  >
                    Enter Testing Hub <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
