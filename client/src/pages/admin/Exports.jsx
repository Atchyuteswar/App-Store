import React, { useState, useEffect } from "react";
import { getAdminApps, getExportCSVUrl, getExportPDFUrl } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  FileDown, 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Database,
  Shield,
  Zap,
  Activity
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
    <div className="space-y-12 pb-20 selection:bg-primary/30">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 h-6 mb-2">Data Archival</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-premium uppercase leading-tight">Data Extracts</h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Generate comprehensive technical reports for offline analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
            <p className="text-[10px] font-black text-white tracking-widest uppercase">System Core Synchronized</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-10 rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
              <h2 className="text-xl font-black tracking-tighter text-premium uppercase flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                Parameterization
              </h2>
              <Filter className="h-5 w-5 text-white/10" />
            </div>

            <div className="grid md:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Archive Segment</Label>
                <Select value={exportType} onValueChange={setExportType}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-white/10 text-white rounded-2xl p-2">
                    <SelectItem value="bugs" className="rounded-xl py-3 font-bold uppercase tracking-widest text-[10px]">ANOMALY REPORTS</SelectItem>
                    <SelectItem value="testers" className="rounded-xl py-3 font-bold uppercase tracking-widest text-[10px]">RESEARCHER ACTIVITY</SelectItem>
                    <SelectItem value="analytics" className="rounded-xl py-3 font-bold uppercase tracking-widest text-[10px]">KERNEL PERFORMANCE</SelectItem>
                    <SelectItem value="announcements" className="rounded-xl py-3 font-bold uppercase tracking-widest text-[10px]">BROADCAST ARCHIVE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Target Application</Label>
                <Select value={selectedApp} onValueChange={setSelectedApp}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-white/10 text-white rounded-2xl p-2">
                    <SelectItem value="all" className="rounded-xl py-3 font-bold uppercase tracking-widest text-[10px]">ALL ACTIVE NODES</SelectItem>
                    {apps.map(app => (
                      <SelectItem key={app.id} value={app.id} className="rounded-xl py-3 font-bold uppercase tracking-widest text-[10px]">{app.name.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Temporal Range</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "LAST 7 DAYS", value: "7d" },
                  { label: "LAST 30 DAYS", value: "30d" },
                  { label: "LAST 90 DAYS", value: "90d" },
                  { label: "ALL TIME ARCHIVE", value: "all" },
                ].map((range) => (
                  <Button
                    key={range.value}
                    type="button"
                    variant="ghost"
                    className={cn(
                      "h-14 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all duration-300 border border-white/5",
                      dateRange === range.value 
                        ? "bg-primary text-white border-primary shadow-[0_0_20px_-5px_rgba(34,197,94,0.5)]" 
                        : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                    )}
                    onClick={() => setDateRange(range.value)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div 
              className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md group hover:bg-white/[0.08] transition-all duration-500 cursor-pointer shadow-xl relative overflow-hidden"
              onClick={() => handleExport('csv')}
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <FileDown className="h-7 w-7 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest">Raw Database Sync</h4>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider leading-tight">Optimized for Excel & neural analysis terminals.</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-white/10 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-500" />
              </div>
            </div>

            <div 
              className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md group hover:bg-white/[0.08] transition-all duration-500 cursor-pointer shadow-xl relative overflow-hidden"
              onClick={() => handleExport('pdf')}
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-red-500/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <FileText className="h-7 w-7 text-red-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest">Formatted Dossier</h4>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider leading-tight">Professional visual summary of kernel parameters.</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-white/10 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-10 rounded-[3rem] border border-white/5 bg-primary/5 backdrop-blur-xl shadow-2xl space-y-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Transmission Status</h3>
            </div>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Reports Synchronized</span>
                <span className="text-xl font-black text-white tracking-tighter">12 TOTAL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Last Extraction</span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">TODAY, 2:45 PM</span>
              </div>
              <div className="pt-6 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-primary/60">
                  <Shield className="h-3.5 w-3.5" /> AES-256 KERNEL ENCRYPTION
                </div>
                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-primary/60">
                  <CheckCircle2 className="h-3.5 w-3.5" /> SECURE HANDSHAKE ACTIVE
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 rounded-[3rem] border border-dashed border-white/10 bg-white/[0.02] space-y-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-white/20" />
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Extraction Guidelines</h3>
            </div>
            <div className="space-y-6">
              {[
                { title: "RAW DATA SYNC", desc: "CSV exports include unformatted kernel fields for advanced technical analysis." },
                { title: "VISUAL DOSSIER", desc: "PDF exports include architectural charts and formatted intelligence summaries." },
                { title: "LATENCY NOTICE", desc: "Large data volumes may require up to 30s for full packet synchronization." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-white/10 mt-1.5 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest">{item.title}</h4>
                    <p className="text-[10px] text-white/20 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isExporting && (
        <div className="fixed bottom-12 right-12 animate-in slide-in-from-right-12 fade-in duration-500 z-50">
          <div className="p-6 rounded-2xl bg-primary text-white shadow-[0_0_50px_-10px_rgba(34,197,94,0.8)] flex items-center gap-4 border border-white/20 backdrop-blur-md">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center animate-bounce">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">Generating Extract...</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Synchronizing data packets</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
