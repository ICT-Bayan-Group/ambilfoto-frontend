import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Camera, Scan, Download, Zap, Shield, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
 const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'photographer' || user?.role === 'admin') {
        navigate('/photographer/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as any
      }
    }
  } as const;

  const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: { 
      scale: 1.03, 
      y: -8,
      transition: {
        duration: 0.3,
        ease: "easeOut" as any
      }
    }
  } as const;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
        
        {/* Animated background blobs */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="container relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="mx-auto max-w-3xl text-center">
            <motion.div 
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary"
              variants={itemVariants}
            >
              <Zap className="h-4 w-4" />
              <span>AI-Powered Photo Recognition</span>
            </motion.div>
            
            <motion.h1 
              className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
              variants={itemVariants}
            >
              Temukan Foto Eventmu{" "}
              <span className="text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Dengan Cepat
              </span>
            </motion.h1>
            
            <motion.p 
              className="mb-8 text-lg text-muted-foreground sm:text-xl"
              variants={itemVariants}
            >
              Upload wajah kamu, temukan momen-momen kamu. AI kita akan menemukan foto kamu dari acara apa pun.
            </motion.p>
            
            <motion.div 
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
              variants={itemVariants}
            >
              <Link to="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="shadow-strong">
                    <Camera className="mr-2 h-5 w-5" />
                    Ambil Fotomu
                  </Button>
                </motion.div>
              </Link>
              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline">
                    Masuk
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Bagaimana Caranya?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tiga langkah sederhana untuk menemukan semua foto kamu secara otomatis
            </p>
          </motion.div>
          
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.2,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <motion.div
                    variants={cardHoverVariants}
                    initial="rest"
                    whileHover="hover"
                  >
                    <Card className="shadow-soft transition-shadow hover:shadow-strong border-border/50 h-full">
                      <CardContent className="pt-6">
                        <motion.div 
                          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-${feature.color}/10`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon className={`h-6 w-6 text-${feature.color}`} />
                        </motion.div>
                        <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
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
                    <motion.div
                      key={index}
                      className="flex gap-4"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.15,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    >
                      <motion.div 
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-${benefit.color}/10`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className={`h-5 w-5 text-${benefit.color}`} />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold mb-1">{benefit.title}</h3>
                        <p className="text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <img 
                  src="https://images.pexels.com/photos/13152078/pexels-photo-13152078.jpeg" 
                  alt="Event photography"
                  className="aspect-square rounded-2xl object-cover shadow-strong"
                />
              </motion.div>
              
              {/* Decorative floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"
                animate={{
                  y: [0, 20, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "50px 50px"
          }}
          animate={{
            backgroundPosition: ["0px 0px", "50px 50px"]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <div className="container relative">
          <motion.div 
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Siap Menemukan Foto Kamu?
            </motion.h2>
            <motion.p 
              className="text-lg mb-8 text-primary-foreground/90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Bergabunglah dengan pengguna lain yang telah menemukan momen acara mereka dengan mudah.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="secondary" className="shadow-strong">
                    Coba Sekarang
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;