import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Camera, 
  Zap, 
  Shield, 
  Clock, 
  Sparkles, 
  Search,
  Download,
  Users,
  Lock,
  Smartphone,
  Globe,
  CheckCircle2,
  ArrowRight,
  Image,
  Brain,
  Star,
  TrendingUp,
  Heart,
  Layers
} from "lucide-react";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Features = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [activeFeature, setActiveFeature] = useState(0);

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

  const mainFeatures = [
    {
      icon: Brain,
      title: "AI Face Recognition",
      description: "Teknologi AI canggih yang dapat mengenali wajah Anda dengan akurasi hingga 95%+ di ribuan foto",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Instant Search",
      description: "Temukan semua foto Anda dalam hitungan detik. Tidak perlu scroll ratusan foto lagi",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Data wajah Anda dienkripsi end-to-end dan tidak pernah dibagikan kepada pihak ketiga",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Download,
      title: "Easy Download",
      description: "Download semua foto Anda sekaligus atau pilih foto favorit dengan mudah",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      gradient: "from-green-500 to-emerald-500"
    },
  ];

  const detailedFeatures = [
    {
      icon: Camera,
      title: "Upload Wajah Sekali",
      description: "Cukup upload foto wajah Anda satu kali, dan sistem kami akan mengingat untuk pencarian berikutnya",
      benefits: [
        "Upload foto selfie atau portrait",
        "Multiple face angles untuk akurasi lebih baik",
        "Tidak perlu upload ulang setiap event"
      ]
    },
    {
      icon: Search,
      title: "Smart Search Algorithm",
      description: "Algoritma pencarian pintar yang terus belajar dan meningkat seiring waktu",
      benefits: [
        "Machine learning untuk hasil lebih akurat",
        "Pencarian di multiple events sekaligus",
        "Filter berdasarkan tanggal dan lokasi"
      ]
    },
    {
      icon: Image,
      title: "High Quality Photos",
      description: "Semua foto tersedia dalam resolusi penuh tanpa kompresi",
      benefits: [
        "Download dalam kualitas original",
        "Preview dengan loading cepat",
        "Support berbagai format file"
      ]
    },
    {
      icon: Clock,
      title: "Real-time Processing",
      description: "Pemrosesan foto secara real-time begitu photographer upload",
      benefits: [
        "Notifikasi instant ketika foto tersedia",
        "Live update dari event yang berlangsung",
        "Akses cepat tanpa delay"
      ]
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Akses dari smartphone, tablet, atau desktop dengan pengalaman optimal",
      benefits: [
        "Responsive design untuk semua device",
        "Progressive Web App (PWA)",
        "Offline mode untuk foto yang sudah didownload"
      ]
    },
    {
      icon: Users,
      title: "Multi-Event Support",
      description: "Cari foto Anda dari berbagai event yang berbeda dalam satu platform",
      benefits: [
        "Dashboard untuk semua event Anda",
        "History pencarian tersimpan",
        "Bookmark event favorit"
      ]
    }
  ];

  const benefits = [
    {
      icon: Star,
      title: "Hemat Waktu",
      description: "Yang tadinya butuh 30 menit scroll foto, sekarang hanya 30 detik",
      stat: "95%"
    },
    {
      icon: Heart,
      title: "Lebih Menyenangkan",
      description: "Nikmati event tanpa khawatir mencari foto setelahnya",
      stat: "100%"
    },
    {
      icon: TrendingUp,
      title: "Akurasi Tinggi",
      description: "Teknologi AI kami memiliki tingkat akurasi pengenalan wajah hingga 95%+",
      stat: "95%+"
    },
    {
      icon: Lock,
      title: "Aman & Privat",
      description: "Data Anda dilindungi dengan enkripsi tingkat bank",
      stat: "256-bit"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Upload Foto Wajah",
      description: "Upload foto selfie atau portrait Anda. Sistem kami akan memprosesnya dengan AI.",
      icon: Camera
    },
    {
      step: "2",
      title: "Pilih Event",
      description: "Pilih event yang ingin Anda cari fotonya dari daftar event yang tersedia.",
      icon: Search
    },
    {
      step: "3",
      title: "Temukan Foto Anda",
      description: "AI kami akan mencari dan menampilkan semua foto yang ada wajah Anda.",
      icon: Sparkles
    },
    {
      step: "4",
      title: "Download & Bagikan",
      description: "Download foto favorit Anda atau bagikan langsung ke social media.",
      icon: Download
    }
  ];

  const techSpecs = [
    { label: "Akurasi AI", value: "95%+", icon: Brain },
    { label: "Kecepatan Proses", value: "< 30 detik", icon: Zap },
    { label: "Format Support", value: "JPG, PNG, HEIC", icon: Image },
    { label: "Max File Size", value: "50MB", icon: Layers },
    { label: "Enkripsi", value: "AES-256", icon: Shield },
    { label: "Uptime", value: "99.9%", icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section dengan Parallax */}
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
              <span>Fitur Unggulan</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Teknologi AI yang Membuat{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Pencarian Foto Jadi Mudah
              </span>
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Temukan semua foto Anda dari event apapun dengan teknologi face recognition terdepan. Cepat, akurat, dan aman.
            </p>

            <Button size="lg" className="shadow-lg hover:scale-105 transition-transform duration-300">
              <Camera className="mr-2 h-5 w-5" />
              Coba Sekarang Gratis
            </Button>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div
            id="animate-main-features-title"
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible['animate-main-features-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">Fitur Utama</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Teknologi terbaik untuk pengalaman pencarian foto yang sempurna
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  id={`animate-main-${index}`}
                  className={`group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-border/50 overflow-hidden ${
                    isVisible[`animate-main-${index}`]
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-6">
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                  <div className={`h-1 bg-gradient-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container">
          <div
            id="animate-how-title"
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible['animate-how-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">Cara Kerja</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hanya 4 langkah mudah untuk menemukan semua foto Anda
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8 md:grid-cols-2">
              {howItWorks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    id={`animate-how-${index}`}
                    className={`relative transition-all duration-1000 ${
                      isVisible[`animate-how-${index}`]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold text-xl shadow-lg">
                            {item.step}
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <Icon className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">{item.title}</h3>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div
            id="animate-detailed-title"
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible['animate-detailed-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">Fitur Lengkap</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk pengalaman terbaik
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {detailedFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  id={`animate-detailed-${index}`}
                  className={`group hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border-border/50 ${
                    isVisible[`animate-detailed-${index}`]
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 text-primary group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">{benefit}</p>
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

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container">
          <div
            id="animate-benefits-title"
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible['animate-benefits-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">Kenapa Memilih Kami?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Manfaat yang akan Anda dapatkan dengan menggunakan AmbilFoto.id
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  id={`animate-benefit-${index}`}
                  className={`text-center transition-all duration-1000 ${
                    isVisible[`animate-benefit-${index}`]
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground transform hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {benefit.stat}
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Specs Section
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div
            id="animate-specs-title"
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible['animate-specs-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">Spesifikasi Teknis</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Detail teknis yang mendukung performa optimal
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {techSpecs.map((spec, index) => {
              const Icon = spec.icon;
              return (
                <div
                  key={index}
                  id={`animate-spec-${index}`}
                  className={`flex items-center gap-4 p-6 rounded-xl bg-background border border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                    isVisible[`animate-spec-${index}`]
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-10'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{spec.label}</div>
                    <div className="text-lg font-bold">{spec.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section> */}

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
            <Sparkles className="h-16 w-16 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold mb-4">Siap Menemukan Foto Anda?</h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Bergabung dengan ribuan pengguna yang sudah merasakan kemudahan mencari foto dengan AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="shadow-lg hover:scale-105 transition-transform duration-300">
                <Camera className="mr-2 h-5 w-5" />
                Mulai Gratis
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:scale-105 transition-transform duration-300">
                Lihat Demo
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

export default Features;