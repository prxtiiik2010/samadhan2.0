import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Search, 
  MessageCircle, 
  BarChart3, 
  Shield, 
  Clock,
  CheckCircle,
  Users,
  MapPin
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              {t('home.title', 'Welcome to Samadhan')}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              {t('home.subtitle', 'Your Digital Gateway to Grievance Redressal')}
            </p>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              {t('home.description', 'File complaints, track progress, and get resolutions efficiently through our transparent digital platform.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" variant="secondary" className="!text-secondary-foreground" asChild>
                <Link to="/register">
                  <FileText className="mr-2 h-5 w-5" />
                  {t('home.registerComplaint', 'Register New Complaint')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link to="/track">
                  <Search className="mr-2 h-5 w-5" />
                  {t('home.trackComplaint', 'Track Your Complaint')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How Samadhan Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A transparent, efficient, and citizen-centric approach to grievance redressal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Register Your Complaint</CardTitle>
              <CardDescription>
                Submit your grievance online with complete details and supporting documents
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <CardTitle>Real-time Tracking</CardTitle>
              <CardDescription>
                Monitor your complaint status with regular updates and transparent timelines
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <CardTitle>Resolution & Feedback</CardTitle>
              <CardDescription>
                Get timely resolution and share your feedback to improve our services
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-muted">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-lg text-muted-foreground">
              Serving citizens across India with dedication and transparency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
              <div className="text-muted-foreground">Complaints Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">7 Days</div>
              <div className="text-muted-foreground">Average Resolution Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Quick Actions</h2>
          <p className="text-lg text-muted-foreground">
            Access key services with just one click
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">File New Complaint</CardTitle>
              <CardDescription>Submit a new grievance</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <Link to="/register">Start Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-warning" />
              </div>
              <CardTitle className="text-lg">Track Complaint</CardTitle>
              <CardDescription>Check your complaint status</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/track">Track Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-success" />
              </div>
              <CardTitle className="text-lg">Give Feedback</CardTitle>
              <CardDescription>Share your experience</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/feedback">Feedback</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-accent/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-lg">View Analytics</CardTitle>
              <CardDescription>Complaint statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/analytics">View Data</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
