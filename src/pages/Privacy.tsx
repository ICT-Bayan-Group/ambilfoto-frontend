import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  UserCheck, 
  FileText,
  AlertCircle,
  Mail,
  CheckCircle2,
  Info,
  Trash2,
  Share2,
  Cookie,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
const PrivacyPolicy = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Detect active section
      const sections = document.querySelectorAll("section[id]");
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section.id);
        }
      });
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    // Wait for DOM to be ready
    setTimeout(() => {
      const elements = document.querySelectorAll("[id^='animate-'], section[id]");
      elements.forEach((el) => {
        observer.observe(el);
      });
    }, 100);

    return () => observer.disconnect();
  }, []);

  const quickLinks = [
    { id: "informasi", label: "Informasi yang Kami Kumpulkan", icon: Database },
    { id: "penggunaan", label: "Cara Kami Menggunakan Data", icon: Eye },
    { id: "keamanan", label: "Keamanan Data", icon: Lock },
    { id: "hak", label: "Hak Anda", icon: UserCheck },
    { id: "cookie", label: "Cookie & Teknologi", icon: Cookie },
    { id: "kontak", label: "Hubungi Kami", icon: Mail },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const lastUpdated = "27 November 2025";

  return (
    <div className="min-h-screen bg-background">
        <Header />

    {/* Hero Section */}
    <section className="relative overflow-hidden py-20 md:py-28">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-primary/10"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        <div className="container relative">
          <div
            id="animate-hero"
            className={`mx-auto max-w-4xl text-center transition-all duration-1000 ${
              isVisible['animate-hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" />
              <span>Privasi & Keamanan</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Kebijakan Privasi
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Kami menghargai privasi Anda. Dokumen ini menjelaskan bagaimana kami mengumpulkan, 
              menggunakan, dan melindungi informasi pribadi Anda.
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Terakhir diperbarui: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation 
      <section className="border-b bg-muted/30 py-8 sticky top-16 z-40 backdrop-blur-md bg-background/80">
        <div className="container">
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-2 min-w-max">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Button
                    key={link.id}
                    variant={activeSection === link.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => scrollToSection(link.id)}
                    className="whitespace-nowrap transition-all"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </section>*/}

      <div className="container py-12">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 space-y-2">
              <p className="mb-4 text-sm font-semibold text-muted-foreground">DAFTAR ISI</p>
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      activeSection === link.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-left">{link.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-12">
            {/* Intro */}
            <section
              id="intro"
              className={`transition-all duration-1000 ${
                isVisible['intro'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Info className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">Selamat Datang di AmbilFoto.id</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        AmbilFoto.id adalah platform AI-powered photo recognition yang membantu Anda menemukan foto dari berbagai acara dengan mudah dan cepat. 
                        Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda, 
                        termasuk data wajah yang Anda upload untuk fitur pengenalan wajah.
                      </p>
                      <p className="mt-3 text-muted-foreground leading-relaxed">
                        Dengan menggunakan layanan kami, Anda menyetujui praktik yang dijelaskan dalam Kebijakan Privasi ini. 
                        Kami sangat menyarankan Anda membaca dokumen ini dengan seksama.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Informasi yang Dikumpulkan */}
            <section id="informasi" className="scroll-mt-32">
              <div
                id="animate-informasi"
                className={`transition-all duration-1000 ${
                  isVisible['animate-informasi'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                    <Database className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">1. Informasi yang Kami Kumpulkan</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Informasi Akun
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      Ketika Anda mendaftar, kami mengumpulkan:
                    </p>
                    <ul className="space-y-2 ml-6">
                      {["Nama lengkap", "Alamat email", "Nomor telepon (opsional)", "Password terenkripsi", "Foto profil (opsional)"].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="mb-3 text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Data Biometrik (Foto Wajah)
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      Untuk fitur face recognition, kami mengumpulkan dan memproses:
                    </p>
                    <ul className="space-y-2 ml-6">
                      {[
                        "Foto wajah yang Anda upload",
                        "Data fitur wajah (face embeddings) yang diekstrak oleh AI",
                        "Metadata foto (ukuran, format, tanggal upload)"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Card className="mt-4 border-amber-500/20 bg-amber-500/5">
                      <CardContent className="pt-4">
                        <div className="flex gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">Penting:</strong> Data wajah Anda dienkripsi end-to-end dan 
                            hanya digunakan untuk mencocokkan foto Anda di acara. Kami TIDAK menjual atau membagikan data wajah 
                            Anda kepada pihak ketiga untuk tujuan komersial.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="mb-3 text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Data Penggunaan
                    </h3>
                    <ul className="space-y-2 ml-6">
                      {[
                        "Riwayat pencarian foto",
                        "Event yang Anda ikuti",
                        "Aktivitas download foto",
                        "Preferensi dan pengaturan akun"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="mb-3 text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Informasi Teknis
                    </h3>
                    <ul className="space-y-2 ml-6">
                      {[
                        "Alamat IP",
                        "Jenis browser dan perangkat",
                        "Sistem operasi",
                        "Log aktivitas dan error logs"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Penggunaan Data */}
            <section id="penggunaan" className="scroll-mt-32">
              <div
                id="animate-penggunaan"
                className={`transition-all duration-1000 ${
                  isVisible['animate-penggunaan'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                    <Eye className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "Menyediakan Layanan Face Recognition",
                      desc: "Mencocokkan wajah Anda dengan foto-foto di database event untuk membantu Anda menemukan foto dengan cepat."
                    },
                    {
                      title: "Meningkatkan Akurasi AI",
                      desc: "Melatih dan mengoptimalkan algoritma face recognition kami untuk hasil yang lebih akurat (data yang digunakan telah di-anonimkan)."
                    },
                    {
                      title: "Mengelola Akun Anda",
                      desc: "Memproses registrasi, login, dan pengaturan preferensi akun Anda."
                    },
                    {
                      title: "Komunikasi dengan Anda",
                      desc: "Mengirim notifikasi terkait layanan, update fitur, dan informasi penting lainnya."
                    },
                    {
                      title: "Keamanan & Fraud Prevention",
                      desc: "Melindungi platform dari penyalahgunaan, aktivitas mencurigakan, dan melindungi hak pengguna lain."
                    },
                    {
                      title: "Analisis & Peningkatan Layanan",
                      desc: "Menganalisis penggunaan platform untuk meningkatkan user experience dan mengembangkan fitur baru."
                    }
                  ].map((item, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-5">
                        <h3 className="mb-2 font-semibold flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed ml-8">
                          {item.desc}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Keamanan Data */}
            <section id="keamanan" className="scroll-mt-32">
              <div
                id="animate-keamanan"
                className={`transition-all duration-1000 ${
                  isVisible['animate-keamanan'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">3. Keamanan & Perlindungan Data</h2>
                </div>

                <Card className="border-green-500/20 bg-green-500/5 mb-6">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                      Kami sangat serius dalam melindungi data Anda, terutama data biometrik (wajah). 
                      Berikut langkah-langkah keamanan yang kami terapkan:
                    </p>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    {
                      icon: Shield,
                      title: "Enkripsi End-to-End",
                      desc: "Semua data wajah dienkripsi menggunakan standar AES-256 saat transit dan penyimpanan.",
                      color: "text-blue-500",
                      bg: "bg-blue-500/10"
                    },
                    {
                      icon: Lock,
                      title: "Secure Storage",
                      desc: "Data disimpan di server cloud dengan sertifikasi keamanan internasional (ISO 27001).",
                      color: "text-purple-500",
                      bg: "bg-purple-500/10"
                    },
                    {
                      icon: Eye,
                      title: "Access Control",
                      desc: "Akses ke data wajah dibatasi hanya untuk sistem AI dan tim terbatas dengan otorisasi tinggi.",
                      color: "text-amber-500",
                      bg: "bg-amber-500/10"
                    },
                    {
                      icon: AlertCircle,
                      title: "Monitoring 24/7",
                      desc: "Sistem keamanan kami memantau aktivitas mencurigakan dan ancaman siber secara real-time.",
                      color: "text-red-500",
                      bg: "bg-red-500/10"
                    }
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <Card key={i} className="hover:shadow-lg transition-all hover:-translate-y-1">
                        <CardContent className="pt-6">
                          <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${item.bg}`}>
                            <Icon className={`h-6 w-6 ${item.color}`} />
                          </div>
                          <h3 className="mb-2 font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.desc}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Hak Pengguna */}
            <section id="hak" className="scroll-mt-32">
              <div
                id="animate-hak"
                className={`transition-all duration-1000 ${
                  isVisible['animate-hak'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">4. Hak Anda atas Data Pribadi</h2>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  Anda memiliki kontrol penuh atas data pribadi Anda. Berikut adalah hak-hak yang Anda miliki:
                </p>

                <div className="space-y-4">
                  {[
                    {
                      icon: Eye,
                      title: "Hak Akses",
                      desc: "Anda dapat mengakses dan melihat data pribadi apa saja yang kami simpan tentang Anda.",
                      action: "Lihat Data Saya"
                    },
                    {
                      icon: FileText,
                      title: "Hak Koreksi",
                      desc: "Anda dapat memperbarui atau memperbaiki informasi pribadi yang tidak akurat.",
                      action: "Edit Profil"
                    },
                    {
                      icon: Trash2,
                      title: "Hak Penghapusan",
                      desc: "Anda dapat meminta penghapusan data wajah dan akun Anda secara permanen kapan saja.",
                      action: "Hapus Akun"
                    },
                    {
                      icon: Share2,
                      title: "Hak Portabilitas",
                      desc: "Anda dapat mengunduh salinan data pribadi Anda dalam format yang mudah dibaca.",
                      action: "Download Data"
                    }
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-5">
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className="mb-1 font-semibold">{item.title}</h3>
                              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                {item.desc}
                              </p>
                              <Button variant="outline" size="sm">
                                {item.action}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card className="mt-6 border-primary/20 bg-primary/5">
                  <CardContent className="pt-5">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium mb-1">Cara Menggunakan Hak Anda</p>
                        <p className="text-sm text-muted-foreground">
                          Untuk menggunakan hak-hak di atas, Anda dapat mengakses pengaturan akun atau menghubungi 
                          tim support kami di <strong>privacy@ambilfoto.id</strong>. Kami akan memproses permintaan 
                          Anda dalam waktu maksimal 14 hari kerja.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Cookie & Teknologi */}
            <section id="cookie" className="scroll-mt-32">
              <div
                id="animate-cookie"
                className={`transition-all duration-1000 ${
                  isVisible['animate-cookie'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <Cookie className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">5. Cookie & Teknologi Pelacakan</h2>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  Kami menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman Anda di platform kami:
                </p>

                <div className="space-y-4">
                  {[
                    {
                      type: "Cookie Esensial",
                      desc: "Diperlukan untuk fungsi dasar website (login, keamanan). Tidak dapat dinonaktifkan.",
                      required: true
                    },
                    {
                      type: "Cookie Fungsional",
                      desc: "Menyimpan preferensi Anda (bahasa, tema) untuk pengalaman yang lebih personal.",
                      required: false
                    },
                    {
                      type: "Cookie Analitik",
                      desc: "Membantu kami memahami bagaimana pengguna berinteraksi dengan platform untuk perbaikan.",
                      required: false
                    }
                  ].map((cookie, i) => (
                    <Card key={i}>
                      <CardContent className="pt-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{cookie.type}</h3>
                              {cookie.required && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                  Wajib
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {cookie.desc}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-6">
                  <CardContent className="pt-5">
                    <p className="text-sm text-muted-foreground mb-3">
                      Anda dapat mengatur preferensi cookie melalui pengaturan browser Anda. Namun, menonaktifkan 
                      cookie tertentu dapat mempengaruhi fungsionalitas platform.
                    </p>
                    <Button variant="outline" size="sm">
                      Kelola Preferensi Cookie
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Berbagi Data */}
            <section id="berbagi" className="scroll-mt-32">
              <div
                id="animate-berbagi"
                className={`transition-all duration-1000 ${
                  isVisible['animate-berbagi'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">6. Pembagian Data dengan Pihak Ketiga</h2>
                </div>

                <Card className="border-red-500/20 bg-red-500/5 mb-6">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <Shield className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Komitmen Kami:</strong> Kami TIDAK menjual data pribadi atau 
                        data wajah Anda kepada pihak ketiga untuk tujuan komersial atau pemasaran.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  Kami hanya membagikan data Anda dalam situasi terbatas berikut:
                </p>

                <div className="space-y-4">
                  {[
                    {
                      title: "Event Organizer & Fotografer Partner",
                      desc: "Kami membagikan hasil pencarian foto (bukan data wajah mentah) kepada fotografer event untuk memfasilitasi pengiriman foto kepada Anda.",
                      when: "Hanya ketika Anda menggunakan fitur pencarian foto"
                    },
                    {
                      title: "Penyedia Layanan Cloud",
                      desc: "Data disimpan di server cloud terpercaya (AWS/Google Cloud) dengan enkripsi penuh dan perjanjian kerahasiaan data.",
                      when: "Untuk operasional platform"
                    },
                    {
                      title: "Penegak Hukum",
                      desc: "Kami dapat membagikan data jika diwajibkan oleh hukum atau untuk melindungi hak, keamanan, dan properti kami atau pengguna lain.",
                      when: "Jika ada perintah pengadilan yang sah"
                    },
                    {
                      title: "Proses Bisnis",
                      desc: "Dalam hal merger, akuisisi, atau penjualan aset, data Anda dapat ditransfer ke pemilik baru dengan perlindungan yang sama.",
                      when: "Dengan pemberitahuan sebelumnya kepada Anda"
                    }
                  ].map((item, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-5">
                        <div className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                              {item.desc}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span className="italic">{item.when}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Retensi Data */}
            <section id="retensi" className="scroll-mt-32">
              <div
                id="animate-retensi"
                className={`transition-all duration-1000 ${
                  isVisible['animate-retensi'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">7. Penyimpanan & Retensi Data</h2>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  Kami menyimpan data Anda hanya selama diperlukan untuk tujuan yang dijelaskan dalam kebijakan ini:
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      type: "Data Akun",
                      duration: "Selama akun aktif + 30 hari setelah penghapusan",
                      icon: UserCheck
                    },
                    {
                      type: "Data Wajah",
                      duration: "Selama akun aktif (dihapus permanen saat akun dihapus)",
                      icon: Eye
                    },
                    {
                      type: "Riwayat Transaksi",
                      duration: "5 tahun (sesuai regulasi perpajakan)",
                      icon: FileText
                    },
                    {
                      type: "Log Sistem",
                      duration: "90 hari (untuk troubleshooting & keamanan)",
                      icon: Database
                    }
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <Card key={i}>
                        <CardContent className="pt-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold mb-1">{item.type}</h3>
                              <p className="text-sm text-muted-foreground">{item.duration}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card className="mt-6 border-orange-500/20 bg-orange-500/5">
                  <CardContent className="pt-5">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Setelah periode retensi berakhir, data akan dihapus secara permanen dari sistem kami dan 
                        tidak dapat dipulihkan.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Perubahan Kebijakan */}
            <section id="perubahan" className="scroll-mt-32">
              <div
                id="animate-perubahan"
                className={`transition-all duration-1000 ${
                  isVisible['animate-perubahan'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">8. Perubahan Kebijakan Privasi</h2>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk mencerminkan perubahan 
                  dalam praktik kami atau karena alasan operasional, hukum, atau regulasi lainnya.
                </p>

                <Card>
                  <CardContent className="pt-5">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          Perubahan signifikan akan diberitahukan melalui email atau notifikasi di platform
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          Versi terbaru selalu tersedia di halaman ini dengan tanggal pembaruan terakhir
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          Penggunaan berkelanjutan setelah perubahan berarti Anda menyetujui kebijakan yang diperbarui
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Kontak */}
            <section id="kontak" className="scroll-mt-32">
              <div
                id="animate-kontak"
                className={`transition-all duration-1000 ${
                  isVisible['animate-kontak'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">9. Hubungi Kami</h2>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  Jika Anda memiliki pertanyaan, kekhawatiran, atau ingin menggunakan hak privasi Anda, 
                  jangan ragu untuk menghubungi tim kami:
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Mail className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Email Privacy</h3>
                          <a href="mailto:privacy@ambilfoto.id" className="text-primary hover:underline">
                            privacy@ambilfoto.id
                          </a>
                          <p className="text-xs text-muted-foreground mt-1">
                            Untuk pertanyaan terkait privasi & data
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Mail className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Email Support</h3>
                          <a href="mailto:support@ambilfoto.id" className="text-primary hover:underline">
                            support@ambilfoto.id
                          </a>
                          <p className="text-xs text-muted-foreground mt-1">
                            Untuk bantuan umum & teknis
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6 border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">Waktu Respon</p>
                        <p className="text-sm text-muted-foreground">
                          Kami akan merespons pertanyaan privasi Anda dalam waktu maksimal 3 hari kerja, 
                          dan memproses permintaan penghapusan data dalam 14 hari kerja.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Closing Statement */}
            <section id="penutup" className="scroll-mt-32">
              <div
                id="animate-penutup"
                className={`transition-all duration-1000 ${
                  isVisible['animate-penutup'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <Card className="border-primary bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardContent className="pt-8 pb-8">
                    <div className="text-center max-w-2xl mx-auto">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-2xl font-bold mb-3">Komitmen Kami pada Privasi Anda</h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        Di AmbilFoto.id, privasi dan keamanan data Anda adalah prioritas utama kami. 
                        Kami berkomitmen untuk terus meningkatkan perlindungan data dan transparansi dalam 
                        setiap aspek layanan kami.
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        Terima kasih atas kepercayaan Anda menggunakan AmbilFoto.id
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Footer */}
        <Footer />
    </div>
  );
};

export default PrivacyPolicy;