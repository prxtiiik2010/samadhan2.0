import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Search, 
  MessageCircle, 
  UserCheck 
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import samadhanLogo from "@/assets/samadhan-logo.png";
import { useAuth } from "@/contexts/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { user, signOutUser } = useAuth();

  const navigation = [
    { name: t('nav.home', 'Home'), href: "/" },
    { name: t('nav.register', 'Register Complaint'), href: "/register" },
    { name: t('nav.track', 'Track Complaint'), href: "/track" },
    { name: t('nav.dashboard', 'My Dashboard'), href: "/dashboard" },
    { name: t('nav.feedback', 'Feedback'), href: "/feedback" },
    { name: t('nav.admin', 'Admin Login'), href: "/admin" },
  ];

  const navItems = user ? navigation.filter(n => n.href !== "/admin") : navigation;

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate("/");
    } catch {
      // no-op
    }
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="flex justify-between items-center py-2 text-sm border-b border-primary-foreground/20">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {t('header.phone', '1800-123-4567')}
              </span>
              <span className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {t('header.email', 'support@samadhan.gov.in')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{t('header.language', 'Language')}:</span>
              <LanguageSelector variant="compact" />
            </div>
          </div>

          {/* Main Header */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <img 
                src={samadhanLogo} 
                alt="Samadhan Logo" 
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">{t('header.title', 'Samadhan')}</h1>
                <p className="text-sm opacity-90">{t('header.tagline', 'Your Voice, Our Commitment')}</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary-foreground/80 ${
                    location.pathname === item.href
                      ? "text-primary-foreground border-b-2 border-primary-foreground"
                      : "text-primary-foreground/90"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-xs text-primary-foreground/80 hidden lg:inline">
                    {user.email}
                  </span>
                  <Button size="sm" variant="secondary" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">{t('footer.contact', 'Contact Information')}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {t('footer.helpline', 'Helpline: 1800-123-4567')}
                </p>
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {t('footer.email', 'support@samadhan.gov.in')}
                </p>
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {t('footer.ministry', 'Ministry of Electronics & IT')}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('footer.quickLinks', 'Quick Links')}</h3>
              <div className="space-y-2 text-sm">
                <Link to="/register" className="block text-muted-foreground hover:text-foreground">
                  {t('footer.registerComplaint', 'Register Complaint')}
                </Link>
                <Link to="/track" className="block text-muted-foreground hover:text-foreground">
                  {t('footer.trackStatus', 'Track Status')}
                </Link>
                <Link to="/feedback" className="block text-muted-foreground hover:text-foreground">
                  {t('footer.giveFeedback', 'Give Feedback')}
                </Link>
                <Link to="/faq" className="block text-muted-foreground hover:text-foreground">
                  {t('footer.faq', 'FAQ')}
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('footer.services', 'Services')}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  {t('footer.onlineComplaintFiling', 'Online Complaint Filing')}
                </p>
                <p className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  {t('footer.realTimeTracking', 'Real-time Tracking')}
                </p>
                <p className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('footer.smsEmailUpdates', 'SMS/Email Updates')}
                </p>
                <p className="flex items-center">
                  <UserCheck className="h-4 w-4 mr-2" />
                  {t('footer.qualityAssurance', 'Quality Assurance')}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('footer.languagesSupported', 'Languages Supported')}</h3>
              <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                <span>English</span>
                <span>हिंदी</span>
                <span>বাংলা</span>
                <span>தமிழ்</span>
                <span>తెలుగు</span>
                <span>ગુજરાતી</span>
                <span>ಕನ್ನಡ</span>
                <span>മലയാളം</span>
                <span>اردو</span>
                <span>ਪੰਜਾਬੀ</span>
                <span>অসমীয়া</span>
                <span>ଓଡ଼ିଆ</span>
                <span>मराठी</span>
                <span>नेपाली</span>
                <span>+9 more</span>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>{t('footer.copyright', '© 2024 Government of India. All rights reserved.')} | {t('footer.privacyPolicy', 'Privacy Policy')} | {t('footer.termsOfService', 'Terms of Service')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}