/**
 * DeveloperPricing.tsx  (UPDATED)
 *
 * Perubahan dari versi sebelumnya:
 *  - handleSelect: tidak lagi buka Dialog inline
 *  - Langsung navigate ke /developer/checkout?plan_id=xxx
 *  - Jika belum login → navigate ke /login dengan redirect state
 *  - Dialog subscribe dihapus (pindah ke DeveloperCheckout.tsx)
 *
 * Semua kode lain (hero, stats, features, plans grid, GSAP) TETAP sama persis.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PlanCard } from "@/components/developer/PlanCard";
import { developerService, Plan } from "@/services/api/developer.service";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Code2,
  Zap,
  Shield,
  BarChart3,
  Headphones,
  ArrowRight,
  Check,
  Sparkles,
  Globe,
  Lock,
} from "lucide-react";

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

function StatCard({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <div className="stat-card flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <p className="text-3xl font-extrabold text-blue-600 mb-1">{value}</p>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
    </div>
  );
}

function FeaturePill({ icon: Icon, label, desc }: { icon: React.ElementType; label: string; desc: string }) {
  return (
    <div className="feature-pill flex items-center gap-3 px-5 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200">
      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function TrustBadge({ text }: { text: string }) {
  return (
    <div className="trust-badge flex items-center gap-2 text-sm text-slate-600">
      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-emerald-600" />
      </div>
      {text}
    </div>
  );
}

const DeveloperPricing = () => {
  const [plans,   setPlans]   = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated }   = useAuth();
  const navigate              = useNavigate();
  const { toast }             = useToast();
  const heroRef               = useRef<HTMLElement>(null);
  const canvasRef             = useRef<HTMLCanvasElement>(null);

  /* ── Load plans ── */
  useEffect(() => {
    developerService
      .getPlans()
      .then((res) => { if (res.success) setPlans(res.data); })
      .catch(() => toast({ title: "Gagal memuat paket", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  /* ── Canvas particle bg (sama persis) ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const dots: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = [];
    for (let i = 0; i < 55; i++) {
      dots.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2 + 1, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, alpha: Math.random() * 0.4 + 0.1 });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((d) => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${d.alpha})`; ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.07 * (1 - dist / 100)})`; ctx.lineWidth = 1; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  /* ── GSAP (sama persis) ── */
  useEffect(() => {
    const loadGSAP = () => new Promise<void>((resolve) => {
      if (window.gsap) { resolve(); return; }
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
      s.onload = () => resolve(); document.head.appendChild(s);
    });
    const loadST = () => new Promise<void>((resolve) => {
      if (window.ScrollTrigger) { resolve(); return; }
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
      s.onload = () => resolve(); document.head.appendChild(s);
    });
    Promise.all([loadGSAP(), loadST()]).then(() => {
      const { gsap, ScrollTrigger } = window;
      gsap.registerPlugin(ScrollTrigger);
      const tl = gsap.timeline({ delay: 0.1 });
      tl.fromTo(".hero-badge",  { opacity: 0, y: 16, scale: 0.9 }, { opacity: 1, y: 0, scale: 1,  duration: 0.5,  ease: "back.out(1.4)" })
        .fromTo(".hero-title",  { opacity: 0, y: 24 },              { opacity: 1, y: 0,            duration: 0.55, ease: "power3.out"    }, "-=0.2")
        .fromTo(".hero-sub",    { opacity: 0, y: 16 },              { opacity: 1, y: 0,            duration: 0.45, ease: "power2.out"    }, "-=0.25")
        .fromTo(".hero-cta",    { opacity: 0, y: 12 },              { opacity: 1, y: 0,            duration: 0.4,  ease: "power2.out"    }, "-=0.2")
        .fromTo(".trust-badge", { opacity: 0, x: -10 },             { opacity: 1, x: 0,            duration: 0.35, stagger: 0.08, ease: "power2.out" }, "-=0.15");
      gsap.fromTo(".stat-card",      { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.2)", scrollTrigger: { trigger: ".stats-section", start: "top 80%" } });
      gsap.fromTo(".feature-pill",   { opacity: 0, x: -20 },            { opacity: 1, x: 0,           duration: 0.4, stagger: 0.07, ease: "power2.out",    scrollTrigger: { trigger: ".features-section", start: "top 80%" } });
      gsap.fromTo(".plans-heading",  { opacity: 0, y: 20 },             { opacity: 1, y: 0,           duration: 0.5, ease: "power2.out",                    scrollTrigger: { trigger: ".plans-section", start: "top 80%" } });
      gsap.fromTo(".plan-card-wrap", { opacity: 0, y: 40, scale: 0.96 },{ opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.1)",  scrollTrigger: { trigger: ".plans-grid", start: "top 80%" } });
      gsap.fromTo(".cta-section-inner", { opacity: 0, y: 30 },          { opacity: 1, y: 0,           duration: 0.6, ease: "power2.out",                    scrollTrigger: { trigger: ".cta-section", start: "top 80%" } });
      gsap.to(".orb-1", { y: -40, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".orb-2", { y: 30, x: 20, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".orb-3", { y: -25, x: -15, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
    });
  }, []);

  /* ══════════════════════════════════════════════════════
     ✅ HANDLER UTAMA — navigate ke checkout
  ══════════════════════════════════════════════════════ */
  const handleSelect = (plan: Plan) => {
    if (plan.is_custom) {
      window.open("mailto:support@ambilfoto.id?subject=Custom API Plan", "_blank");
      return;
    }
    if (!isAuthenticated) {
      // Simpan plan yang dipilih di sessionStorage supaya setelah login bisa lanjut
      sessionStorage.setItem("pending_plan_id", plan.id);
      navigate(`/login?redirect=${encodeURIComponent(`/developer/checkout?plan_id=${plan.id}`)}`);
      return;
    }
    // Langsung ke halaman checkout
    navigate(`/developer/checkout?plan_id=${plan.id}`);
  };

  const popularIndex = plans.findIndex((p) => p.slug === "super-2");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <Header />

      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden bg-white border-b border-slate-100 py-24 md:py-32">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        <div className="orb-1 absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-60 blur-3xl pointer-events-none" />
        <div className="orb-2 absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 opacity-50 blur-3xl pointer-events-none" />
        <div className="orb-3 absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 opacity-40 blur-2xl pointer-events-none" />

        <div className="container relative max-w-3xl text-center mx-auto px-6">
          <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Developer API Platform
          </div>
          <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
            Integrasikan{" "}
            <span className="relative">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI Face Recognition</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-blue-100 rounded-full -z-10 opacity-70" />
            </span>{" "}
            ke Aplikasimu
          </h1>
          <p className="hero-sub text-lg text-slate-500 max-w-xl mx-auto leading-relaxed mb-8">
            API berbasis subscription bulanan. Dual key (dev &amp; prod), storage quota, upload limit, dan support level berbeda tiap paket.
          </p>
          <div className="hero-cta flex flex-wrap gap-3 justify-center mb-10">
            <button
              onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-200 transition-all duration-200 cursor-pointer"
            >
              Lihat Paket <ArrowRight className="w-4 h-4" />
            </button>
            <a href="/docs">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 shadow-sm transition-all duration-200 cursor-pointer">
                <Code2 className="w-4 h-4 text-blue-600" /> Baca Dokumentasi
              </button>
            </a>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            {["Aktif instan setelah bayar", "Cancel kapan saja", "Enkripsi end-to-end", "99.9% uptime SLA"].map((t) => (
              <TrustBadge key={t} text={t} />
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section py-12 bg-slate-50">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "512-dim", label: "Face Embedding",  sub: "Akurasi tinggi"       },
              { value: "< 200ms", label: "Response Time",   sub: "API latency rata-rata" },
              { value: "10K+",    label: "Foto/bulan",      sub: "Paket tertinggi"       },
              { value: "99.9%",   label: "Uptime SLA",      sub: "Terjamin kontrak"      },
            ].map((s) => <StatCard key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section py-12 bg-white border-y border-slate-100">
        <div className="container max-w-4xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Semua paket sudah termasuk</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Code2,      label: "API Dual Key",      desc: "Dev + Production key"     },
              { icon: Shield,     label: "99.9% Uptime",      desc: "SLA terjamin"             },
              { icon: BarChart3,  label: "Usage Dashboard",   desc: "Monitor real-time"        },
              { icon: Headphones, label: "Support Prioritas", desc: "Email & WhatsApp"         },
              { icon: Lock,       label: "Enkripsi AES-256",  desc: "Data wajah aman"          },
              { icon: Zap,        label: "Aktivasi Instan",   desc: "Langsung setelah bayar"   },
              { icon: Globe,      label: "REST API",          desc: "JSON standar industri"    },
              { icon: Sparkles,   label: "AI Model Terbaru",  desc: "Diperbarui otomatis"      },
            ].map((f) => <FeaturePill key={f.label} {...f} />)}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="plans-section py-20 bg-slate-50">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="plans-heading text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-3">
              💡 Transparan tanpa biaya tersembunyi
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Pilih Paket yang Tepat</h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm">Semua paket aktif 30 hari. Bisa renew atau upgrade kapan saja.</p>
          </div>

          {loading ? (
            <div className="plans-grid grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[420px] rounded-2xl" />)}
            </div>
          ) : (
            <div className="plans-grid grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan, i) => (
                <div key={plan.id} className="plan-card-wrap">
                  <PlanCard plan={plan} isPopular={i === popularIndex} onSelect={handleSelect} loading={false} />
                </div>
              ))}
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-8">
            Butuh lebih dari 10.000 foto/bulan atau SLA khusus?{" "}
            <a href="mailto:support@ambilfoto.id?subject=Custom API Plan" className="text-blue-600 hover:underline font-medium">
              Hubungi kami untuk paket Enterprise →
            </a>
          </p>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section className="cta-section py-20 bg-white border-t border-slate-100">
        <div className="container max-w-3xl mx-auto px-6">
          <div className="cta-section-inner relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-10 md:p-14 text-center shadow-xl shadow-blue-200">
            <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2 blur-2xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3 blur-2xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-100 bg-white/10 rounded-full px-3 py-1 mb-5">
                🚀 Sudah 500+ developer aktif
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">Sudah punya akun developer?</h2>
              <p className="text-blue-100 text-sm mb-8 max-w-md mx-auto">
                Masuk ke dashboard untuk kelola API keys, monitor quota, dan lihat riwayat penggunaan secara real-time.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button onClick={() => navigate("/login")} className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-blue-700 text-sm font-bold hover:bg-blue-50 shadow-lg transition-all duration-200 cursor-pointer">
                  Masuk ke Dashboard <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => navigate("/register")} className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all duration-200 cursor-pointer">
                  Daftar Gratis
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DeveloperPricing;