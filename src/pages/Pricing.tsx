import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Camera, 
  Zap, 
  Shield, 
  Clock, 
  Sparkles, 
  Check,
  X,
  Crown,
  Rocket,
  Users,
  Code,
  Database,
  Settings,
  BarChart,
  Headphones,
  Star,
  ArrowRight,
  Info,
  TrendingUp,
  Globe,
  Lock
} from "lucide-react";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Pricing = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [activeTab, setActiveTab] = useState("user");

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[id^='animate-']").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const userPlans = [
    {
      name: "Free",
      icon: Camera,
      price: 0,
      priceYearly: 0,
      description: "Untuk mencoba fitur dasar",
      popular: false,
      color: "text-gray-500",
      gradient: "from-gray-400 to-gray-600",
      features: [
        { text: "5 pencarian per bulan", included: true },
        { text: "1 upload wajah", included: true },
        { text: "Download kualitas standar", included: true },
        { text: "Akses 3 event", included: true },
        { text: "Face recognition dasar", included: true },
        { text: "Support email (48 jam)", included: true },
        { text: "Download batch", included: false },
        { text: "Priority support", included: false },
        { text: "Advanced AI", included: false },
      ],
      cta: "Mulai Gratis",
      ctaVariant: "outline"
    },
    {
      name: "Pro",
      icon: Zap,
      price: 49000,
      priceYearly: 490000,
      description: "Untuk pengguna aktif",
      popular: true,
      color: "text-primary",
      gradient: "from-primary to-secondary",
      features: [
        { text: "100 pencarian per bulan", included: true },
        { text: "5 upload wajah", included: true },
        { text: "Download kualitas HD", included: true },
        { text: "Akses unlimited event", included: true },
        { text: "Advanced face recognition", included: true },
        { text: "Support email (24 jam)", included: true },
        { text: "Download batch (max 50)", included: true },
        { text: "Priority support", included: true },
        { text: "Face history 6 bulan", included: true },
      ],
      cta: "Pilih Pro",
      ctaVariant: "default"
    },
    {
      name: "Premium",
      icon: Crown,
      price: 99000,
      priceYearly: 990000,
      description: "Untuk power users",
      popular: false,
      color: "text-yellow-500",
      gradient: "from-yellow-500 to-orange-500",
      features: [
        { text: "Unlimited pencarian", included: true },
        { text: "Unlimited upload wajah", included: true },
        { text: "Download kualitas original", included: true },
        { text: "Akses unlimited event", included: true },
        { text: "AI recognition terbaik", included: true },
        { text: "Support 24/7 (prioritas)", included: true },
        { text: "Download batch unlimited", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Face history unlimited", included: true },
      ],
      cta: "Pilih Premium",
      ctaVariant: "default"
    },
  ];

  const apiPlans = [
    {
      name: "Starter API",
      icon: Code,
      price: 199000,
      priceYearly: 1990000,
      tokens: "10,000",
      pricePerToken: "Rp 20",
      description: "Untuk developer & startup",
      popular: false,
      color: "text-blue-500",
      gradient: "from-blue-500 to-cyan-500",
      features: [
        { text: "10,000 API calls/bulan", included: true },
        { text: "Rate limit: 100 req/min", included: true },
        { text: "REST API access", included: true },
        { text: "Basic documentation", included: true },
        { text: "Email support (48 jam)", included: true },
        { text: "99.5% uptime SLA", included: true },
        { text: "Webhook support", included: false },
        { text: "Custom integration", included: false },
        { text: "Dedicated support", included: false },
      ],
      cta: "Mulai Development",
      ctaVariant: "outline"
    },
    {
      name: "Business API",
      icon: Rocket,
      price: 499000,
      priceYearly: 4990000,
      tokens: "50,000",
      pricePerToken: "Rp 10",
      description: "Untuk bisnis berkembang",
      popular: true,
      color: "text-purple-500",
      gradient: "from-purple-500 to-pink-500",
      features: [
        { text: "50,000 API calls/bulan", included: true },
        { text: "Rate limit: 500 req/min", included: true },
        { text: "REST & GraphQL API", included: true },
        { text: "Complete documentation", included: true },
        { text: "Priority support (24 jam)", included: true },
        { text: "99.9% uptime SLA", included: true },
        { text: "Webhook support", included: true },
        { text: "Custom integration support", included: true },
        { text: "Monthly analytics report", included: true },
      ],
      cta: "Pilih Business",
      ctaVariant: "default"
    },
    {
      name: "Enterprise API",
      icon: Globe,
      price: "Custom",
      priceYearly: "Custom",
      tokens: "Unlimited",
      pricePerToken: "Custom",
      description: "Untuk perusahaan besar",
      popular: false,
      color: "text-green-500",
      gradient: "from-green-500 to-emerald-500",
      features: [
        { text: "Unlimited API calls", included: true },
        { text: "Custom rate limits", included: true },
        { text: "All API protocols", included: true },
        { text: "White-label solution", included: true },
        { text: "Dedicated support 24/7", included: true },
        { text: "99.99% uptime SLA", included: true },
        { text: "Custom webhooks", included: true },
        { text: "On-premise deployment option", included: true },
        { text: "Dedicated account team", included: true },
      ],
      cta: "Hubungi Sales",
      ctaVariant: "default"
    },
  ];

  const tokenPricing = [
    { range: "1 - 10,000", price: "Rp 20", discount: "" },
    { range: "10,001 - 50,000", price: "Rp 15", discount: "25% off" },
    { range: "50,001 - 100,000", price: "Rp 12", discount: "40% off" },
    { range: "100,001 - 500,000", price: "Rp 10", discount: "50% off" },
    { range: "500,001+", price: "Rp 8", discount: "60% off" },
  ];

  const features = [
    {
      icon: Shield,
      title: "Keamanan Terjamin",
      description: "Enkripsi end-to-end untuk semua data"
    },
    {
      icon: Clock,
      title: "Pemrosesan Cepat",
      description: "Response time < 2 detik"
    },
    {
      icon: BarChart,
      title: "Analytics Dashboard",
      description: "Monitor penggunaan real-time"
    },
    {
      icon: Headphones,
      title: "Support Responsif",
      description: "Tim siap membantu 24/7"
    },
  ];

  const faqs = [
    {
      q: "Apa itu token API?",
      a: "Token API adalah satuan untuk menghitung setiap request yang Anda lakukan ke sistem kami. Setiap pencarian wajah = 1 token."
    },
    {
      q: "Bagaimana cara upgrade paket?",
      a: "Anda bisa upgrade kapan saja dari dashboard. Perbedaan harga akan diprorata untuk periode aktif."
    },
    {
      q: "Apakah ada kontrak jangka panjang?",
      a: "Tidak ada kontrak. Anda bisa cancel atau downgrade kapan saja tanpa penalty."
    },
    {
      q: "Apakah token yang tidak terpakai bisa rollover?",
      a: "Token akan reset setiap bulan. Namun untuk paket annual, Anda mendapat 12 bulan penuh dengan harga lebih hemat."
    },
  ];

  const currentPlans = activeTab === "user" ? userPlans : apiPlans;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
        <div className="container relative">
          <div 
            id="animate-hero"
            className={`mx-auto max-w-3xl text-center transition-all duration-1000 ${
              isVisible['animate-hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary animate-pulse">
              <Sparkles className="h-4 w-4" />
              <span>Paket Harga</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Pilih Paket yang{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Sesuai Kebutuhan Anda
              </span>
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Harga transparan, tanpa biaya tersembunyi. Upgrade, downgrade, atau cancel kapan saja.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Bulanan
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative h-8 w-14 rounded-full bg-muted transition-colors hover:bg-muted/80"
              >
                <div
                  className={`absolute top-1 h-6 w-6 rounded-full bg-primary transition-transform duration-300 ${
                    billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Tahunan
              </span>
              <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                Hemat 17%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Selection */}
      <section className="py-8 border-b">
        <div className="container">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab("user")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "user"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Users className="inline-block h-5 w-5 mr-2" />
              Untuk Pengguna
            </button>
            <button
              onClick={() => setActiveTab("api")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "api"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Code className="inline-block h-5 w-5 mr-2" />
              Untuk Developer (API)
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-3">
            {currentPlans.map((plan, index) => {
              const Icon = plan.icon;
              const displayPrice = billingCycle === 'yearly' ? plan.priceYearly : plan.price;
              const monthlyEquivalent = billingCycle === 'yearly' && typeof displayPrice === 'number' 
                ? Math.round(displayPrice / 12) 
                : null;
              
              return (
                <Card
                  key={index}
                  id={`animate-plan-${index}`}
                  className={`relative overflow-hidden transition-all duration-500 ${
                    plan.popular
                      ? 'border-primary shadow-xl scale-105 lg:scale-110'
                      : 'border-border/50 hover:shadow-lg hover:-translate-y-2'
                  } ${
                    isVisible[`animate-plan-${index}`]
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-1 text-xs font-bold">
                      POPULER
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${plan.gradient} text-white mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    
                    <div className="mt-4">
                      {typeof displayPrice === 'number' ? (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">
                              Rp {displayPrice.toLocaleString('id-ID')}
                            </span>
                            <span className="text-muted-foreground">
                              /{billingCycle === 'yearly' ? 'tahun' : 'bulan'}
                            </span>
                          </div>
                          {monthlyEquivalent && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Rp {monthlyEquivalent.toLocaleString('id-ID')}/bulan
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-4xl font-bold">{displayPrice}</div>
                      )}
                      
                      {activeTab === "api" && plan.tokens && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">Token per bulan</div>
                          <div className="text-lg font-bold">{plan.tokens} calls</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {plan.pricePerToken}/token
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Button 
                      className={`w-full mb-6 ${plan.popular ? 'shadow-lg' : ''}`}
                      variant={plan.ctaVariant}
                      size="lg"
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <div className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground/30 shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Token Pricing Table (Only for API) */}
      {activeTab === "api" && (
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div
              id="animate-token-title"
              className={`text-center mb-12 transition-all duration-1000 ${
                isVisible['animate-token-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h2 className="text-3xl font-bold mb-4">Pay As You Go - Token Pricing</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Beli token sesuai kebutuhan dengan harga yang semakin murah untuk pembelian lebih banyak
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-semibold">Jumlah Token</th>
                          <th className="text-right p-4 font-semibold">Harga per Token</th>
                          <th className="text-right p-4 font-semibold">Diskon</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tokenPricing.map((tier, index) => (
                          <tr 
                            key={index}
                            id={`animate-token-${index}`}
                            className={`border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                              isVisible[`animate-token-${index}`]
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 -translate-x-10'
                            }`}
                            style={{ transitionDelay: `${index * 50}ms` }}
                          >
                            <td className="p-4 font-medium">{tier.range} tokens</td>
                            <td className="p-4 text-right font-bold text-primary">{tier.price}</td>
                            <td className="p-4 text-right">
                              {tier.discount && (
                                <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                                  {tier.discount}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-600 mb-1">Cara Kerja Token:</p>
                    <p className="text-muted-foreground">
                      Setiap API call untuk face recognition menggunakan 1 token. Token yang dibeli tidak memiliki masa kadaluarsa dan bisa digunakan kapan saja.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="py-20">
        <div className="container">
          <div
            id="animate-features-title"
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible['animate-features-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">Semua Paket Mendapat</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Fitur unggulan yang tersedia di semua paket
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  id={`animate-feature-${index}`}
                  className={`text-center transition-all duration-1000 ${
                    isVisible[`animate-feature-${index}`]
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 text-primary transform hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div
            id="animate-faq-title"
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible['animate-faq-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">Pertanyaan yang Sering Diajukan</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Masih ada pertanyaan? Hubungi tim support kami
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                id={`animate-faq-${index}`}
                className={`transition-all duration-1000 hover:shadow-lg ${
                  isVisible[`animate-faq-${index}`]
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-start gap-2">
                    <span className="text-primary">Q:</span>
                    {faq.q}
                  </h3>
                  <p className="text-muted-foreground text-sm pl-6">
                    {faq.a}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-90" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
            animation: 'moveBackground 20s linear infinite',
          }}
        />
        <style>
          {`
            @keyframes moveBackground {
              0% { transform: translate(0, 0); }
              100% { transform: translate(40px, 40px); }
            }
          `}
        </style>
        <div className="container relative">
          <div
            id="animate-cta"
            className={`mx-auto max-w-3xl text-center text-primary-foreground transition-all duration-1000 ${
              isVisible['animate-cta'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <Star className="h-16 w-16 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold mb-4">Mulai Gratis Hari Ini</h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Tidak perlu kartu kredit. Upgrade kapan saja sesuai kebutuhan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="shadow-lg hover:scale-105 transition-transform duration-300">
                <Camera className="mr-2 h-5 w-5" />
                Coba Gratis
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:scale-105 transition-transform duration-300">
                Hubungi Sales
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Pricing;