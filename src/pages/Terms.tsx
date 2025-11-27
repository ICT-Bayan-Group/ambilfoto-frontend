import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  FileText, 
  Users, 
  AlertCircle,
  Mail,
  CheckCircle2,
  Info,
  UserCheck,
  Ban,
  Scale,
  CreditCard,
  Camera,
  Lock,
  Eye,
  XCircle,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const TermsOfService = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
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

    setTimeout(() => {
      const elements = document.querySelectorAll("[id^='animate-'], section[id]");
      elements.forEach((el) => {
        observer.observe(el);
      });
    }, 100);

    return () => observer.disconnect();
  }, []);

  const quickLinks = [
    { id: "pendahuluan", label: "Pendahuluan", icon: Info },
    { id: "layanan", label: "Layanan Kami", icon: Camera },
    { id: "akun", label: "Akun Pengguna", icon: UserCheck },
    { id: "penggunaan", label: "Penggunaan Platform", icon: Users },
    { id: "pembayaran", label: "Pembayaran & Biaya", icon: CreditCard },
    { id: "konten", label: "Hak Konten", icon: FileText },
    { id: "larangan", label: "Larangan", icon: Ban },
    { id: "tanggung-jawab", label: "Tanggung Jawab", icon: Scale },
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
      {/* Header */}
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
              <Scale className="h-4 w-4" />
              <span>Syarat & Ketentuan</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Ketentuan Layanan
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Selamat datang di AmbilFoto.id! Mohon baca ketentuan ini dengan seksama sebelum menggunakan layanan kami.
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Terakhir diperbarui: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Sidebar */}
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
            {/* Pendahuluan */}
            <section
              id="pendahuluan"
              className={`transition-all duration-1000 ${
                isVisible['pendahuluan'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
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
                      <p className="text-muted-foreground leading-relaxed mb-3">
                        Terima kasih telah memilih AmbilFoto.id sebagai platform pencarian foto event Anda! Kami adalah platform AI-powered photo recognition yang menghubungkan pengguna dengan fotografer dan event organizer untuk menemukan foto dengan mudah dan cepat.
                      </p>
                      <p className="text-muted-foreground leading-relaxed mb-3">
                        Ketentuan Layanan ini ("Ketentuan") merupakan perjanjian hukum antara Anda ("Pengguna", "Anda") dan AmbilFoto.id ("kami", "Platform") yang mengatur penggunaan layanan kami.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Dengan mendaftar dan menggunakan AmbilFoto.id</strong>, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui semua ketentuan yang tercantum di bawah ini.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Layanan Kami */}
            <section id="layanan" className="scroll-mt-32">
              <div
                id="animate-layanan"
                className={`transition-all duration-1000 ${
                  isVisible['animate-layanan'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                    <Camera className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">1. Layanan yang Kami Sediakan</h2>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  AmbilFoto.id menyediakan teknologi pengenalan wajah berbasis AI untuk membantu Anda menemukan foto dari berbagai event:
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      icon: Zap,
                      title: "Face Recognition AI",
                      desc: "Teknologi AI canggih yang mencocokkan wajah Anda dengan foto di database event secara otomatis dan akurat.",
                      color: "text-blue-500",
                      bg: "bg-blue-500/10"
                    },
                    {
                      icon: Camera,
                      title: "Database Foto Event",
                      desc: "Akses ke ribuan foto dari berbagai event yang di-upload oleh fotografer partner kami.",
                      color: "text-purple-500",
                      bg: "bg-purple-500/10"
                    },
                    {
                      icon: Eye,
                      title: "Preview & Download",
                      desc: "Lihat preview foto Anda dan download dalam kualitas tinggi setelah melakukan pembayaran.",
                      color: "text-green-500",
                      bg: "bg-green-500/10"
                    },
                    {
                      icon: Shield,
                      title: "Privasi Terjamin",
                      desc: "Data wajah Anda dienkripsi dan dilindungi dengan standar keamanan tertinggi.",
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

                <Card className="mt-6 border-blue-500/20 bg-blue-500/5">
                  <CardContent className="pt-5">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Catatan:</strong> Layanan kami bergantung pada ketersediaan foto dari event organizer dan fotografer. Kami tidak menjamin bahwa semua event atau foto tersedia di platform kami.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Akun Pengguna */}
            <section id="akun" className="scroll-mt-32">
              <div
                id="animate-akun"
                className={`transition-all duration-1000 ${
                  isVisible['animate-akun'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">2. Akun Pengguna & Persyaratan</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Persyaratan Pendaftaran
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      Untuk menggunakan layanan AmbilFoto.id, Anda harus:
                    </p>
                    <ul className="space-y-2 ml-6">
                      {[
                        "Berusia minimal 13 tahun (atau sesuai hukum negara Anda)",
                        "Memberikan informasi yang akurat, lengkap, dan terkini",
                        "Memiliki email aktif yang dapat diverifikasi",
                        "Menyetujui Kebijakan Privasi dan Ketentuan Layanan kami",
                        "Bertanggung jawab penuh atas keamanan akun Anda"
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
                      <Lock className="h-5 w-5 text-primary" />
                      Keamanan Akun
                    </h3>
                    <Card>
                      <CardContent className="pt-5">
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          Anda bertanggung jawab penuh untuk menjaga kerahasiaan password dan semua aktivitas yang terjadi di akun Anda. Anda wajib:
                        </p>
                        <ul className="space-y-2 ml-6">
                          {[
                            "Tidak membagikan password kepada siapa pun",
                            "Segera memberitahu kami jika terjadi akses tidak sah",
                            "Logout setelah selesai menggunakan layanan di perangkat publik",
                            "Menggunakan password yang kuat dan unik"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="mb-3 text-lg font-semibold flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      Penangguhan & Penghapusan Akun
                    </h3>
                    <Card className="border-red-500/20 bg-red-500/5">
                      <CardContent className="pt-5">
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          Kami berhak menangguhkan atau menghapus akun Anda jika:
                        </p>
                        <ul className="space-y-2 ml-6">
                          {[
                            "Melanggar Ketentuan Layanan ini",
                            "Menggunakan layanan untuk tujuan ilegal atau merugikan",
                            "Memberikan informasi palsu saat pendaftaran",
                            "Melakukan aktivitas yang mencurigakan atau berbahaya"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </section>

            {/* Penggunaan Platform */}
            <section id="penggunaan" className="scroll-mt-32">
              <div
                id="animate-penggunaan"
                className={`transition-all duration-1000 ${
                  isVisible['animate-penggunaan'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">3. Aturan Penggunaan Platform</h2>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  Dengan menggunakan AmbilFoto.id, Anda setuju untuk:
                </p>

                <div className="space-y-4">
                  {[
                    {
                      title: "Penggunaan yang Sah",
                      desc: "Menggunakan layanan hanya untuk tujuan yang sah dan sesuai dengan ketentuan yang berlaku.",
                      icon: CheckCircle2,
                      color: "text-green-500"
                    },
                    {
                      title: "Upload Foto Wajah",
                      desc: "Hanya meng-upload foto wajah Anda sendiri atau foto yang Anda miliki haknya. Tidak menggunakan foto orang lain tanpa izin.",
                      icon: Eye,
                      color: "text-blue-500"
                    },
                    {
                      title: "Tidak Menyalahgunakan AI",
                      desc: "Tidak menggunakan teknologi face recognition kami untuk stalking, surveillance, atau tujuan yang melanggar privasi orang lain.",
                      icon: Shield,
                      color: "text-purple-500"
                    },
                    {
                      title: "Menghormati Hak Cipta",
                      desc: "Foto yang Anda download hanya untuk penggunaan pribadi. Dilarang menjual kembali atau menggunakan untuk tujuan komersial tanpa izin fotografer.",
                      icon: FileText,
                      color: "text-amber-500"
                    }
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-5">
                          <div className="flex items-start gap-4">
                            <Icon className={`h-6 w-6 ${item.color} shrink-0 mt-0.5`} />
                            <div>
                              <h3 className="mb-1 font-semibold">{item.title}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Pembayaran */}
            <section id="pembayaran" className="scroll-mt-32">
              <div
                id="animate-pembayaran"
                className={`transition-all duration-1000 ${
                  isVisible['animate-pembayaran'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">4. Pembayaran & Biaya</h2>
                </div>

                <div className="space-y-6">
                  <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground leading-relaxed">
                        AmbilFoto.id menggunakan model pembayaran per foto atau paket berlangganan. Harga dapat berubah sewaktu-waktu dengan pemberitahuan sebelumnya.
                      </p>
                    </CardContent>
                  </Card>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Ketentuan Pembayaran
                    </h3>
                    <ul className="space-y-2 ml-6">
                      {[
                        "Pembayaran dilakukan melalui metode yang tersedia di platform (transfer bank, e-wallet, kartu kredit)",
                        "Semua harga tercantum dalam Rupiah (IDR) dan sudah termasuk pajak jika berlaku",
                        "Pembayaran bersifat final dan tidak dapat dibatalkan setelah foto berhasil di-download",
                        "Kami tidak menyimpan informasi kartu kredit Anda (ditangani oleh payment gateway terpercaya)"
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
                      <Info className="h-5 w-5 text-primary" />
                      Refund & Pembatalan
                    </h3>
                    <Card>
                      <CardContent className="pt-5">
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          Pengembalian dana (refund) hanya dapat dilakukan dalam kondisi berikut:
                        </p>
                        <ul className="space-y-2 ml-6">
                          {[
                            "Kesalahan teknis yang menyebabkan Anda tidak dapat mengakses foto yang sudah dibeli",
                            "Duplikasi pembayaran yang tidak disengaja",
                            "Foto yang di-download rusak atau tidak sesuai (dalam 24 jam setelah pembelian)"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                          Permintaan refund dapat diajukan melalui email ke <strong className="text-foreground">support@ambilfoto.id</strong> dengan menyertakan bukti pembayaran.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </section>

            {/* Hak Konten */}
            <section id="konten" className="scroll-mt-32">
              <div
                id="animate-konten"
                className={`transition-all duration-1000 ${
                  isVisible['animate-konten'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">5. Hak Kekayaan Intelektual & Konten</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-lg font-semibold flex items-center gap-2">
                      <Camera className="h-5 w-5 text-primary" />
                      Hak Cipta Foto
                    </h3>
                    <Card>
                      <CardContent className="pt-5">
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          Semua foto yang tersedia di AmbilFoto.id adalah milik fotografer dan event organizer yang meng-upload foto tersebut. Dengan membeli foto, Anda mendapatkan:
                        </p>
                        <ul className="space-y-2 ml-6">
                          {[
                            "Lisensi untuk penggunaan pribadi (non-komersial)",
                            "Hak untuk menyimpan dan mencetak foto untuk koleksi pribadi",
                            "Hak untuk membagikan di media sosial dengan memberikan credit ke fotografer"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="mb-3 text-lg font-semibold flex items-center gap-2">
                      <Ban className="h-5 w-5 text-red-500" />
                      Yang TIDAK Boleh Dilakukan
                    </h3>
                    <Card className="border-red-500/20 bg-red-500/5">
                      <CardContent className="pt-5">
                        <ul className="space-y-2 ml-6">
                          {[
                            "Menjual kembali foto yang telah dibeli",
                            "Menggunakan foto untuk tujuan komersial tanpa izin fotografer",
                            "Menghapus watermark atau credit fotografer",
                            "Mengklaim foto sebagai karya Anda sendiri",
                            "Memodifikasi foto secara substansial yang dapat merugikan reputasi fotografer"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                              <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="mb-3 text-lg font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Hak AmbilFoto.id
                    </h3>
                    <Card>
                      <CardContent className="pt-5">
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          Platform AmbilFoto.id, termasuk logo, desain, teknologi AI, dan semua aspek layanan lainnya, adalah hak kekayaan intelektual kami. Anda tidak diperkenankan untuk:
                        </p>
                        <ul className="space-y-2 ml-6">
                          {[
                            "Menyalin, memodifikasi, atau mendistribusikan kode atau teknologi kami",
                            "Menggunakan nama atau logo AmbilFoto.id tanpa izin tertulis",
                            "Melakukan reverse engineering terhadap teknologi face recognition kami"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </section>

            {/* Larangan */}
            <section id="larangan" className="scroll-mt-32">
              <div
                id="animate-larangan"
                className={`transition-all duration-1000 ${
                  isVisible['animate-larangan'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                    <Ban className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">6. Tindakan yang Dilarang</h2>
                </div>

                <Card className="border-red-500/20 bg-red-500/5 mb-6">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Peringatan Serius:</strong> Pelanggaran terhadap larangan berikut dapat mengakibatkan penangguhan atau penghapusan akun permanen tanpa pengembalian dana.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {[
                    {
                      title: "Penyalahgunaan Face Recognition",
                      items: [
                        "Menggunakan foto orang lain tanpa izin untuk mencari foto mereka",
                        "Stalking atau surveillance terhadap individu lain",
                        "Menggunakan layanan untuk tujuan yang melanggar privasi"
                      ]
                    },
                    {
                      title: "Aktivitas Ilegal",
                      items: [
                        "Menggunakan platform untuk tujuan penipuan atau kejahatan",
                        "Upload konten yang melanggar hukum (pornografi, kekerasan, dll)",
                        "Melakukan money laundering melalui platform kami"
                      ]
                    },
                    {
                      title: "Gangguan Sistem",
                      items: [
                        "Mencoba hack, DDoS, atau merusak sistem kami",
                        "Menggunakan bot atau automated tools tanpa izin",
                        "Mencoba mengakses data pengguna lain"
                      ]
                    },
                    {
                      title: "Pelanggaran Hak Cipta",
                      items: [
                        "Upload foto yang bukan milik Anda",
                        "Distribusi ilegal foto yang dibeli",
                        "Penghapusan watermark tanpa izin"
                      ]
                    }
                  ].map((category, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-5">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-500" />
                          {category.title}
                        </h3>
                        <ul className="space-y-2 ml-6">
                          {category.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-2 text-muted-foreground text-sm">
                              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Tanggung Jawab */}
            <section id="tanggung-jawab" className="scroll-mt-32">
              <div
                id="animate-tanggung-jawab"
                className={`transition-all duration-1000 ${
                  isVisible['animate-tanggung-jawab'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Scale className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">7. Batasan Tanggung Jawab</h2>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-3">Layanan "Sebagaimana Adanya"</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        AmbilFoto.id menyediakan layanan "sebagaimana adanya" (as is). Kami berusaha memberikan layanan terbaik, namun tidak menjamin:
                      </p>
                      <ul className="space-y-2 ml-6 mt-3">
                        {[
                          "Ketersediaan foto dari semua event",
                          "Akurasi 100% dari teknologi face recognition (dapat bervariasi tergantung kualitas foto)",
                          "Layanan akan selalu tersedia tanpa gangguan",
                          "Platform bebas dari bug atau error"
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-3">Pembatasan Liability</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        Sejauh diizinkan oleh hukum yang berlaku, AmbilFoto.id TIDAK bertanggung jawab atas:
                      </p>
                      <ul className="space-y-2 ml-6">
                        {[
                          "Kerugian tidak langsung, insidental, atau konsekuensial",
                          "Kehilangan data atau profit akibat penggunaan layanan",
                          "Konten yang di-upload oleh fotografer atau pengguna lain",
                          "Sengketa antara pengguna dengan fotografer atau event organizer"
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardContent className="pt-5">
                      <div className="flex gap-3">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium mb-1 text-sm">Tanggung Jawab Anda</p>
                          <p className="text-sm text-muted-foreground">
                            Anda bertanggung jawab penuh atas penggunaan platform ini dan segala kerugian yang timbul dari pelanggaran Ketentuan Layanan ini. Anda setuju untuk mengganti kerugian AmbilFoto.id dari segala klaim, tuntutan, atau kerugian yang timbul dari pelanggaran Anda.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Perubahan Ketentuan */}
            <section id="perubahan" className="scroll-mt-32">
              <div
                id="animate-perubahan"
                className={`transition-all duration-1000 ${
                  isVisible['animate-perubahan'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">8. Perubahan Ketentuan</h2>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Kami berhak mengubah atau memperbarui Ketentuan Layanan ini kapan saja. Perubahan akan berlaku segera setelah dipublikasikan di halaman ini.
                    </p>
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
                          Tanggal "Terakhir diperbarui" di bagian atas akan diperbarui
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          Penggunaan berkelanjutan berarti Anda menyetujui perubahan tersebut
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Penyelesaian Sengketa */}
            <section id="sengketa" className="scroll-mt-32">
              <div
                id="animate-sengketa"
                className={`transition-all duration-1000 ${
                  isVisible['animate-sengketa'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                    <Scale className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">9. Hukum yang Berlaku & Penyelesaian Sengketa</h2>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Hukum yang Berlaku</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Ketentuan Layanan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan di pengadilan yang berwenang di Indonesia.
                        </p>
                      </div>
                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2">Penyelesaian Sengketa</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          Jika terjadi sengketa, kami mendorong penyelesaian secara damai melalui:
                        </p>
                        <ul className="space-y-2 ml-6">
                          {[
                            "Komunikasi langsung dengan tim support kami",
                            "Mediasi oleh pihak ketiga yang disepakati bersama",
                            "Jika tidak tercapai kesepakatan, dapat dilanjutkan ke jalur hukum"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
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
                  <h2 className="text-2xl font-bold">10. Hubungi Kami</h2>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  Jika Anda memiliki pertanyaan tentang Ketentuan Layanan ini atau layanan kami, silakan hubungi:
                </p>

                <div className="grid gap-6 md:grid-cols-2">
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
                            Untuk pertanyaan umum & bantuan teknis
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Scale className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Email Legal</h3>
                          <a href="mailto:legal@ambilfoto.id" className="text-primary hover:underline">
                            legal@ambilfoto.id
                          </a>
                          <p className="text-xs text-muted-foreground mt-1">
                            Untuk pertanyaan hukum & compliance
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                      <h3 className="text-2xl font-bold mb-3">Terima Kasih Telah Mempercayai Kami</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Dengan menggunakan AmbilFoto.id, Anda menyetujui Ketentuan Layanan ini. Kami berkomitmen untuk terus meningkatkan layanan dan memberikan pengalaman terbaik dalam menemukan momen-momen berharga Anda.
                      </p>
                      <p className="text-sm text-muted-foreground italic mb-6">
                        Jika ada pertanyaan atau kekhawatiran, jangan ragu untuk menghubungi kami kapan saja.
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        <Button variant="default">
                          Mulai Gunakan AmbilFoto.id
                        </Button>
                        <Button variant="outline" onClick={() => scrollToSection('pendahuluan')}>
                          Baca Lagi
                        </Button>
                      </div>
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

export default TermsOfService;