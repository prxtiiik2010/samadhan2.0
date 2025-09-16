import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Clock, CheckCircle, AlertCircle, FileText, Calendar, User, MessageSquare } from "lucide-react";
import { listAllComplaints, upvoteComplaint } from "@/lib/firestore";

const TrackComplaint = () => {
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [publicComplaints, setPublicComplaints] = useState<any[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);

  // Mock complaint data
  const mockComplaint = {
    id: "CMP123456",
    title: "Street Light Not Working",
    category: "Infrastructure",
    status: "In Progress",
    submittedDate: "2024-01-15",
    lastUpdated: "2024-01-18",
    assignedDepartment: "Municipal Corporation",
    assignedOfficer: "John Smith",
    description: "The street light in front of house number 123, ABC Street has not been working for the past 10 days. This is causing safety concerns for residents.",
    timeline: [
      {
        date: "2024-01-15",
        time: "10:30 AM",
        status: "Submitted",
        description: "Complaint registered successfully",
        icon: FileText,
        completed: true
      },
      {
        date: "2024-01-16",
        time: "02:15 PM",
        status: "Acknowledged",
        description: "Complaint acknowledged and assigned to Municipal Corporation",
        icon: CheckCircle,
        completed: true
      },
      {
        date: "2024-01-17",
        time: "11:00 AM",
        status: "In Progress",
        description: "Technical team dispatched for assessment",
        icon: Clock,
        completed: true
      },
      {
        date: "2024-01-18",
        time: "09:45 AM",
        status: "Under Review",
        description: "Assessment completed, repair work scheduled",
        icon: AlertCircle,
        completed: false
      },
      {
        date: "Expected: 2024-01-20",
        time: "",
        status: "Resolution",
        description: "Issue will be resolved",
        icon: CheckCircle,
        completed: false
      }
    ]
  };

  const handleSearch = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (complaintId.toUpperCase() === "CMP123456") {
        setComplaint(mockComplaint);
      } else {
        setComplaint(null);
      }
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const load = async () => {
      setLoadingPublic(true);
      try {
        const all = await listAllComplaints();
        setPublicComplaints((all as any[]).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 20));
      } finally {
        setLoadingPublic(false);
      }
    };
    load();
  }, []);

  const handleUpvote = async (id: string, index: number) => {
    try {
      await upvoteComplaint(id);
      setPublicComplaints(prev => {
        const copy = [...prev];
        const item = { ...copy[index] } as any;
        item.upvotes = (item.upvotes || 0) + 1;
        copy[index] = item;
        return copy;
      });
    } catch {}
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "bg-warning/10 text-warning border-warning/20";
      case "in progress":
      case "acknowledged":
      case "under review":
        return "bg-primary/10 text-primary border-primary/20";
      case "resolved":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Track Your Complaint</h1>
          <p className="text-lg text-muted-foreground">
            Enter your complaint ID to get real-time status updates
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Your Complaint</CardTitle>
            <CardDescription>
              Enter your complaint ID (e.g., CMP123456) or use the demo ID: CMP123456
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="complaintId" className="sr-only">
                  Complaint ID
                </Label>
                <Input
                  id="complaintId"
                  placeholder="Enter complaint ID (CMP123456)"
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  className="uppercase"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={!complaintId || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? "Searching..." : "Track"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {complaint && (
          <div className="space-y-6">
            {/* Complaint Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{complaint.title}</span>
                      <Badge className={getStatusColor(complaint.status)}>
                        {complaint.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Complaint ID: {complaint.id} • Category: {complaint.category}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Submitted Date
                    </p>
                    <p className="text-sm text-muted-foreground">{complaint.submittedDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Assigned Department
                    </p>
                    <p className="text-sm text-muted-foreground">{complaint.assignedDepartment}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">{complaint.lastUpdated}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground">{complaint.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Timeline</CardTitle>
                <CardDescription>
                  Track the progress of your complaint resolution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {complaint.timeline.map((item: any, index: number) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          item.completed 
                            ? "bg-success text-success-foreground" 
                            : index === complaint.timeline.findIndex((t: any) => !t.completed)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              item.completed ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {item.status}
                            </p>
                            <div className="text-sm text-muted-foreground">
                              {item.date} {item.time && `• ${item.time}`}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Additional Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Additional options for your complaint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline" className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Escalate Complaint
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Results */}
        {complaintId && !complaint && !isLoading && (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Complaint Found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find a complaint with ID: {complaintId}
              </p>
              <p className="text-sm text-muted-foreground">
                Please check the complaint ID and try again, or try the demo ID: CMP123456
              </p>
            </CardContent>
          </Card>
        )}

        {/* Public Complaints Feed */}
        <div className="mt-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Recent Public Complaints</h2>
            <p className="text-muted-foreground">Transparent and open. Upvote to support.</p>
          </div>
          {loadingPublic ? (
            <div className="text-center py-8">Loading…</div>
          ) : publicComplaints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No complaints to show.</div>
          ) : (
            <div className="space-y-4">
              {publicComplaints.map((c, idx) => (
                <Card key={c.id}>
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{c.title}</CardTitle>
                      <CardDescription>{c.category}</CardDescription>
                    </div>
                    <Badge variant="secondary">{new Date(c.createdAt).toLocaleDateString()}</Badge>
                  </CardHeader>
                  <CardContent className="flex items-start justify-between gap-4">
                    <p className="text-sm text-muted-foreground flex-1 min-w-0 break-words whitespace-pre-wrap">{c.description}</p>
                    <Button variant="outline" onClick={() => handleUpvote(c.id, idx)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {(c.upvotes || 0).toString()} Upvote
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackComplaint;