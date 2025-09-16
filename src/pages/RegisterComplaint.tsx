import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createComplaint } from "@/lib/firestore";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err: any) {
      toast({ title: "Failed to submit complaint", description: err?.message, variant: "destructive" });
    }
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

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  {t('register.form.saveDraft', 'Save as Draft')}
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {t('register.form.submit', 'Submit Complaint')}
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