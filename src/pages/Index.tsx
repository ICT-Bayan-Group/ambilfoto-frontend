import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Camera, Scan, Download, Zap, Shield, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Refs for animations
  const heroRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'photographer' || user?.role === 'admin') {
        navigate('/photographer/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Hero Section Animations
    const ctx = gsap.context(() => {
      // Animated background blobs
      if (blob1Ref.current) {
        gsap.to(blob1Ref.current, {
          scale: 1.2,
          opacity: 0.5,
          duration: 8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }

      if (blob2Ref.current) {
        gsap.to(blob2Ref.current, {
          scale: 0.8,
          opacity: 0.5,
          duration: 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }

      // Hero content animation timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(badgeRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8
      })
      .from(headingRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.1
      }, "-=0.4")
      .from(subheadingRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8
      }, "-=0.6")
      .from(ctaRef.current?.children, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15
      }, "-=0.4");

      // Features Section
      const featureCards = featuresRef.current?.querySelectorAll('.feature-card');
      if (featureCards) {
        gsap.from(featureCards, {
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          },
          y: 80,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out"
        });
      }

      // Benefits Section
      const benefitItems = benefitsRef.current?.querySelectorAll('.benefit-item');
      if (benefitItems) {
        gsap.from(benefitItems, {
          scrollTrigger: {
            trigger: benefitsRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          },
          x: -50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out"
        });
      }

      // Image reveal animation
      if (imageRef.current) {
        gsap.from(imageRef.current, {
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          },
          scale: 0.8,
          opacity: 0,
          duration: 1,
          ease: "power3.out"
        });

        // Floating animation
        gsap.to(imageRef.current, {
          y: -20,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }

      // CTA Section
      if (ctaSectionRef.current) {
        const ctaContent = ctaSectionRef.current.querySelectorAll('.cta-content > *');
        gsap.from(ctaContent, {
          scrollTrigger: {
            trigger: ctaSectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          },
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out"
        });
      }
    });

    return () => ctx.revert(); // Cleanup
  }, []);

  // Hover animations for buttons
  const handleButtonHover = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  // Card hover animation
  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      y: -10,
      scale: 1.02,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  // Icon hover rotation
  const handleIconHover = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotation: 360,
      duration: 0.6,
      ease: "power2.out"
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
        
        {/* Animated background blobs */}
        <div
          ref={blob1Ref}
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-30"
        />
        <div
          ref={blob2Ref}
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30"
        />
        
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div 
              ref={badgeRef}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary"
            >
              <Zap className="h-4 w-4" />
              <span>AI-Powered Photo Recognition</span>
            </div>
            
            <h1 
              ref={headingRef}
              className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            >
              Temukan Foto Eventmu{" "}
              <span className="text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Dengan Cepat
              </span>
            </h1>
            
            <p 
              ref={subheadingRef}
              className="mb-8 text-lg text-muted-foreground sm:text-xl"
            >
              Upload wajah kamu, temukan momen-momen kamu. AI kita akan menemukan foto kamu dari acara apa pun.
            </p>
            
            <div 
              ref={ctaRef}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            >
              <Link to="/register">
                <div
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                >
                  <Button size="lg" className="shadow-strong">
                    <Camera className="mr-2 h-5 w-5" />
                    Ambil Fotomu
                  </Button>
                </div>
              </Link>
              <Link to="/login">
                <div
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                >
                  <Button size="lg" variant="outline">
                    Masuk
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Bagaimana Caranya?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tiga langkah sederhana untuk menemukan semua foto kamu secara otomatis
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Camera,
                title: "1. Upload Wajah Kamu",
                description: "Ambil selfie cepat atau unggah foto kamu. AI kami akan membuat profil wajah unik kamu.",
                color: "primary"
              },
              {
                icon: Scan,
                title: "2. AI Menemukan Foto Kamu",
                description: "Pengenalan wajah canggih kami langsung memindai ribuan foto acara untuk menemukan kamu.",
                color: "secondary"
              },
              {
                icon: Download,
                title: "3. Download & Bagikan",
                description: "Akses semua foto kamu di satu tempat. Unduh dalam kualitas tinggi dan bagikan dengan teman.",
                color: "accent"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="feature-card"
                  onMouseEnter={handleCardHover}
                  onMouseLeave={handleCardLeave}
                >
                  <Card className="shadow-soft transition-shadow hover:shadow-strong border-border/50 h-full">
                    <CardContent className="pt-6">
                      <div 
                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-${feature.color}/10`}
                        onMouseEnter={handleIconHover}
                      >
                        <Icon className={`h-6 w-6 text-${feature.color}`} />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div ref={benefitsRef}>
              <h2 className="text-3xl font-bold mb-6">Mengapa AmbilFoto.id?</h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Clock,
                    title: "Lightning Fast",
                    description: "Find your photos in seconds, not hours. No more manual searching through albums.",
                    color: "primary"
                  },
                  {
                    icon: Shield,
                    title: "Privacy First",
                    description: "Data wajah Kamu aman. Kami tidak pernah membagikan informasi Kamu.",
                    color: "secondary"
                  },
                  {
                    icon: Zap,
                    title: "95%+ Accuracy",
                    description: "AI canggih memastikan presisi tinggi dalam menemukan foto Anda di semua acara.",
                    color: "accent"
                  }
                ].map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="flex gap-4 benefit-item"
                    >
                      <div 
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-${benefit.color}/10`}
                        onMouseEnter={(e) => {
                          gsap.to(e.currentTarget, {
                            scale: 1.1,
                            rotation: 5,
                            duration: 0.3,
                            ease: "power2.out"
                          });
                        }}
                        onMouseLeave={(e) => {
                          gsap.to(e.currentTarget, {
                            scale: 1,
                            rotation: 0,
                            duration: 0.3,
                            ease: "power2.out"
                          });
                        }}
                      >
                        <Icon className={`h-5 w-5 text-${benefit.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{benefit.title}</h3>
                        <p className="text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="relative">
              <div
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget.querySelector('img'), {
                    scale: 1.05,
                    duration: 0.4,
                    ease: "power2.out"
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget.querySelector('img'), {
                    scale: 1,
                    duration: 0.4,
                    ease: "power2.out"
                  });
                }}
              >
                <img 
                  ref={imageRef}
                  src="https://images.pexels.com/photos/13152078/pexels-photo-13152078.jpeg" 
                  alt="Event photography"
                  className="aspect-square rounded-2xl object-cover shadow-strong"
                />
              </div>
              
              {/* Decorative floating elements */}
              <div
                className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"
                ref={(el) => {
                  if (el) {
                    gsap.to(el, {
                      y: -20,
                      duration: 4,
                      repeat: -1,
                      yoyo: true,
                      ease: "sine.inOut"
                    });
                  }
                }}
              />
              <div
                className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"
                ref={(el) => {
                  if (el) {
                    gsap.to(el, {
                      y: 20,
                      duration: 5,
                      repeat: -1,
                      yoyo: true,
                      ease: "sine.inOut"
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaSectionRef} className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Animated background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "50px 50px"
          }}
          ref={(el) => {
            if (el) {
              gsap.to(el, {
                backgroundPosition: "50px 50px",
                duration: 20,
                repeat: -1,
                ease: "none"
              });
            }
          }}
        />
        
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center cta-content">
            <h2 className="text-3xl font-bold mb-4">
              Siap Menemukan Foto Kamu?
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Bergabunglah dengan pengguna lain yang telah menemukan momen acara mereka dengan mudah.
            </p>
            <div>
              <Link to="/register">
                <div
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                >
                  <Button size="lg" variant="secondary" className="shadow-strong">
                    Coba Sekarang
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;