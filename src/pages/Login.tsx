import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Scan, Loader2, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { recaptchaService } from "@/services/api/recaptcha.service";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectBasedOnRole(user.role);
    }
  }, [isAuthenticated, user, navigate]);

  // Helper function to redirect based on role
  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'photographer':
        navigate('/photographer/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'user':
      default:
        navigate('/user/dashboard');
        break;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRemainingAttempts(null);
    
    try {
      // Get reCAPTCHA token if enabled and required
      let captchaToken: string | null = null;
      if (recaptchaService.isEnabled() && (requiresCaptcha || remainingAttempts !== null && remainingAttempts < 3)) {
        setCaptchaLoading(true);
        captchaToken = await recaptchaService.executeRecaptcha('login');
        setCaptchaLoading(false);
        
        if (!captchaToken && requiresCaptcha) {
          throw new Error('Failed to verify reCAPTCHA');
        }
      }

      const result = await login(email, password, captchaToken);
      
      // Redirect based on user role
      if (result && result.user) {
        redirectBasedOnRole(result.user.role);
      }
    } catch (error: any) {
      // Check if error response contains remaining attempts
      if (error.response?.data?.remainingAttempts !== undefined) {
        setRemainingAttempts(error.response.data.remainingAttempts);
        
        // If attempts are low, next attempt will require CAPTCHA
        if (error.response.data.remainingAttempts < 3) {
          setRequiresCaptcha(true);
        }
      }
      
      // Check if CAPTCHA is required
      if (error.response?.data?.code === 'CAPTCHA_REQUIRED') {
        setRequiresCaptcha(true);
        console.log('CAPTCHA now required for next attempt');
      }
      
      // Check if CAPTCHA failed
      if (error.response?.data?.code === 'CAPTCHA_INVALID') {
        console.log('CAPTCHA verification failed');
      }
      
      // Check if account is locked
      if (error.response?.data?.code === 'ACCOUNT_LOCKED') {
        console.log('Account locked due to too many failed attempts');
      }
      
      // Error already handled by AuthContext toast
    } finally {
      setLoading(false);
      setCaptchaLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-background p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center w-full transition-all duration-200 hover:opacity-80">
          <img 
            src="https://res.cloudinary.com/dwyi4d3rq/image/upload/v1765171746/ambilfoto-logo_hvn8s2.png" 
            alt="AmbilFoto.id Logo" 
            className="h-24 mx-auto w-auto"
          />
        </Link>
        
        <Card className="shadow-strong border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Selamat Datang!</CardTitle>
            <CardDescription>
              Masuk ke akun kamu 
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Failed Attempts Warning */}
            {remainingAttempts !== null && remainingAttempts < 5 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {remainingAttempts === 0 ? (
                    <strong>Akun terkunci sementara. Silakan coba lagi nanti atau reset password Anda.</strong>
                  ) : (
                    <>
                      <strong>Percobaan login gagal!</strong>
                      <br />
                      Sisa percobaan: <strong>{remainingAttempts}</strong> kali lagi
                      {remainingAttempts <= 2 && (
                        <div className="mt-2">
                          <Link to="/forgot" className="underline font-semibold">
                            Lupa password? Klik di sini
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* CAPTCHA Required Warning */}
            {requiresCaptcha && recaptchaService.isEnabled() && (
              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>Verifikasi keamanan diperlukan</strong>
                  <br />
                  Login Anda akan diverifikasi dengan reCAPTCHA untuk keamanan.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border" disabled={loading} />
                  <span className="text-muted-foreground">Ingat saya</span>
                </label>
                <Link 
                  to="/forgot" 
                  className="text-primary hover:underline font-medium"
                >
                  Lupa kata sandi?
                </Link>
              </div>

              {/* reCAPTCHA Badge Info */}
              {recaptchaService.isEnabled() && requiresCaptcha && (
                <Alert className="bg-slate-50 border-slate-200">
                  <Shield className="h-4 w-4 text-slate-600" />
                  <AlertDescription className="text-slate-900 text-xs">
                    Situs ini dilindungi oleh reCAPTCHA dan berlaku{" "}
                    <a 
                      href="https://policies.google.com/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </a>
                    {" "}dan{" "}
                    <a 
                      href="https://policies.google.com/terms" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Terms of Service
                    </a>
                    {" "}Google.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || captchaLoading}
                size="lg"
              >
                {captchaLoading ? (
                  <>
                    <Shield className="mr-2 h-4 w-4 animate-pulse" />
                    Memverifikasi...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Atau</span>
              </div>
            </div>
            
            <Link to="/login/face">
              <Button 
                variant="outline" 
                className="w-full" 
                disabled={loading}
                size="lg"
              >
                <Scan className="mr-2 h-4 w-4" />
                Masuk dengan Face Scan
              </Button>
            </Link>
            
            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Daftar
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="mt-4 bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Untuk keamanan akun Anda, kami membatasi percobaan login. Setelah 5 kali percobaan gagal, akun akan dikunci sementara selama 15 menit.
                {recaptchaService.isEnabled() && " Setelah 3 kali percobaan gagal, verifikasi reCAPTCHA akan diperlukan."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;