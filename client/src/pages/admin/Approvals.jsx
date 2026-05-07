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
import { UserCheck, UserX, Clock, Mail, ShieldCheck, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
            Tester Approvals
          </h1>
          <p className="text-white/40 mt-2 font-medium">Review and manage access requests for restricted testing programs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-widest">
            <Clock className="h-3.5 w-3.5 animate-pulse" /> {pending.length} Pending Requests
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div>
            <h3 className="font-bold text-white">Enrollment Waitlist</h3>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-medium">Manual Review Required</p>
          </div>
          <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60">A/B Testing Program</Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-white/40 font-bold uppercase tracking-widest text-[10px] pl-6 h-12">Tester</TableHead>
                <TableHead className="text-white/40 font-bold uppercase tracking-widest text-[10px] h-12">Application</TableHead>
                <TableHead className="text-white/40 font-bold uppercase tracking-widest text-[10px] h-12">Requested On</TableHead>
                <TableHead className="text-right text-white/40 font-bold uppercase tracking-widest text-[10px] pr-6 h-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}><Skeleton className="h-12 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : pending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                      No pending requests at the moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  pending.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{p.user?.username || p.fullName}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {p.user?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary">{p.app?.name}</span>
                          <Badge variant="secondary" className="text-[10px]">A/B Test</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => { setSelectedId(p.id); setIsRejectDialogOpen(true); }}
                          >
                            <UserX className="h-4 w-4 mr-1" /> Reject
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="bg-green-700 hover:bg-green-800"
                            onClick={() => handleApprove(p.id)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" /> Approve
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#0f0f0f] border-white/5 group hover:border-green-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5 text-green-400" />
            </div>
            <h4 className="font-bold text-white text-sm mb-2">Why manual review?</h4>
            <p className="text-xs text-white/40 leading-relaxed font-medium">
              Manual review ensures that restricted A/B tests are only accessed by targeted testers, protecting confidential builds and ensuring high-quality feedback.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0f0f0f] border-white/5 group hover:border-blue-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-4 group-hover:scale-110 transition-transform">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <h4 className="font-bold text-white text-sm mb-2">Automation</h4>
            <p className="text-xs text-white/40 leading-relaxed font-medium">
              Upon approval or rejection, the system automatically sends a professionally formatted email and in-app notification to the tester.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0f0f0f] border-white/5 group hover:border-slate-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-4 group-hover:scale-110 transition-transform">
              <ExternalLink className="h-5 w-5 text-white/60" />
            </div>
            <h4 className="font-bold text-white text-sm mb-2">App Settings</h4>
            <p className="text-xs text-white/40 leading-relaxed font-medium">
              Toggle "Require Manual Approval" for any individual app in the App Management dashboard under the "A/B Testing" section.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Enrollment Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request. This will be sent to the tester via email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="e.g. This program is currently full, or your profile doesn't match our target criteria." 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Reject Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
