import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Camera, Scan, Image as ImageIcon, Calendar } from "lucide-react";

const UserDashboard = () => {
  const [totalPhotos] = useState(24);
  const recentEvents = [
    { name: 'Soccer Clinic 2025', photos: 12, date: 'Nov 25' },
    { name: 'Company Gathering', photos: 8, date: 'Nov 20' },
    { name: 'Birthday Party', photos: 4, date: 'Nov 15' },
  ];

  const recentPhotos = [1, 2, 3, 4];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Selamat Datang! 👋</h1>
            <p className="text-muted-foreground">Temukan foto Anda atau lihat koleksi Anda</p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="border-border/50 shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalPhotos}</p>
                    <p className="text-sm text-muted-foreground">Foto Anda</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/50 shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                    <Calendar className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{recentEvents.length}</p>
                    <p className="text-sm text-muted-foreground">Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/50 shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Scan className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">95%</p>
                    <p className="text-sm text-muted-foreground">Match Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Face Scan CTA */}
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-strong">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Scan className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-semibold mb-2">Temukan Foto Anda</h2>
                  <p className="text-muted-foreground">
                    Scan wajah Anda untuk secara otomatis menemukan semua foto Anda dari acara
                  </p>
                </div>
                <Link to="/user/scan-face">
                  <Button size="lg" className="shadow-soft">
                    <Camera className="mr-2 h-5 w-5" />
                    Mulai Scan Wajah
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Photos */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Your Photos ({totalPhotos})</h2>
              <Link to="/user/photos">
                <Button variant="ghost">View All</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentPhotos.map((photo, index) => (
                <Card key={index} className="overflow-hidden border-border/50 shadow-soft hover:shadow-strong transition-smooth group cursor-pointer">
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/50 group-hover:scale-110 transition-smooth" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <p className="text-xs text-white font-medium">Nov {25 - index}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Events */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Recent Events</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {recentEvents.map((event, index) => (
                <Card key={index} className="border-border/50 shadow-soft hover:shadow-strong transition-smooth cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 truncate">{event.name}</h3>
                        <p className="text-sm text-muted-foreground">{event.photos} photos</p>
                        <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
