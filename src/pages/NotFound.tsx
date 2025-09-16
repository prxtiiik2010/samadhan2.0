import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home, Search, FileText } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <Card>
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-xl text-muted-foreground mb-6">{t('common.notFoundTitle', 'Page Not Found')}</p>
            <p className="text-muted-foreground mb-8">
              {t('common.notFoundDesc', "The page you're looking for doesn't exist or has been moved.")}
            </p>
            
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  {t('common.returnHome', 'Return to Home')}
                </Link>
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/register">
                    <FileText className="mr-1 h-3 w-3" />
                    {t('nav.register', 'Register Complaint')}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/track">
                    <Search className="mr-1 h-3 w-3" />
                    {t('nav.track', 'Track Complaint')}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
