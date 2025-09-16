import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, AlertTriangle, Clock, CheckCircle } from "lucide-react";

const ComplaintMap = () => {
  // No mock hotspots; integrate real data later
  const hotspots: any[] = [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "medium":
        return <Clock className="h-4 w-4 text-warning" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <MapPin className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "border-destructive/20 bg-destructive/5";
      case "medium":
        return "border-warning/20 bg-warning/5";
      case "low":
        return "border-success/20 bg-success/5";
      default:
        return "border-muted/20 bg-muted/5";
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Complaint Hotspots Map
          </CardTitle>
          <CardDescription>
            Interactive map showing complaint distribution across regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-muted/20 rounded-lg p-8 min-h-96 flex items-center justify-center">
            <div className="text-center space-y-4">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">Interactive Map</h3>
                <p className="text-muted-foreground">
                  Map integration will show real-time complaint distribution
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Connect to Mapbox or Google Maps for full functionality
                </p>
              </div>
            </div>
            
            {/* Mock markers positioned on the placeholder */}
            <div className="absolute top-8 left-8">
              <div className="w-4 h-4 bg-destructive rounded-full animate-pulse"></div>
            </div>
            <div className="absolute top-12 right-16">
              <div className="w-4 h-4 bg-warning rounded-full animate-pulse"></div>
            </div>
            <div className="absolute bottom-16 left-16">
              <div className="w-4 h-4 bg-success rounded-full"></div>
            </div>
            <div className="absolute bottom-8 right-8">
              <div className="w-4 h-4 bg-destructive rounded-full animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotspots List */}
      <Card>
        <CardHeader>
          <CardTitle>Complaint Hotspots</CardTitle>
          <CardDescription>
            Areas with highest complaint volumes requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className={`p-4 rounded-lg border transition-colors ${getStatusColor(hotspot.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(hotspot.status)}
                    <div>
                      <h4 className="font-medium">{hotspot.location}</h4>
                      <p className="text-sm text-muted-foreground">
                        Primary Category: {hotspot.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {hotspot.complaints}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active Complaints
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Map Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-destructive rounded-full"></div>
              <span className="text-sm">High Priority (40+ complaints)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-warning rounded-full"></div>
              <span className="text-sm">Medium Priority (20-39 complaints)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-success rounded-full"></div>
              <span className="text-sm">Low Priority (0-19 complaints)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintMap;