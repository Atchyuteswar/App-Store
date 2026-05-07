import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAppBySlug } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, ChevronLeft, Package, History, Info, CheckCircle2, TrendingUp, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompareVersions() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [v1, setV1] = useState(null);
  const [v2, setV2] = useState(null);

  useEffect(() => {
    fetchApp();
  }, [slug]);

  const fetchApp = async () => {
    setLoading(true);
    try {
      const res = await getAppBySlug(slug);
      const appData = res.data;
      setApp(appData);
      
      // Default to current version and the latest history version
      const current = {
        version: appData.version,
        whatsNew: appData.whatsNew,
        size: appData.size,
        date: appData.updatedAt || appData.createdAt
      };
      
      setV1(current);
      if (appData.versionHistory?.length > 0) {
        setV2(appData.versionHistory[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const VersionColumn = ({ data, title, isCurrent }) => (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg flex items-center gap-2">
          {isCurrent ? <Package className="h-4 w-4 text-green-600" /> : <History className="h-4 w-4 text-muted-foreground" />}
          {title}
        </h3>
        <Badge variant={isCurrent ? "default" : "secondary"}>
          v{data?.version}
        </Badge>
      </div>

      <Card className={isCurrent ? "border-green-200 bg-green-50/10 shadow-sm" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">What's New</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm leading-relaxed whitespace-pre-wrap min-h-[150px]">
            {data?.whatsNew || "No release notes provided."}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">File Size</span>
            <p className="text-sm font-bold mt-1">{data?.size || "N/A"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Release Date</span>
            <p className="text-sm font-bold mt-1">{new Date(data?.date).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-2 gap-8">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );

  if (!app) return <div>App not found</div>;

  const historyOptions = [
    { version: app.version, whatsNew: app.whatsNew, size: app.size, date: app.updatedAt || app.createdAt },
    ...(app.versionHistory || [])
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Compare Versions</h1>
            <p className="text-sm text-muted-foreground">Compare release notes and changes for {app.name}.</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {app.platform}
          </Badge>
        </div>
      </div>

      <div className="bg-muted/30 border rounded-2xl p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-card border rounded-xl p-4 shadow-sm">
          <div className="flex-1 w-full space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Base Version</Label>
            <Select 
              value={v1?.version} 
              onValueChange={(val) => setV1(historyOptions.find(o => o.version === val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Version" />
              </SelectTrigger>
              <SelectContent>
                {historyOptions.map(opt => (
                  <SelectItem key={opt.version} value={opt.version}>
                    Version {opt.version} {opt.version === app.version ? "(Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
            <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="flex-1 w-full space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Target Version</Label>
            <Select 
              value={v2?.version} 
              onValueChange={(val) => setV2(historyOptions.find(o => o.version === val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Version" />
              </SelectTrigger>
              <SelectContent>
                {historyOptions.map(opt => (
                  <SelectItem key={opt.version} value={opt.version}>
                    Version {opt.version} {opt.version === app.version ? "(Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 relative">
          {/* Vertical Divider for desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-border -translate-x-1/2 z-0" />
          
          <VersionColumn 
            data={v1} 
            title={v1?.version === app.version ? "Current Release" : "Base Version"} 
            isCurrent={v1?.version === app.version} 
          />
          
          <VersionColumn 
            data={v2} 
            title={v2?.version === app.version ? "Current Release" : "Target Version"} 
            isCurrent={v2?.version === app.version} 
          />
        </div>
      </div>

      {/* Comparison Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-800">
              <Info className="h-4 w-4" /> Version Drift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-700 leading-relaxed">
              Comparing these versions allows you to see how the app has evolved over time. Pay attention to the "What's New" section for feature additions or bug fixes.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-800">
              <Star className="h-4 w-4" /> Rating Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-amber-700 leading-relaxed">
              Newer versions often address stability issues found in previous releases. If you're experiencing crashes, check if the newer version includes a fix.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-4 w-4" /> Stability Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-700 leading-relaxed">
              The platform tracks bug reports per version. You can see the health of specific releases in the analytics section if you have admin access.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Label({ children, className }) {
  return <span className={cn("block mb-1 text-sm font-medium", className)}>{children}</span>;
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
