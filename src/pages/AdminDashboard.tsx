import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { listAllComplaints } from "@/lib/firestore";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
                <p className="text-sm text-muted-foreground">{c.category} • {c.location || ""}</p>
        </CardContent>
      </Card>
              ))}
            </div>
      )}
    </div>
  );
};

export default AdminDashboard;