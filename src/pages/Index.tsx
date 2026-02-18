import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Camera, Scan, Download, Zap, Shield, Clock,
  Code2, ArrowRight, Key, BarChart3, Sparkles,
  Check, Star, Users, Image as ImageIcon, Globe,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════
   STEP CARD
═══════════════════════════════════════════════════════════════ */
function StepCard({
  icon: Icon,
  step,
  title,
  desc,
  color,
}: {
  icon: React.ElementType;
  step: string;
  title: string;
  desc: string;
  color: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onEnter = () => {
    gsap.to(ref.current, { y: -8, scale: 1.02, duration: 0.3, ease: "power2.out" });
    gsap.to(ref.current?.querySelector(".step-icon"), { rotate: 12, scale: 1.15, duration: 0.3, ease: "back.out(2)" });
  };
  const onLeave = () => {
    gsap.to(ref.current, { y: 0, scale: 1, duration: 0.3, ease: "power2.out" });
    gsap.to(ref.current?.querySelector(".step-icon"), { rotate: 0, scale: 1, duration: 0.3, ease: "power2.out" });
  };

  return (
    <div
      ref={ref}
      className="feature-card relative bg-white rounded-2xl border border-slate-200 p-7 shadow-sm hover:shadow-lg hover:border-slate-300 transition-shadow duration-300 cursor-default"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Step number */}
      <span className="absolute top-5 right-5 text-xs font-bold text-slate-300 font-mono">{step}</span>

      <div className={`step-icon mb-5 w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BENEFIT ROW
═══════════════════════════════════════════════════════════════ */
function BenefitRow({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
}) {
  const iconRef = useRef<HTMLDivElement>(null);
  return (
    <div
      className="benefit-item flex items-start gap-4"
      onMouseEnter={() => gsap.to(iconRef.current, { scale: 1.15, rotate: 6, duration: 0.25, ease: "back.out(2)" })}
      onMouseLeave={() => gsap.to(iconRef.current, { scale: 1, rotate: 0, duration: 0.25, ease: "power2.out" })}
    >
      <div ref={iconRef} className={`shrink-0 w-11 h-11 rounded-xl ${color} flex items-center justify-center shadow-sm`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-semibold text-slate-900 mb-0.5">{title}</p>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAT PILL
═══════════════════════════════════════════════════════════════ */
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat-pill flex flex-col items-center px-6 py-4 bg-white/80 backdrop-blur rounded-2xl border border-slate-200 shadow-sm">
      <p className="text-2xl font-extrabold text-blue-600">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5 text-center">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  /* refs */
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const heroRef      = useRef<HTMLDivElement>(null);
  const blob1Ref     = useRef<HTMLDivElement>(null);
  const blob2Ref     = useRef<HTMLDivElement>(null);
  const blob3Ref     = useRef<HTMLDivElement>(null);
  const badgeRef     = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLHeadingElement>(null);
  const subRef       = useRef<HTMLParagraphElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);
  const trustRef     = useRef<HTMLDivElement>(null);
  const statsRef     = useRef<HTMLDivElement>(null);
  const featuresRef  = useRef<HTMLDivElement>(null);
  const benefitsRef  = useRef<HTMLDivElement>(null);
  const imageRef     = useRef<HTMLImageElement>(null);
  const apiRef       = useRef<HTMLElement>(null);
  const ctaSecRef    = useRef<HTMLElement>(null);

  /* redirect if logged in */
  useEffect(() => {
    if (!isAuthenticated) return;
    navigate(
      user?.role === "photographer" || user?.role === "admin"
        ? "/photographer/dashboard"
        : "/user/dashboard"
    );
  }, [isAuthenticated, user, navigate]);

  /* ── Canvas particle network ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      a: Math.random() * 0.35 + 0.08,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((d) => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width)  d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${d.a})`;
        ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / 110)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  /* ── GSAP animations ── */
  useEffect(() => {
    const ctx = gsap.context(() => {

      /* Blobs */
      gsap.to(blob1Ref.current, { scale: 1.25, opacity: 0.55, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(blob2Ref.current, { scale: 0.8,  opacity: 0.45, duration: 11, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(blob3Ref.current, { y: -30, x: 20, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });

      /* Hero entrance */
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .from(badgeRef.current,  { y: 24, opacity: 0, scale: 0.9, duration: 0.65, ease: "back.out(1.5)" })
        .from(headingRef.current, { y: 48, opacity: 0, duration: 0.85 }, "-=0.35")
        .from(subRef.current,     { y: 28, opacity: 0, duration: 0.65 }, "-=0.5")
        .from(ctaRef.current?.children ?? [], { y: 24, opacity: 0, duration: 0.55, stagger: 0.13 }, "-=0.4")
        .from(trustRef.current?.children ?? [], { y: 12, opacity: 0, duration: 0.4, stagger: 0.08 }, "-=0.3");

      /* Stats */
      gsap.from(".stat-pill", {
        scrollTrigger: { trigger: statsRef.current, start: "top 82%" },
        y: 30, opacity: 0, scale: 0.92, duration: 0.5, stagger: 0.1, ease: "back.out(1.3)",
      });

      /* Feature cards */
      gsap.from(".feature-card", {
        scrollTrigger: { trigger: featuresRef.current, start: "top 80%", toggleActions: "play none none reverse" },
        y: 60, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power3.out",
      });

      /* Benefits */
      gsap.from(".benefit-item", {
        scrollTrigger: { trigger: benefitsRef.current, start: "top 80%", toggleActions: "play none none reverse" },
        x: -40, opacity: 0, duration: 0.65, stagger: 0.13, ease: "power3.out",
      });

      /* Photo */
      if (imageRef.current) {
        gsap.from(imageRef.current, {
          scrollTrigger: { trigger: imageRef.current, start: "top 80%", toggleActions: "play none none reverse" },
          scale: 0.85, opacity: 0, duration: 0.9, ease: "power3.out",
        });
        gsap.to(imageRef.current, { y: -18, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }

      /* API section */
      gsap.from(".api-content > *", {
        scrollTrigger: { trigger: apiRef.current, start: "top 80%", toggleActions: "play none none reverse" },
        y: 40, opacity: 0, duration: 0.6, stagger: 0.12, ease: "power2.out",
      });
      gsap.from(".api-badge", {
        scrollTrigger: { trigger: apiRef.current, start: "top 80%" },
        x: 30, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power2.out",
      });

      /* CTA bottom */
      gsap.from(".cta-inner > *", {
        scrollTrigger: { trigger: ctaSecRef.current, start: "top 80%", toggleActions: "play none none reverse" },
        y: 40, opacity: 0, duration: 0.65, stagger: 0.15, ease: "power2.out",
      });

      /* Dot grid parallax */
      gsap.to(".dot-grid", {
        backgroundPosition: "50px 50px",
        duration: 25,
        repeat: -1,
        ease: "none",
      });

    });

    return () => ctx.revert();
  }, []);

  /* ── CTA button hover ── */
  const onBtnEnter = (e: React.MouseEvent<HTMLButtonElement>) =>
    gsap.to(e.currentTarget, { scale: 1.05, duration: 0.25, ease: "power2.out" });
  const onBtnLeave = (e: React.MouseEvent<HTMLButtonElement>) =>
    gsap.to(e.currentTarget, { scale: 1, duration: 0.25, ease: "power2.out" });

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <Header />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-white border-b border-slate-100 py-24 md:py-36"
      >
        {/* Particle canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Blobs */}
        <div ref={blob1Ref} className="absolute -top-28 -left-28 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-50 blur-3xl pointer-events-none" />
        <div ref={blob2Ref} className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-violet-100 to-purple-100 opacity-40 blur-3xl pointer-events-none" />
        <div ref={blob3Ref} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-sky-100 to-blue-50 opacity-30 blur-2xl pointer-events-none" />

        <div className="container relative max-w-3xl mx-auto px-6 text-center">
          {/* Badge */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Photo Recognition
          </div>

          {/* Heading */}
          <h1
            ref={headingRef}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5"
          >
            Temukan Foto Eventmu{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Dengan Cepat
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-blue-100 rounded-full -z-10 opacity-80" />
            </span>
          </h1>

          {/* Sub */}
          <p ref={subRef} className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed mb-8">
            Upload wajah kamu, temukan momen-momenmu. AI kami akan menemukanmu dari ribuan foto acara secara otomatis.
          </p>

          {/* CTA buttons */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link to="/register">
              <button
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 cursor-pointer"
                onMouseEnter={onBtnEnter}
                onMouseLeave={onBtnLeave}
              >
                <Camera className="w-4 h-4" />
                Ambil Fotomu
              </button>
            </Link>
            <Link to="/login">
              <button
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-200 cursor-pointer"
                onMouseEnter={onBtnEnter}
                onMouseLeave={onBtnLeave}
              >
                Masuk ke Akun
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Trust */}
          <div ref={trustRef} className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            {["Gratis untuk pengguna", "Enkripsi end-to-end", "Tidak perlu install", "Aktif instan"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-sm text-slate-500">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <section className="py-10 bg-slate-50">
        <div ref={statsRef} className="container max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "500K+",  label: "Foto diproses" },
              { value: "95%+",   label: "Akurasi AI" },
              { value: "< 2s",   label: "Waktu pencarian" },
              { value: "10K+",   label: "Pengguna aktif" },
            ].map((s) => <StatPill key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section ref={featuresRef} className="py-20 bg-white border-y border-slate-100">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-4">
              ⚡ Mudah & Cepat
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Bagaimana Caranya?</h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm">
              Tiga langkah sederhana untuk menemukan semua fotomu secara otomatis.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Camera, step: "01",
                title: "Upload Wajah Kamu",
                desc: "Ambil selfie cepat atau unggah foto. AI kami membuat profil wajah unik hanya untukmu.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Scan, step: "02",
                title: "AI Menemukan Fotomu",
                desc: "Face recognition canggih memindai ribuan foto event untuk menemukanmu.",
                color: "bg-indigo-50 text-indigo-600",
              },
              {
                icon: Download, step: "03",
                title: "Download & Bagikan",
                desc: "Akses semua fotomu di satu tempat. Unduh kualitas tinggi dan bagikan ke teman.",
                color: "bg-violet-50 text-violet-600",
              },
            ].map((f) => <StepCard key={f.step} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── WHY AMBILFOTO ─────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="grid gap-14 lg:grid-cols-2 items-center">

            {/* Left — benefits */}
            <div ref={benefitsRef}>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 mb-5">
                ✅ Kenapa AmbilFoto.id?
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 leading-tight">
                Cepat, Aman,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Akurat
                </span>
              </h2>
              <div className="space-y-6">
                {[
                  { icon: Clock,  title: "Lightning Fast", desc: "Temukan foto dalam hitungan detik. Tidak perlu scroll manual.", color: "bg-blue-50 text-blue-600" },
                  { icon: Shield, title: "Privacy First",  desc: "Data wajah dienkripsi AES-256. Kami tidak pernah menjual informasimu.", color: "bg-emerald-50 text-emerald-600" },
                  { icon: Zap,    title: "95%+ Accuracy",  desc: "Model AI mutakhir memastikan presisi tinggi di semua kondisi foto.", color: "bg-amber-50 text-amber-600" },
                  { icon: Globe,  title: "Multi-event",    desc: "Satu akun untuk semua event — wisuda, konser, konferensi, dan lainnya.", color: "bg-indigo-50 text-indigo-600" },
                ].map((b) => <BenefitRow key={b.title} {...b} />)}
              </div>
            </div>

            {/* Right — photo */}
            <div className="relative flex justify-center">
              {/* Decorative blobs */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-70 pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

              {/* Photo */}
              <div
                className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-slate-300 border-4 border-white"
                onMouseEnter={(e) => gsap.to(e.currentTarget.querySelector("img"), { scale: 1.05, duration: 0.4, ease: "power2.out" })}
                onMouseLeave={(e) => gsap.to(e.currentTarget.querySelector("img"), { scale: 1, duration: 0.4, ease: "power2.out" })}
              >
                <img
                  ref={imageRef}
                  src="https://images.pexels.com/photos/13152078/pexels-photo-13152078.jpeg"
                  alt="Event photography"
                  className="w-full max-w-sm aspect-square object-cover"
                />

                {/* Floating badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-2xl px-4 py-3 shadow-lg border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">12 foto ditemukan!</p>
                    <p className="text-xs text-slate-500">Wisuda 2025 — 0.8 detik</p>
                  </div>
                  <div className="ml-auto flex -space-x-1.5">
                    {[Star, Star, Star].map((S, i) => <S key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEVELOPER API STRIP ───────────────────────────────── */}
      <section
        ref={apiRef}
        className="py-20 bg-slate-900 text-white"
      >
        <div className="container max-w-5xl mx-auto px-6">
          <div className="api-content flex flex-col lg:flex-row items-start lg:items-center gap-10 justify-between">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-5">
                <Code2 className="w-3.5 h-3.5" />
                Developer API Platform
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
                Build with our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  Face Recognition API
                </span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-7 max-w-lg">
                Integrasikan AI face recognition ke aplikasimu. Dual API keys, usage analytics, storage quota, dan paket bulanan fleksibel.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Key,      label: "Dev & Prod Keys" },
                  { icon: BarChart3, label: "Usage Dashboard" },
                  { icon: Shield,   label: "SLA Guarantee"  },
                  { icon: Users,    label: "500+ Developer"  },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="api-badge flex items-center gap-2 text-xs font-medium text-slate-300 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto">
              <Link to="/pricing">
                <button
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all duration-200 cursor-pointer"
                  onMouseEnter={onBtnEnter}
                  onMouseLeave={onBtnLeave}
                >
                  Lihat Paket API <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/docs">
                <button
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-sm transition-all duration-200 cursor-pointer"
                  onMouseEnter={onBtnEnter}
                  onMouseLeave={onBtnLeave}
                >
                  <Code2 className="w-4 h-4" />
                  Baca Dokumentasi
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ────────────────────────────────────────── */}
      <section ref={ctaSecRef} className="py-20 bg-white border-t border-slate-100">
        <div className="container max-w-2xl mx-auto px-6">
          <div className="cta-inner relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-10 md:p-14 text-center shadow-2xl shadow-blue-200">
            {/* Dot grid overlay */}
            <div
              className="dot-grid absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
            />
            {/* Blobs */}
            <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-100 bg-white/10 rounded-full px-3 py-1 mb-5">
                🎉 Bergabung dengan 10.000+ pengguna
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                Siap Menemukan<br />Fotomu?
              </h2>
              <p className="text-blue-100 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                Gratis untuk pengguna. Daftar sekarang dan temukan semua momen berhargamu dari acara apapun.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/register">
                  <button
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 shadow-lg transition-all duration-200 cursor-pointer"
                    onMouseEnter={onBtnEnter}
                    onMouseLeave={onBtnLeave}
                  >
                    <Camera className="w-4 h-4" />
                    Coba Sekarang — Gratis
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;