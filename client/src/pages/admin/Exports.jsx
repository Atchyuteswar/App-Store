import React, { useState, useEffect } from "react";
import { getAdminApps, getExportCSVUrl, getExportPDFUrl } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  FileDown, 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Exports() {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [exportType, setExportType] = useState("bugs");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await getAdminApps();
      setApps(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = (format) => {
    setIsExporting(true);
    const params = {
      appId: selectedApp === "all" ? undefined : selectedApp,
      range: dateRange,
      type: exportType
    };

    const url = format === 'csv' ? getExportCSVUrl(params) : getExportPDFUrl(params);
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${exportType}_report_${new Date().getTime()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Exports</h1>
          <p className="text-muted-foreground mt-1">Generate and download comprehensive reports for offline analysis.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary">System Ready</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Configure Report
              </CardTitle>
              <CardDescription>Select the data scope and timeframe for your export.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Data Type</Label>
                  <Select value={exportType} onValueChange={setExportType}>
                    <SelectTrigger className="bg-background/50 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bugs">Bug Reports</SelectItem>
                      <SelectItem value="testers">User Activity</SelectItem>
                      <SelectItem value="analytics">App Performance</SelectItem>
                      <SelectItem value="announcements">Broadcast History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Application</Label>
                  <Select value={selectedApp} onValueChange={setSelectedApp}>
                    <SelectTrigger className="bg-background/50 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Applications</SelectItem>
                      {apps.map(app => (
                        <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Time Period</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "Last 7 Days", value: "7d" },
                    { label: "Last 30 Days", value: "30d" },
                    { label: "Last 90 Days", value: "90d" },
                    { label: "All Time", value: "all" },
                  ].map((range) => (
                    <Button
                      key={range.value}
                      type="button"
                      variant={dateRange === range.value ? "default" : "outline"}
                      className={cn(
                        "h-10 text-xs font-medium transition-all",
                        dateRange === range.value ? "shadow-md scale-[1.02]" : "hover:bg-muted/50"
                      )}
                      onClick={() => setDateRange(range.value)}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card 
              className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg bg-card/50"
              onClick={() => handleExport('csv')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <FileDown className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold">Export as CSV</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Best for Excel or data analysis.</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg bg-card/50"
              onClick={() => handleExport('pdf')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold">Export as PDF</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Professional formatted document.</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-primary/80 text-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" /> Export Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-80">Reports Ready</span>
                <span className="font-bold">12 Total</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-80">Last Generation</span>
                <span className="font-bold">Today, 2:45 PM</span>
              </div>
              <div className="pt-4 border-t border-white/20">
                <div className="flex items-center gap-2 text-xs mb-2">
                  <CheckCircle2 className="h-3 w-3" /> Auto-sync enabled
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3" /> Secure encryption
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                Export Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-[10px] text-muted-foreground space-y-2">
                <li className="flex gap-2">
                  <div className="h-1 w-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                  CSV exports include raw database fields for advanced filtering.
                </li>
                <li className="flex gap-2">
                  <div className="h-1 w-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                  PDF exports include charts and formatted summary tables.
                </li>
                <li className="flex gap-2">
                  <div className="h-1 w-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                  Large reports may take up to 30 seconds to generate.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {isExporting && (
        <div className="fixed bottom-8 right-8 animate-in slide-in-from-right-8 fade-in">
          <Card className="bg-primary text-white p-4 shadow-2xl flex items-center gap-3">
            <Download className="h-5 w-5 animate-bounce" />
            <div>
              <p className="text-sm font-bold">Generating Report...</p>
              <p className="text-[10px] opacity-80">Please wait while we package your data.</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


