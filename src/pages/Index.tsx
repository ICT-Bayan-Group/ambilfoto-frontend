import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Camera, Scan, Download, Zap, Shield, Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              <span>AI-Powered Photo Recognition</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Temukan Foto Eventmu{" "}
              <span className="text-gradient">Dengan Cepat</span>
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
             Upload wajah kamu, temukan momen-momen kamu. AI kita akan menemukan foto kamu dari acara apa pun.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/register">
                <Button size="lg" className="shadow-strong">
                  <Camera className="mr-2 h-5 w-5" />
                   Ambil Fotomu
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Masuk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Bagaimana Caranya?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tiga langkah sederhana untuk menemukan semua foto kamu secara otomatis
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="shadow-soft transition-smooth hover:shadow-strong border-border/50">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">1. Upload Wajah Kamu</h3>
                <p className="text-muted-foreground">
                  Ambil selfie cepat atau unggah foto kamu. AI kami akan membuat profil wajah unik kamu.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft transition-smooth hover:shadow-strong border-border/50">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Scan className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">2. AI Menemukan Foto Kamu</h3>
                <p className="text-muted-foreground">
                  Pengenalan wajah canggih kami langsung memindai ribuan foto acara untuk menemukan kamu.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft transition-smooth hover:shadow-strong border-border/50">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Download className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">3. Download & Bagikan</h3>
                <p className="text-muted-foreground">
                  Akses semua foto kamu di satu tempat. Unduh dalam kualitas tinggi dan bagikan dengan teman.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Mengapa AmbilFoto.id?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Lightning Fast</h3>
                    <p className="text-muted-foreground">
                      Find your photos in seconds, not hours. No more manual searching through albums.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                    <Shield className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Privacy First</h3>
                    <p className="text-muted-foreground">
                      Data wajah Kamu aman. Kami tidak pernah membagikan informasi Kamu.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Zap className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">95%+ Accuracy</h3>
                    <p className="text-muted-foreground">
                    AI canggih memastikan presisi tinggi dalam menemukan foto Anda di semua acara.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/13152078/pexels-photo-13152078.jpeg" 
                alt="Event photography"
                className="aspect-square rounded-2xl object-cover shadow-strong"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">Siap Menemukan Foto Kamu?</h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Bergabunglah dengan pengguna lain yang telah menemukan momen acara mereka dengan mudah.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="shadow-strong">
                Coba Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
