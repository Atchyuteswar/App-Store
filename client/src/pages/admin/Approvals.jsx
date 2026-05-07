import React, { useState, useEffect } from "react";
import { 
  getPendingEnrollments, 
  approveEnrollment, 
  rejectEnrollment 
} from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, UserX, Clock, Mail, ShieldCheck, ExternalLink, Shield, Info, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Approvals() {
  const { toast } = useToast();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await getPendingEnrollments();
      setPending(res.data || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch pending requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveEnrollment(id);
      setPending(pending.filter(p => p.id !== id));
      toast({ title: "Approved", description: "Tester has been notified." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to approve", variant: "destructive" });
    }
  };

  const handleReject = async () => {
    try {
      await rejectEnrollment(selectedId, { reason: rejectionReason });
      setPending(pending.filter(p => p.id !== selectedId));
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      toast({ title: "Rejected", description: "Tester has been notified." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to reject", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-12 pb-20 selection:bg-primary/30">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-black uppercase tracking-widest px-3 h-6 mb-2">Clearance Required</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-premium uppercase leading-tight">Access Control</h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Manage researcher eligibility & high-priority enrollments</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-500 animate-pulse" />
            <div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Queue Status</p>
              <p className="text-sm font-black text-white tracking-tight">{pending.length} Pending</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black tracking-tighter text-premium uppercase flex items-center gap-3">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            Waitlist Registry
          </h2>
        </div>

        <div className="rounded-[2.5rem] border border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
          <Table>
            <TableHeader className="bg-white/[0.02] border-b border-white/5">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-white/20 font-black uppercase tracking-[0.2em] text-[10px] pl-8 h-16">Researcher Information</TableHead>
                <TableHead className="text-white/20 font-black uppercase tracking-[0.2em] text-[10px] h-16">Target Application</TableHead>
                <TableHead className="text-white/20 font-black uppercase tracking-[0.2em] text-[10px] h-16">Request Epoch</TableHead>
                <TableHead className="text-right text-white/20 font-black uppercase tracking-[0.2em] text-[10px] pr-8 h-16">Clearance Directives</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4} className="py-8 pl-8"><Skeleton className="h-12 w-full rounded-2xl bg-white/5" /></TableCell>
                  </TableRow>
                ))
              ) : pending.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="h-16 w-16 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/5">
                        <Shield className="h-8 w-8 text-white/10" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Archive Clear</p>
                        <p className="text-xs font-bold text-white/10 mt-1 uppercase tracking-widest">No pending authorization requests recorded</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pending.map((p) => (
                  <TableRow key={p.id} className="group hover:bg-white/[0.02] border-white/5 transition-all">
                    <TableCell className="py-6 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                          <UserCheck className="h-6 w-6 text-white/20 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-sm text-white tracking-tight">{p.user?.username || p.fullName}</span>
                          <span className="text-[10px] text-white/20 font-black uppercase tracking-widest flex items-center gap-2">
                            <Mail className="h-3 w-3" /> {p.user?.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-white/5 border-white/10 text-white/60 font-black uppercase tracking-widest text-[9px] px-3 h-6">
                          {p.app?.name}
                        </Badge>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[8px] font-black uppercase tracking-widest">
                          A/B Test
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex items-center justify-end gap-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-11 px-6 rounded-2xl text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-all font-black uppercase tracking-widest text-[9px] border border-transparent hover:border-red-400/20 active:scale-95"
                          onClick={() => { setSelectedId(p.id); setIsRejectDialogOpen(true); }}
                        >
                          <UserX className="h-4 w-4 mr-2" /> Revoke
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-11 px-6 rounded-2xl text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all font-black uppercase tracking-widest text-[9px] border border-primary/20 active:scale-95 shadow-[0_0_20px_-5px_rgba(1,135,95,0.3)]"
                          onClick={() => handleApprove(p.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-2" /> Authorize
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            title: "Security Protocols", 
            desc: "Manual review ensures restricted A/B tests are only accessed by authorized researchers, maintaining build integrity.", 
            icon: ShieldCheck, 
            color: "text-primary", 
            bg: "bg-primary/10",
            border: "hover:border-primary/30"
          },
          { 
            title: "Automated Feedback", 
            desc: "The neural network automatically synchronizes status updates with the target via high-priority notification channels.", 
            icon: Mail, 
            color: "text-blue-400", 
            bg: "bg-blue-400/10",
            border: "hover:border-blue-400/30"
          },
          { 
            title: "Kernel Parameters", 
            desc: "Authorization requirements can be toggled for individual deployments within the Command Center hierarchy.", 
            icon: ExternalLink, 
            color: "text-white/40", 
            bg: "bg-white/5",
            border: "hover:border-white/20"
          }
        ].map((item, i) => (
          <Card key={i} className={cn("bg-black/40 border-white/5 backdrop-blur-xl rounded-[2rem] group transition-all duration-500 shadow-xl", item.border)}>
            <CardContent className="p-8">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 border border-white/10", item.bg)}>
                <item.icon className={cn("h-6 w-6", item.color)} />
              </div>
              <h4 className="font-black text-white text-xs uppercase tracking-[0.2em] mb-3">{item.title}</h4>
              <p className="text-[11px] text-white/30 leading-relaxed font-medium">
                {item.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white p-10 max-w-lg rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 h-64 w-64 bg-red-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          <DialogHeader className="relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-6">
              <UserX className="h-8 w-8 text-red-400" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-tight">Revoke Request</DialogTitle>
            <DialogDescription className="text-white/40 font-medium pt-2 text-sm leading-relaxed">
              Define the justification for access denial. This protocol will be transmitted to the researcher's terminal.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 relative z-10">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Rejection Justification</Label>
              <Textarea 
                placeholder="e.g. Clearance level insufficient for current research build criteria." 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[140px] bg-white/5 border-white/10 rounded-2xl font-medium resize-none placeholder:text-white/10"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-4 relative z-10">
            <Button type="button" onClick={handleReject} className="w-full h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest shadow-[0_0_30px_-10px_rgba(220,38,38,0.5)] transition-all hover:scale-[1.02]">
              Confirm Revocation
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsRejectDialogOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Abort Directive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
