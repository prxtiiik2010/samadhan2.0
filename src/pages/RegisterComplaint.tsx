import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { FileText, CheckCircle, AlertTriangle, ThumbsUp, MapPin, Users, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createComplaint, findNearbyComplaints, upvoteComplaint, type Complaint } from "@/lib/firestore";

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
};

const RegisterComplaint = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    language: "",
    category: "",
    description: "",
    latitude: "",
    longitude: "",
    address: "",
  });
  const [locLoading, setLocLoading] = useState(false);
  const [duplicateComplaints, setDuplicateComplaints] = useState<Complaint[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkForDuplicates = async () => {
    if (!formData.latitude || !formData.longitude || !formData.category) {
      return false;
    }

    try {
      const lat = Number(formData.latitude);
      const lng = Number(formData.longitude);
      
      // Validate coordinates
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        toast({ 
          title: "Invalid Location", 
          description: "Please provide valid GPS coordinates", 
          variant: "destructive" 
        });
        return false;
      }
      
      const nearbyComplaints = await findNearbyComplaints(lat, lng, formData.category, 100);
      
      if (nearbyComplaints.length > 0) {
        setDuplicateComplaints(nearbyComplaints);
        setShowDuplicateWarning(true);
        toast({ 
          title: "Similar Complaints Found", 
          description: `Found ${nearbyComplaints.length} similar complaint(s) nearby. Please review them before proceeding.`,
          duration: 5000
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking for duplicates:", error);
      toast({ 
        title: "Duplicate Check Failed", 
        description: "Unable to check for similar complaints. You can still proceed with submission.", 
        variant: "destructive" 
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicates first if location and category are provided
    if (formData.latitude && formData.longitude && formData.category) {
      const hasDuplicates = await checkForDuplicates();
      if (hasDuplicates) {
        return; // Stop submission, show duplicate warning
      }
    }

    await submitComplaint();
  };

  const submitComplaint = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const title = `${formData.category || t('register.general', 'General')} ${t('register.complaint', 'Complaint')}`;
      const attachments: string[] = [];

      const docId = await createComplaint({
        title,
        description: formData.description,
        category: formData.category || "other",
        priority: "Medium",
        createdAt: Date.now(),
        status: "submitted",
        userId: user?.uid,
        location: {
          lat: formData.latitude ? Number(formData.latitude) : undefined,
          lng: formData.longitude ? Number(formData.longitude) : undefined,
          address: formData.address || undefined,
        },
        attachments,
      } as any);

      toast({
        title: t('register.successTitle', 'Complaint Registered Successfully'),
        description: t('register.successDesc', 'Your complaint ID is: ') + `${docId}. ` + t('register.saveForTracking', 'Please save this for tracking.'),
      });

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        language: "",
        category: "",
        description: "",
        latitude: "",
        longitude: "",
        address: "",
      });
      setShowDuplicateWarning(false);
      setDuplicateComplaints([]);
    } catch (err: any) {
      toast({ title: "Failed to submit complaint", description: err?.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvoteExisting = async (complaintId: string) => {
    if (!user) {
      toast({ 
        title: "Authentication Required", 
        description: "Please sign in to upvote complaints",
        variant: "destructive" 
      });
      return;
    }

    try {
      await upvoteComplaint(complaintId, user.uid);
      toast({ 
        title: "✅ Upvote Successful", 
        description: "Your support has been recorded. Thank you for helping prioritize this issue!",
        duration: 4000
      });
      
      // Update the duplicate complaints list to reflect the new upvote count
      setDuplicateComplaints(prev => prev.map(c => 
        c.id === complaintId 
          ? { ...c, upvotes: (c.upvotes || 0) + 1, upvotedBy: [...(c.upvotedBy || []), user.uid] }
          : c
      ));
    } catch (err: any) {
      const errorMessage = err?.message === "You have already upvoted this complaint" 
        ? "You have already supported this complaint" 
        : "Unable to record your support. Please try again.";
      
      toast({ 
        title: "Upvote Failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  };

  const handleProceedWithNewComplaint = () => {
    setShowDuplicateWarning(false);
    submitComplaint();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const useMyLocation = async () => {
    if (!("geolocation" in navigator)) {
      toast({ title: "Location not supported", description: "Your browser does not support geolocation.", variant: "destructive" });
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({ ...prev, latitude: String(latitude), longitude: String(longitude) }));
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          const res = await fetch(url, { headers: { "Accept": "application/json" } });
          if (res.ok) {
            const data = await res.json();
            const addr = data?.display_name as string | undefined;
            if (addr) setFormData(prev => ({ ...prev, address: addr }));
          }
        } catch {}
        setLocLoading(false);
        toast({ title: "Location captured", description: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}` });
      },
      (err) => {
        setLocLoading(false);
        const msg = err?.message || "Permission denied or location unavailable";
        toast({ title: "Location error", description: msg, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('register.title', 'Register Your Complaint')}</h1>
          <p className="text-lg text-muted-foreground">
            {t('register.subtitle', "Submit your grievance and we'll ensure it reaches the right authorities")}
          </p>
        </div>

        {/* Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-success" />
              {t('register.beforeBegin', 'Before You Begin')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">{t('register.requiredInfo', 'Required Information:')}</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {t('register.req.emailOrPhone', 'Valid email address or phone number')}</li>
                  <li>• {t('register.req.description', 'Detailed description of your issue')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('register.expect', 'What to Expect:')}</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {t('register.expect.id', 'Unique complaint ID for tracking')}</li>
                  <li>• {t('register.expect.confirm', 'SMS/Email confirmation')}</li>
                  <li>• {t('register.expect.updates', 'Regular status updates')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaint Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('register.details', 'Complaint Details')}</CardTitle>
            <CardDescription>
              {t('register.detailsDesc', 'Please fill in all required information accurately')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('register.form.fullName', 'Full Name *')}</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder={t('register.form.fullNamePh', 'Enter your full name')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('register.form.email', 'Email Address *')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder={t('register.form.emailPh', 'your.email@example.com')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('register.form.phone', 'Phone Number *')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder={t('register.form.phonePh', '+91 98765 43210')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">{t('register.form.prefLang', 'Preferred Language')}</Label>
                  <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('register.form.selectLang', 'Select language')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                      <SelectItem value="bn">Bengali (বাংলা)</SelectItem>
                      <SelectItem value="ta">Tamil (தமிழ்)</SelectItem>
                      <SelectItem value="te">Telugu (తెలుగు)</SelectItem>
                      <SelectItem value="gu">Gujarati (ગુજરાતી)</SelectItem>
                      <SelectItem value="kn">Kannada (ಕನ್ನಡ)</SelectItem>
                      <SelectItem value="ml">Malayalam (മലയാളം)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Complaint Details */}
              <div className="space-y-2">
                <Label htmlFor="category">{t('register.form.category', 'Complaint Category *')}</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('register.form.selectCategory', 'Select complaint category')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public-services">{t('register.cat.public', 'Public Services')}</SelectItem>
                    <SelectItem value="healthcare">{t('register.cat.healthcare', 'Healthcare')}</SelectItem>
                    <SelectItem value="education">{t('register.cat.education', 'Education')}</SelectItem>
                    <SelectItem value="infrastructure">{t('register.cat.infrastructure', 'Infrastructure')}</SelectItem>
                    <SelectItem value="law-order">{t('register.cat.law', 'Law & Order')}</SelectItem>
                    <SelectItem value="corruption">{t('register.cat.corruption', 'Corruption')}</SelectItem>
                    <SelectItem value="digital-services">{t('register.cat.digital', 'Digital Services')}</SelectItem>
                    <SelectItem value="employment">{t('register.cat.employment', 'Employment')}</SelectItem>
                    <SelectItem value="welfare-schemes">{t('register.cat.welfare', 'Welfare Schemes')}</SelectItem>
                    <SelectItem value="other">{t('register.cat.other', 'Other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="latitude">{t('register.form.latitude', 'Latitude')}</Label>
                  <Input id="latitude" value={formData.latitude} onChange={(e) => handleInputChange("latitude", e.target.value)} placeholder="e.g., 28.6139" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">{t('register.form.longitude', 'Longitude')}</Label>
                  <Input id="longitude" value={formData.longitude} onChange={(e) => handleInputChange("longitude", e.target.value)} placeholder="e.g., 77.2090" />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={useMyLocation} disabled={locLoading} className="w-full">
                    {locLoading ? t('register.form.locating', 'Fetching location…') : t('register.form.useLocation', 'Use my location')}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('register.form.address', 'Detected Address')}</Label>
                <Input id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} placeholder="Auto-filled after using location (editable)" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('register.form.description', 'Detailed Description *')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder={t('register.form.descriptionPh', 'Please provide a detailed description of your complaint. Include relevant dates, locations, and any other important information.')}
                  className="min-h-32"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  {t('register.form.descriptionHelp', 'Minimum 50 characters required. Be specific and include all relevant details.')}
                </p>
              </div>

              {/* Terms & Submit */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    required 
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm">
                    {t('register.form.terms', 'I confirm that the information provided is accurate and complete. I understand that false or misleading information may result in rejection of my complaint.')}
                  </label>
                </div>
              </div>

              {/* Enhanced Duplicate Warning */}
              {showDuplicateWarning && duplicateComplaints.length > 0 && (
                <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <AlertDescription>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-amber-900 text-lg mb-1">
                            Similar Complaint Found Nearby
                          </h4>
                          <p className="text-amber-800 text-sm leading-relaxed">
                            A complaint for this issue at this location already exists. You can upvote the existing complaint to help prioritize it.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-white/70 rounded-lg p-4 space-y-3">
                        <h5 className="font-medium text-amber-900 flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Existing Complaints ({duplicateComplaints.length})
                        </h5>
                        {duplicateComplaints.map((complaint, index) => {
                          const isUpvoted = user && complaint.upvotedBy?.includes(user.uid);
                          const createdDate = new Date(complaint.createdAt).toLocaleDateString();
                          const distance = formData.latitude && formData.longitude && complaint.location?.lat && complaint.location?.lng 
                            ? calculateDistance(
                                Number(formData.latitude), 
                                Number(formData.longitude), 
                                complaint.location.lat, 
                                complaint.location.lng
                              ).toFixed(0)
                            : null;
                          
                          return (
                            <div key={complaint.id} className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h6 className="font-medium text-gray-900 text-sm">{complaint.title}</h6>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      {complaint.category}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                                    <span className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {createdDate}
                                    </span>
                                    {distance && (
                                      <span className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        ~{distance}m away
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2">{complaint.description}</p>
                                </div>
                                <div className="flex flex-col items-end space-y-2 ml-4">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      {complaint.upvotes || 0}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant={isUpvoted ? "default" : "outline"}
                                      onClick={() => handleUpvoteExisting(complaint.id!)}
                                      disabled={isUpvoted}
                                      className={`text-xs transition-all ${
                                        isUpvoted 
                                          ? "bg-green-600 hover:bg-green-700 text-white" 
                                          : "border-amber-300 text-amber-700 hover:bg-amber-50"
                                      }`}
                                    >
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      {isUpvoted ? 'Upvoted' : 'Upvote'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          onClick={() => setShowDuplicateWarning(false)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          I'll upvote existing complaint
                        </Button>
                        <Button
                          onClick={handleProceedWithNewComplaint}
                          variant="default"
                          size="sm"
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          This is different - Submit new complaint
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  {t('register.form.saveDraft', 'Save as Draft')}
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : t('register.form.submit', 'Submit Complaint')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterComplaint;