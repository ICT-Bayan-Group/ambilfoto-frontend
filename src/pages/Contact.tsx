import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send,
  MessageSquare,
  Clock,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Sparkles,
  CheckCircle2,
  Zap,
  Heart,
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const ContactUs = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('Mohon isi semua field terlebih dahulu! 😊');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      const mailtoLink = `mailto:hello@ambilfoto.id?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
        `Nama: ${formData.name}\nEmail: ${formData.email}\n\nPesan:\n${formData.message}`
      )}`;
      window.location.href = mailtoLink;
      
      setSubmitStatus('success');
      setIsSubmitting(false);
      
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });

      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Kami",
      description: "hello@ambilfoto.id",
      subtitle: "Balas dalam 24 jam",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      gradient: "from-purple-500 to-pink-500",
      action: "mailto:hello@ambilfoto.id"
    },
    {
      icon: Phone,
      title: "WhatsApp",
      description: "+62 812-3456-7890",
      subtitle: "Chat dengan tim kami",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      gradient: "from-green-500 to-emerald-500",
      action: "https://wa.me/6281234567890"
    },
    {
      icon: MapPin,
      title: "Lokasi Kantor",
      description: "Jakarta Selatan",
      subtitle: "Indonesia",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      gradient: "from-blue-500 to-cyan-500",
      action: "https://maps.google.com"
    }
  ];

  const socialMedia = [
    {
      icon: Instagram,
      name: "Instagram",
      handle: "@ambilfoto.id",
      color: "hover:text-pink-500",
      gradient: "from-pink-500 to-purple-500",
      link: "https://instagram.com/ambilfoto.id"
    },
    {
      icon: Twitter,
      name: "Twitter",
      handle: "@ambilfoto",
      color: "hover:text-blue-400",
      gradient: "from-blue-400 to-cyan-400",
      link: "https://twitter.com/ambilfoto"
    },
    {
      icon: Facebook,
      name: "Facebook",
      handle: "AmbilFoto.id",
      color: "hover:text-blue-600",
      gradient: "from-blue-600 to-blue-400",
      link: "https://facebook.com/ambilfoto.id"
    },
    {
      icon: Linkedin,
      name: "LinkedIn",
      handle: "AmbilFoto",
      color: "hover:text-blue-700",
      gradient: "from-blue-700 to-blue-500",
      link: "https://linkedin.com/company/ambilfoto"
    }
  ];

  const officeHours = [
    { day: "Senin - Jumat", hours: "09:00 - 18:00 WIB" },
    { day: "Sabtu", hours: "10:00 - 15:00 WIB" },
    { day: "Minggu", hours: "Tutup" }
  ];

  const faqs = [
    {
      question: "Berapa lama respon email?",
      answer: "Kami berusaha membalas dalam 24 jam kerja"
    },
    {
      question: "Bisa video call?",
      answer: "Tentu! Hubungi kami untuk jadwal meeting"
    },
    {
      question: "Support 24/7?",
      answer: "Chat support tersedia di jam kerja, email 24/7"
    }
  ];

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
              <MessageSquare className="h-4 w-4" />
              <span>Hubungi Kami</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Ada Pertanyaan?{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Yuk, Ngobrol!
              </span>
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Tim kami siap bantu kamu. Drop message atau langsung chat aja. No worries, we're friendly! 😊
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-10">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <Card
                  key={index}
                  id={`animate-info-${index}`}
                  className={`group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-border/50 overflow-hidden cursor-pointer ${
                    isVisible[`animate-info-${index}`]
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  onClick={() => window.open(info.action, '_blank')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className={`mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-xl ${info.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-7 w-7 ${info.color}`} />
                    </div>
                    <h3 className="mb-1 text-lg font-semibold">{info.title}</h3>
                    <p className="font-medium text-foreground mb-1">
                      {info.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {info.subtitle}
                    </p>
                  </CardContent>
                  <div className={`h-1 bg-gradient-to-r ${info.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div
              id="animate-form"
              className={`transition-all duration-1000 ${
                isVisible['animate-form'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              <Card className="border-border/50 shadow-lg">
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-primary" />
                      Kirim Pesan
                    </h2>
                    <p className="text-muted-foreground">
                      Isi form di bawah dan kami akan segera menghubungi kamu!
                    </p>
                  </div>

                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Pesan berhasil! Email client kamu akan terbuka.
                      </p>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nama Lengkap <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none"
                        placeholder="Siapa nih?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email <span className="text-primary">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none"
                        placeholder="emailkamu@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Subjek <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none"
                        placeholder="Mau ngobrolin apa?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Pesan <span className="text-primary">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none resize-none"
                        placeholder="Ceritain dong... Jangan malu-malu 😊"
                      />
                    </div>

                    <Button 
                      onClick={handleSubmit}
                      className="w-full shadow-lg hover:scale-105 transition-transform duration-300" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Zap className="mr-2 h-5 w-5 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Kirim Pesan
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div
              id="animate-sidebar"
              className={`space-y-6 transition-all duration-1000 ${
                isVisible['animate-sidebar'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
            >
              {/* Office Hours */}
              <Card className="border-border/50 shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Jam Operasional
                  </h3>
                  <div className="space-y-3">
                    {officeHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200">
                        <span className="font-medium">{schedule.day}</span>
                        <span className="text-muted-foreground">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="border-border/50 shadow-lg">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Follow Kami
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {socialMedia.map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={index}
                          href={social.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1 group ${social.color}`}
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${social.gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs text-muted-foreground">{social.name}</div>
                            <div className="text-xs font-medium">{social.handle}</div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick FAQs */}
              <Card className="border-border/50 shadow-lg">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Quick FAQs</h3>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                        <h4 className="font-semibold mb-1 text-sm">{faq.question}</h4>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div
            id="animate-map"
            className={`max-w-6xl mx-auto transition-all duration-1000 ${
              isVisible['animate-map'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Lokasi Kantor Kami</h2>
              <p className="text-muted-foreground">
                Mampir langsung? Kabarin dulu ya biar kita siapin kopi! ☕
              </p>
            </div>

            <Card className="border-border/50 shadow-xl overflow-hidden">
              <div className="aspect-[16/9] w-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126920.23949154248!2d106.68942984335937!3d-6.229386799999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x5371bf0fdad786a2!2sJakarta%2C%20Indonesia!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                ></iframe>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">AmbilFoto.id Headquarters</h3>
                    <p className="text-muted-foreground mb-3">
                      Jl. Sudirman No. 123<br />
                      Jakarta Selatan 12190<br />
                      Indonesia
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('https://maps.google.com', '_blank')}
                      className="hover:scale-105 transition-transform duration-300"
                    >
                      Buka di Maps
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
            <Sparkles className="h-16 w-16 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold mb-4">Masih Bingung? Gas Chat Aja!</h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Tim support kami fast response dan super helpful. Jangan sungkan-sungkan ya! 🚀
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="shadow-lg hover:scale-105 transition-transform duration-300">
                <MessageSquare className="mr-2 h-5 w-5" />
                Chat Sekarang
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:scale-105 transition-transform duration-300"
                onClick={() => window.location.href = 'mailto:hello@ambilfoto.id'}
              >
                Kirim Email
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

export default ContactUs;