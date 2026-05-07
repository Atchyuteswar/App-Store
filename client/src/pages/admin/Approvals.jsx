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
import { toast } from "@/components/ui/use-toast";
import { UserCheck, UserX, Clock, Mail, ShieldCheck, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Approvals() {
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tester Approvals</h1>
          <p className="text-muted-foreground mt-1">Review and manage access requests for restricted testing programs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 py-1 px-3">
            <Clock className="h-3 w-3 mr-1" /> {pending.length} Pending
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment Requests</CardTitle>
          <CardDescription>Waitlist for A/B testing programs requiring manual review.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Tester</TableHead>
                  <TableHead>App</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50/50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-green-800">
              <ShieldCheck className="h-4 w-4" /> Why manual review?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-700 leading-relaxed">
              Manual review ensures that your restricted A/B tests are only accessed by trusted or targeted testers, protecting confidential builds and ensuring quality feedback.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-800">
              <Mail className="h-4 w-4" /> Automation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-700 leading-relaxed">
              Upon approval or rejection, the system automatically sends a professionally formatted email and in-app notification to the tester.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
              <ExternalLink className="h-4 w-4" /> App Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 leading-relaxed">
              You can toggle "Require Manual Approval" for any individual app in the App Management dashboard under the "A/B Testing" section.
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
