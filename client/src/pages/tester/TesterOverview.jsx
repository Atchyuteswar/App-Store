import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getTesterEnrollments } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Beaker, AlertCircle, Package, ArrowRight } from "lucide-react";

export default function TesterOverview() {
  const { user } = useAuth();
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
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8 shadow-sm">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {user?.username}!</h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Thank you for being part of our testing community. Your feedback helps developers build better apps.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <Beaker className="absolute right-8 -bottom-8 h-48 w-48 text-primary/10 -rotate-12 pointer-events-none" />
      </div>

      {/* Stats / Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Recent Testing Programs</CardTitle>
                <CardDescription>Apps you have recently joined to test</CardDescription>
              </div>
              <Link to="/tester/active" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed rounded-xl bg-muted/20">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">No enrollments found</p>
                  <p className="text-xs text-muted-foreground mt-1">Explore the store and join a testing program.</p>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  {enrollments.slice(0, 3).map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 border overflow-hidden">
                        {enrollment.app.icon ? (
                          <img src={enrollment.app.icon} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{enrollment.app.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{enrollment.app.tagline}</p>
                      </div>
                      <Link 
                        to={`/tester/apps/${enrollment.app.slug}`}
                        className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-md hover:bg-primary/20 transition-colors"
                      >
                        Testing Hub
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-lg">Testing Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3 text-sm text-primary-foreground/90">
              <p>• Be constructive when reporting bugs.</p>
              <p>• Do not share unreleased features publicly.</p>
              <p>• Stay active in the testing hub chat.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
