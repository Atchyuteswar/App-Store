import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Beaker, Settings, AlertCircle } from "lucide-react";

export default function TesterDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      navigate("/login", { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Beaker className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Tester Dashboard</h1>
            <p className="text-muted-foreground">Manage your A/B Testing enrollments</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-dashed border-2 bg-muted/20 flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No Active Tests</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You haven't been assigned to any specific test groups yet. 
              When a new test starts for an app you're enrolled in, it will appear here.
            </p>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Testing Profile</CardTitle>
                <CardDescription>Your information as a tester</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Username</p>
                  <p className="font-medium">{user.username}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Settings className="h-4 w-4" /> Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Tester preferences and notification settings will be available here soon.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
