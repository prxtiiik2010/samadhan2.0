import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, FileText, Filter, MessageCircle, Search, ThumbsUp, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { listComplaintsByUser, deleteComplaint } from "@/lib/firestore";

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  isAnonymous?: boolean;
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  submittedDate: string;
  lastUpdated: string;
  location: string;
  upvotes: number;
  comments: Comment[];
  hasUserUpvoted: boolean;
}

const CitizenDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await listComplaintsByUser(user.uid);
        setComplaints(data as unknown as Complaint[]);
      } catch (e: any) {
        toast({ title: "Failed to load complaints", description: e?.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return <Badge className="status-submitted">{status}</Badge>;
      case "in progress":
      case "under review":
        return <Badge className="status-in-progress">{status}</Badge>;
      case "resolved":
        return <Badge className="status-resolved">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return <FileText className="h-4 w-4" />;
      case "in progress":
      case "under review":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filtered = useMemo(() => {
    return complaints
      .filter(c => (statusFilter === "all" ? true : c.status.toLowerCase() === statusFilter))
      .filter(c => (categoryFilter === "all" ? true : c.category.toLowerCase() === categoryFilter))
      .filter(c => (searchTerm ? (c.title + c.description + c.location).toLowerCase().includes(searchTerm.toLowerCase()) : true));
  }, [complaints, statusFilter, categoryFilter, searchTerm]);

  const onDelete = async (id: string) => {
    if (!id) return;
    const confirmed = window.confirm("Are you sure you want to delete this complaint? This action cannot be undone.");
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await deleteComplaint(id);
      setComplaints(prev => prev.filter(c => c.id !== id));
      toast({ title: "Complaint deleted" });
    } catch (e: any) {
      toast({ title: "Failed to delete complaint", description: e?.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Input placeholder="Search complaints" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <Button variant="outline"><Search className="h-4 w-4" /></Button>
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading your complaints…</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">No complaints found.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(c.status)}
                  <CardTitle>{c.title}</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(c.id)}
                    disabled={deletingId === c.id}
                    className="text-red-600 hover:bg-red-50"
                    aria-label="Delete complaint"
                    title="Delete this complaint"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">{getStatusBadge(c.status)}</div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;