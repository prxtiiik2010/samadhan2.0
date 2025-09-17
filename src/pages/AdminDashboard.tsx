import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { allocateComplaintToDepartment, listAllComplaints, updateComplaintStatus } from "@/lib/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deptChoice, setDeptChoice] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await listAllComplaints();
        setComplaints(data);
      } catch (e: any) {
        toast({ title: "Failed to load complaints", description: e?.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visible = useMemo(() => {
    if (!searchTerm) return complaints;
    const q = searchTerm.toLowerCase();
    return complaints.filter(c => (c.title + c.category + c.location).toLowerCase().includes(q));
  }, [complaints, searchTerm]);

  const setStatus = async (id: string, status: string) => {
    try {
      await updateComplaintStatus(id, status as any);
      setComplaints(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
      toast({ title: "Status updated" });
    } catch (e: any) {
      toast({ title: "Failed to update status", description: e?.message, variant: "destructive" });
    }
  };

  const allocate = async (id: string) => {
    const dep = deptChoice[id];
    if (!dep) {
      toast({ title: "Select a department first" });
      return;
    }
    try {
      await allocateComplaintToDepartment(id, dep);
      setComplaints(prev => prev.map(c => (c.id === id ? { ...c, assignedDepartment: dep, status: "in_progress" } : c)));
      toast({ title: "Allocated to department" });
    } catch (e: any) {
      toast({ title: "Failed to allocate", description: e?.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "submitted":
        return <Badge className="status-submitted">{status}</Badge>;
      case "in progress":
      case "under review":
        return <Badge className="status-in-progress">{status}</Badge>;
      case "resolved":
        return <Badge className="status-resolved">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Input placeholder="Search complaints" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading complaints…</div>
      ) : visible.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">No complaints available.</div>
      ) : (
        <div className="grid gap-4">
          {visible.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{c.title || c.id}</CardTitle>
                {getStatusBadge(c.status)}
              </CardHeader>
              <CardContent>
                {(() => {
                  const loc = c.location as any;
                  const locText = loc
                    ? (loc.address
                        ? loc.address
                        : (typeof loc.lat === "number" && typeof loc.lng === "number"
                            ? `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`
                            : ""))
                    : "";
                  return (
                    <p className="text-sm text-muted-foreground">
                      {c.category}
                      {locText ? ` • ${locText}` : ""}
                    </p>
                  );
                })()}
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  <Button size="sm" variant="outline" onClick={() => setStatus(c.id, "open")}>Mark Open</Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(c.id, "in_progress")}>Mark In Progress</Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(c.id, "resolved")}>Mark Resolved</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <Select value={deptChoice[c.id] || ""} onValueChange={(v) => setDeptChoice(p => ({ ...p, [c.id]: v }))}>
                    <SelectTrigger className="w-56"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Municipal Corporation">Municipal Corporation</SelectItem>
                      <SelectItem value="Public Works Department">Public Works Department</SelectItem>
                      <SelectItem value="Health Department">Health Department</SelectItem>
                      <SelectItem value="Police Department">Police Department</SelectItem>
                      <SelectItem value="Electricity Board">Electricity Board</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => allocate(c.id)}>Allocate to the department</Button>
                  {c.assignedDepartment && (
                    <Badge className="ml-1" variant="secondary">Assigned: {c.assignedDepartment}</Badge>
                  )}
                </div>
        </CardContent>
      </Card>
              ))}
            </div>
      )}
    </div>
  );
};

export default AdminDashboard;