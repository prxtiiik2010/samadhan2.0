import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { signInWithEmail, signInWithGoogle } = useAuth();

  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmail(credentials.username, credentials.password);
      toast({
        title: t('admin.login.success', 'Login Successful'),
        description: t('admin.login.welcome', 'Welcome to the admin dashboard'),
      });
      navigate("/admin/dashboard");
    } catch (err: any) {
      toast({
        title: t('admin.login.failed', 'Login Failed'),
        description: err?.message || t('admin.login.invalid', 'Invalid credentials'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate("/admin/dashboard");
    } catch (err: any) {
      toast({ title: t('admin.login.googleFailed', 'Google sign-in failed'), description: err?.message, variant: "destructive" });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('admin.portal', 'Admin Portal')}</h1>
          <p className="text-muted-foreground">
            {t('admin.secure', 'Secure access for authorized personnel only')}
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              {t('admin.login.title', 'Administrator Login')}
            </CardTitle>
            <CardDescription>
              {t('admin.login.desc', 'Enter your credentials to access the admin dashboard')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">{t('admin.login.email', 'Email')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="email"
                    value={credentials.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    placeholder={t('admin.login.emailPh', 'you@example.com')}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t('admin.login.password', 'Password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder={t('admin.login.passwordPh', 'Enter your password')}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-muted/30 p-3 rounded-lg text-sm">
                <p>{t('admin.login.note', 'Use your admin email and password set in Firebase Authentication.')}</p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? t('admin.login.signing', 'Signing in...') : t('admin.login.signIn', 'Sign In')}
              </Button>

              {/* Divider */}
              <div className="relative text-center text-sm text-muted-foreground">
                <span className="bg-background px-2 relative z-10">{t('common.or', 'or')}</span>
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t" />
              </div>

              {/* Google Sign-In */}
              <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={isGoogleLoading}>
                {isGoogleLoading ? t('admin.login.connecting', 'Connecting...') : t('admin.login.google', 'Continue with Google')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {t('admin.securityNotice', 'This is a secure government portal. All access attempts are logged and monitored. Unauthorized access is strictly prohibited and may result in legal action.')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support Contact */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            {t('admin.support.q', 'Need technical support?')}{" "}
            <Button variant="link" size="sm" className="p-0">
              {t('admin.support.cta', 'Contact IT Support')}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;