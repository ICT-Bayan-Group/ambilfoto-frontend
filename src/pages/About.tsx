import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Camera, 
  Users, 
  Target, 
  Heart, 
  Sparkles, 
  TrendingUp,
  Award,
  Globe,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const About = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});

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

  const stats = [
    { number: "50K+", label: "Pengguna Aktif", icon: Users },
    { number: "1M+", label: "Foto Diproses", icon: Camera },
    { number: "95%", label: "Akurasi AI", icon: Target },
    { number: "500+", label: "Event Partner", icon: Award },
  ];

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "Kepuasan pengguna adalah prioritas utama kami. Setiap fitur dirancang dengan user experience terbaik.",
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Data wajah Anda dienkripsi dan dilindungi dengan standar keamanan tertinggi. Privasi Anda adalah hak Anda.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Sparkles,
      title: "Innovation",
      description: "Kami terus berinovasi menggunakan teknologi AI terkini untuk memberikan pengalaman terbaik.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: TrendingUp,
      title: "Continuous Growth",
      description: "Berkembang bersama komunitas kami, terus meningkatkan layanan berdasarkan feedback pengguna.",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
  ];

  const timeline = [
    {
      year: "2023",
      title: "Awal Perjalanan",
      description: "AmbilFoto.id diluncurkan dengan visi membuat pencarian foto acara lebih mudah menggunakan AI."
    },
    {
      year: "2024",
      title: "Ekspansi Nasional",
      description: "Bermitra dengan 200+ event organizer di seluruh Indonesia dan mencapai 10,000 pengguna."
    },
    {
      year: "2025",
      title: "Inovasi Berkelanjutan",
      description: "Meluncurkan fitur-fitur baru dan meningkatkan akurasi AI hingga 95%+ dengan teknologi deep learning."
    },
  ];

  const achievements = [
    "Teknologi Face Recognition dengan Akurasi Tinggi",
    "Partnership dengan Event Organizer Terkemuka",
    "Pemrosesan Foto Real-time dalam Hitungan Detik",
    "Sistem Keamanan Data Berstandar Internasional",
    "Customer Support 24/7",
    "Interface yang User-Friendly dan Intuitif"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
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
              <span>Tentang Kami</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Misi Kami: Membuat{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Setiap Momen Mudah Ditemukan
              </span>
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              AmbilFoto.id adalah platform AI-powered photo recognition yang membantu Anda menemukan foto dari acara apapun dengan mudah dan cepat.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section dengan Counter Animation */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  id={`animate-stat-${index}`}
                  className={`text-center transition-all duration-700 ${
                    isVisible[`animate-stat-${index}`]
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 text-primary transform hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div
              id="animate-story"
              className={`transition-all duration-1000 ${
                isVisible['animate-story'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              <h2 className="text-3xl font-bold mb-6">Cerita Kami</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  AmbilFoto.id lahir dari pengalaman pribadi kami yang sering kesulitan menemukan foto diri sendiri setelah menghadiri berbagai acara. Kami tahu betapa frustrasinya harus scroll ratusan atau bahkan ribuan foto hanya untuk menemukan beberapa foto diri kita.
                </p>
                <p>
                  Dengan memanfaatkan teknologi Artificial Intelligence dan Face Recognition terkini, kami menciptakan solusi yang membuat proses ini menjadi instant dan effortless. Cukup upload wajah Anda sekali, dan biarkan AI kami bekerja menemukan semua foto Anda dari berbagai acara.
                </p>
                <p>
                  Hari ini, kami bangga telah membantu puluhan ribu pengguna menemukan momen-momen berharga mereka, dan kami terus berkembang untuk memberikan layanan terbaik.
                </p>
              </div>
            </div>
            
            <div
              id="animate-story-img"
              className={`relative transition-all duration-1000 delay-300 ${
                isVisible['animate-story-img'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl" />
              <img 
                src="https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg" 
                alt="Team collaboration"
                className="relative aspect-square rounded-2xl object-cover shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section dengan Hover Effect */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div
            id="animate-values-title"
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible['animate-values-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">Nilai-Nilai Kami</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Prinsip yang memandu setiap keputusan dan inovasi kami
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  id={`animate-value-${index}`}
                  className={`group hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border-border/50 ${
                    isVisible[`animate-value-${index}`]
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-6">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${value.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-6 w-6 ${value.color}`} />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="container">
          <div
            id="animate-timeline-title"
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible['animate-timeline-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">Perjalanan Kami</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dari ide hingga menjadi platform terpercaya untuk ribuan pengguna
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <div
                key={index}
                id={`animate-timeline-${index}`}
                className={`relative pl-8 pb-12 border-l-2 border-primary/20 last:pb-0 transition-all duration-1000 ${
                  isVisible[`animate-timeline-${index}`]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="absolute left-0 top-0 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg">
                  {index + 1}
                </div>
                <div className="mb-1 text-sm font-semibold text-primary">
                  {item.year}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div
              id="animate-achievements-img"
              className={`relative order-2 lg:order-1 transition-all duration-1000 ${
                isVisible['animate-achievements-img'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-3xl blur-2xl" />
              <img 
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg" 
                alt="Technology and innovation"
                className="relative aspect-square rounded-2xl object-cover shadow-lg"
              />
            </div>

            <div
              id="animate-achievements"
              className={`order-1 lg:order-2 transition-all duration-1000 delay-300 ${
                isVisible['animate-achievements'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
            >
              <h2 className="text-3xl font-bold mb-6">Keunggulan Kami</h2>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start group"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      {achievement}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20">
        <div className="container">
          <div
            id="animate-tech-title"
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible['animate-tech-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">Teknologi Kami</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Didukung oleh teknologi AI dan machine learning terdepan
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Zap, title: "Deep Learning", desc: "Neural networks canggih untuk pengenalan wajah akurat" },
              { icon: Shield, title: "Encryption", desc: "End-to-end encryption untuk melindungi data Anda" },
              { icon: Clock, title: "Real-time Processing", desc: "Pemrosesan instant dengan cloud computing" },
            ].map((tech, index) => {
              const Icon = tech.icon;
              return (
                <Card
                  key={index}
                  id={`animate-tech-${index}`}
                  className={`group hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border-border/50 overflow-hidden ${
                    isVisible[`animate-tech-${index}`]
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{tech.title}</h3>
                    <p className="text-muted-foreground text-sm">{tech.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section dengan Animated Background */}
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
            <Globe className="h-16 w-16 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold mb-4">Bergabunglah dengan Kami</h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Mari bersama-sama membuat pencarian foto acara menjadi lebih mudah dan menyenangkan untuk semua orang.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="shadow-lg hover:scale-105 transition-transform duration-300">
                <Camera className="mr-2 h-5 w-5" />
                Mulai Sekarang
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:scale-105 transition-transform duration-300">
                Hubungi Kami
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Simple Footer */}
      <Footer/>
    </div>
  );
};

export default About;