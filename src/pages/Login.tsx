import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Scan, Loader2, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { captchaService } from "@/services/api/captcha.service";
import { recaptchaService } from "@/services/api/recaptcha.service";
import { PuzzleCaptcha } from "@/components/PuzzleCaptcha";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [captchaProvider, setCaptchaProvider] = useState<'puzzle' | 'recaptcha' | 'none'>('none');
  const [puzzleCaptchaToken, setPuzzleCaptchaToken] = useState<string | null>(null);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil redirect param dari URL, contoh: /login?redirect=/developer/checkout?plan_id=xxx
  const redirectParam = new URLSearchParams(location.search).get("redirect");

  // Load CAPTCHA configuration on mount
  useEffect(() => {
    loadCaptchaConfig();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      handlePostLoginRedirect(user.role);
    }
  }, [isAuthenticated, user]);

  /**
   * Load CAPTCHA configuration
   */
  const loadCaptchaConfig = async () => {
    try {
      const provider = await captchaService.getProvider();
      setCaptchaProvider(provider);
    } catch (error) {}
  };

  /**
   * Setelah login berhasil:
   * - Jika ada ?redirect=..., navigasi ke sana
   * - Jika tidak, navigasi berdasarkan role seperti biasa
   */
  const handlePostLoginRedirect = (role: string) => {
    if (redirectParam) {
      navigate(redirectParam, { replace: true });
      return;
    }
    redirectBasedOnRole(role);
  };

  /**
   * Fallback redirect berdasarkan role (tanpa redirect param)
   */
  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'photographer':
        navigate('/photographer/dashboard', { replace: true });
        break;
      case 'admin':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'user':
      default:
        navigate('/user/dashboard', { replace: true });
        break;
    }
  };

  /**
   * Handle puzzle CAPTCHA completion
   */
  const handlePuzzleComplete = (token: string) => {
    setPuzzleCaptchaToken(token);
  };

  /**
   * Handle puzzle CAPTCHA error
   */
  const handlePuzzleError = (error: string) => {
    console.error('❌ Puzzle CAPTCHA error:', error);
    setPuzzleCaptchaToken(null);
  };

  /**
   * Handle login form submission
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRemainingAttempts(null);

    try {
      let captchaToken: string | null = null;

      // Get CAPTCHA token based on provider
      if (requiresCaptcha) {
        if (captchaProvider === 'puzzle') {
          if (!puzzleCaptchaToken) {
            throw new Error('Please complete the security verification');
          }
          captchaToken = puzzleCaptchaToken;
        } else if (captchaProvider === 'recaptcha') {
          setCaptchaLoading(true);
          captchaToken = await recaptchaService.executeRecaptcha('login');
          setCaptchaLoading(false);

          if (!captchaToken) {
            throw new Error('Failed to verify reCAPTCHA');
          }
        }
      }

      // Attempt login
      const result = await login(email, password, captchaToken);

      // Reset puzzle token after use
      setPuzzleCaptchaToken(null);

      // Redirect: cek redirect param dulu, baru fallback role
      if (result && result.user) {
        handlePostLoginRedirect(result.user.role);
      }

    } catch (error: any) {
      // Reset puzzle token on error
      setPuzzleCaptchaToken(null);

      if (error.response?.data?.remainingAttempts !== undefined) {
        setRemainingAttempts(error.response.data.remainingAttempts);
        if (error.response.data.remainingAttempts < 3) {
          setRequiresCaptcha(true);
        }
      }

      if (error.response?.data?.code === 'CAPTCHA_REQUIRED') {
        setRequiresCaptcha(true);
      }

      if (error.response?.data?.code === 'CAPTCHA_INVALID') {
        setRequiresCaptcha(true);
      }

      // Error toast sudah dihandle oleh AuthContext
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
              {/* Jika ada redirect ke checkout, tampilkan hint kecil */}
              {redirectParam?.includes('/developer/checkout')
                ? "Masuk dulu untuk melanjutkan pembayaran paket API"
                : "Masuk ke akun kamu"}
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
            {requiresCaptcha && captchaProvider !== 'none' && (
              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>Verifikasi keamanan diperlukan</strong>
                  <br />
                  {captchaProvider === 'puzzle'
                    ? 'Selesaikan puzzle di bawah untuk melanjutkan.'
                    : 'Login Anda akan diverifikasi dengan reCAPTCHA untuk keamanan.'}
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
                <Link to="/forgot" className="text-primary hover:underline font-medium">
                  Lupa kata sandi?
                </Link>
              </div>

              {/* Puzzle CAPTCHA Component */}
              {requiresCaptcha && captchaProvider === 'puzzle' && (
                <PuzzleCaptcha
                  action="login"
                  onComplete={handlePuzzleComplete}
                  onError={handlePuzzleError}
                />
              )}

              {/* reCAPTCHA Badge Info */}
              {requiresCaptcha && captchaProvider === 'recaptcha' && (
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
                disabled={loading || captchaLoading || (requiresCaptcha && captchaProvider === 'puzzle' && !puzzleCaptchaToken)}
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
              <Link
                to={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : "/register"}
                className="text-primary hover:underline font-medium"
              >
                Daftar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;