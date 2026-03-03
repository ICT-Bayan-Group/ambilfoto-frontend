import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Camera, 
  Image as ImageIcon,
  Download,
  Eye,
  Settings,
  Share2,
  Globe,
  Lock,
  Edit2,
  Map as MapIconLucide,
  X,
  ZoomIn,
  Star,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { photographerService } from '@/services/api/photographer.service';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { EventDetail, PublicEventPhoto } from '@/services/api/photographer.service';

gsap.registerPlugin(ScrollTrigger);

// ─── Particle System ─────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number; y: number; r: number;
      vx: number; vy: number;
      alpha: number; color: string;
    }

    const colors = ['#FBBF24', '#FCD34D', '#60A5FA', '#93C5FD', '#ffffff'];
    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

// ─── Magnetic Button ──────────────────────────────────────────────────────────
function MagneticBtn({ children, className, style, onClick, title }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      title={title}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}

// ─── Photo Card ───────────────────────────────────────────────────────────────
function PhotoCard({ photo, index, onClick }: {
  photo: PublicEventPhoto;
  index: number;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    gsap.fromTo(card,
      { opacity: 0, y: 60, scale: 0.85, rotateX: 15 },
      {
        opacity: 1, y: 0, scale: 1, rotateX: 0,
        duration: 0.7,
        delay: (index % 8) * 0.07,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          once: true,
        }
      }
    );
  }, [index]);

  const handleMouseEnter = () => {
    gsap.to(imgRef.current, { scale: 1.12, duration: 0.5, ease: 'power2.out' });
    gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
    gsap.to(cardRef.current, { y: -8, boxShadow: '0 24px 60px rgba(251,191,36,0.35)', duration: 0.3 });
    // Shimmer sweep
    gsap.fromTo(shimmerRef.current,
      { x: '-100%', opacity: 0.8 },
      { x: '200%', opacity: 0, duration: 0.6, ease: 'power2.in' }
    );
  };

  const handleMouseLeave = () => {
    gsap.to(imgRef.current, { scale: 1, duration: 0.5, ease: 'power2.out' });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
    gsap.to(cardRef.current, { y: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', duration: 0.3 });
  };

  return (
    <div
      ref={cardRef}
      className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        transformStyle: 'preserve-3d',
        background: 'rgba(30,58,138,0.4)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Shimmer effect */}
      <div
        ref={shimmerRef}
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
          transform: 'skewX(-15deg)',
        }}
      />

      <img
        ref={imgRef}
        src={photo.preview_url}
        alt={photo.filename}
        className="w-full h-full object-cover"
        loading="lazy"
        style={{ transformOrigin: 'center' }}
      />

      {/* Gradient overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 opacity-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(30,58,138,0.5) 50%, transparent 100%)',
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold px-2 py-1 rounded-full"
              style={{ background: 'rgba(251,191,36,0.9)', color: '#1e3a8a' }}>
              {photo.is_for_sale
                ? (photo.price_points > 0 ? `${photo.price_points} Poin` : 'Gratis')
                : 'Lihat'}
            </span>
            {photo.has_location && (
              <span className="text-xs px-2 py-1 rounded-full font-bold"
                style={{ background: 'rgba(34,197,94,0.9)', color: 'white' }}>
                📍 GPS
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-white text-xs">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />{photo.matched_users}
            </span>
            <span className="flex items-center gap-1">
              <Camera className="h-3 w-3" />{photo.faces_count}
            </span>
            <ZoomIn className="h-4 w-4 text-yellow-300" />
          </div>
        </div>
      </div>

      {/* Top GPS badge */}
      {photo.has_location && (
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-10"
          style={{ background: '#22c55e' }}>
          <MapPin className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PhotographerEventPublicView() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [photos, setPhotos] = useState<PublicEventPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PublicEventPhoto | null>(null);

  // Refs for GSAP
  const heroRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const galleryTitleRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  // ─── Custom cursor ──────────────────────────────────────────────────────────
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursorRef.current, {
        x: e.clientX - 20, y: e.clientY - 20,
        duration: 0.5, ease: 'power3.out'
      });
      gsap.to(cursorDotRef.current, {
        x: e.clientX - 4, y: e.clientY - 4,
        duration: 0.1
      });
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  // ─── Scroll progress bar ────────────────────────────────────────────────────
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      if (progressRef.current) {
        progressRef.current.style.width = `${progress}%`;
      }
    };
    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  // ─── Navbar scroll effect ───────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const nav = navRef.current;
      if (!nav) return;
      if (window.scrollY > 60) {
        gsap.to(nav, {
          background: 'rgba(15,23,42,0.92)',
          backdropFilter: 'blur(20px)',
          paddingTop: '10px',
          paddingBottom: '10px',
          duration: 0.3
        });
      } else {
        gsap.to(nav, {
          background: 'transparent',
          backdropFilter: 'blur(0px)',
          paddingTop: '24px',
          paddingBottom: '24px',
          duration: 0.3
        });
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ─── Entrance animations ────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading || !event) return;

    const tl = gsap.timeline({ delay: 0.1 });

    // Header nav
    tl.fromTo(navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
    );

    // Info card
    tl.fromTo(infoCardRef.current,
      { opacity: 0, y: 80, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'expo.out' },
      '-=0.4'
    );

    // Title
    tl.fromTo(titleRef.current,
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.6'
    );

    // Stats items
    tl.fromTo('.stat-item',
      { opacity: 0, y: 20, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(2)' },
      '-=0.3'
    );

    // Gallery title
    tl.fromTo(galleryTitleRef.current,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.2'
    );

    // Floating animation on info card icon
    gsap.to('.event-icon', {
      y: -8,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    // Glow pulse on yellow accents
    gsap.to('.glow-yellow', {
      boxShadow: '0 0 30px rgba(251,191,36,0.6)',
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

  }, [isLoading, event]);

  // ─── Load data ──────────────────────────────────────────────────────────────
  const loadEventData = async () => {
    if (!eventSlug) return;
    try {
      setIsLoading(true);
      const eventResponse = await photographerService.getEventBySlug(eventSlug);
      const eventData = eventResponse.data.event;
      setEvent(eventData);
      const photosResponse = await photographerService.getEventPhotos(eventData.id);
      setPhotos(photosResponse.data.photos);
    } catch (error: any) {
      if (error.response?.status === 404) toast.error('Event tidak ditemukan');
      else if (error.response?.status === 403) toast.error('Tidak memiliki akses');
      else toast.error('Gagal memuat data event');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (eventSlug) loadEventData();
  }, [eventSlug]);

  // ─── Modal open/close with GSAP ─────────────────────────────────────────────
  const openModal = (photo: PublicEventPhoto) => {
    setSelectedPhoto(photo);
    setTimeout(() => {
      gsap.fromTo(modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(modalContentRef.current,
        { scale: 0.85, y: 40, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }, 10);
  };

  const closeModal = () => {
    gsap.to(modalContentRef.current, {
      scale: 0.9, y: 20, opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => setSelectedPhoto(null)
    });
    gsap.to(modalRef.current, { opacity: 0, duration: 0.3 });
  };

  // ─── Share ──────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    const shareUrl = event?.event_slug
      ? `${window.location.origin}/event/${event.event_slug}`
      : window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event?.event_name, url: shareUrl });
        toast.success('Berhasil share event!');
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link disalin!');
    }
  };

  const formatEventDate = (dateString: string) => {
    try {
      if (dateString.includes('|')) return dateString;
      return format(new Date(dateString), 'EEEE | dd MMMM yyyy', { locale: id });
    } catch { return dateString; }
  };

  const isPhotographer = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user_data') || '{}');
      return user.role === 'photographer';
    } catch { return false; }
  };

  const navigateToPhotographerManagement = (path: string) => {
    if (!event) return;
    navigate(path, { state: { fromSlug: event.event_slug, returnUrl: `/event/${event.event_slug}` } });
  };

  // ─── Loading State ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)' }}>
      <div className="text-center space-y-6 relative z-10">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full border-4 border-blue-400 border-b-transparent animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            <Camera className="absolute inset-0 m-auto h-8 w-8 text-yellow-400" />
          </div>
          <p className="text-white font-bold text-lg tracking-widest uppercase"
            style={{ fontFamily: 'system-ui', letterSpacing: '0.3em' }}>
            Memuat Event...
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto px-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Not Found ───────────────────────────────────────────────────────────────
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)' }}>
      <div className="text-center text-white relative z-10 px-4">
          <div className="w-28 h-28 mx-auto mb-6 rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)', boxShadow: '0 0 40px rgba(251,191,36,0.4)' }}>
            <ImageIcon className="h-14 w-14 text-blue-900" />
          </div>
          <h1 className="text-4xl font-black mb-3">Event Tidak Ditemukan</h1>
          <p className="text-blue-200 mb-8 text-lg">Event yang Anda cari tidak tersedia</p>
          <button onClick={() => navigate('/')}
            className="px-8 py-3 rounded-full font-bold text-blue-900 transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)' }}>
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 40%, #0f172a 100%)' }}>

      {/* Custom Cursor */}
      <div ref={cursorRef} className="fixed z-[9999] pointer-events-none hidden lg:block"
        style={{
          width: 40, height: 40,
          border: '2px solid rgba(251,191,36,0.6)',
          borderRadius: '50%',
          mixBlendMode: 'difference',
        }} />
      <div ref={cursorDotRef} className="fixed z-[9999] pointer-events-none hidden lg:block"
        style={{
          width: 8, height: 8,
          background: '#FBBF24',
          borderRadius: '50%',
        }} />

      {/* Scroll Progress */}
      <div className="fixed top-0 left-0 right-0 z-[1000] h-1"
        style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div ref={progressRef} className="h-full transition-none"
          style={{ background: 'linear-gradient(90deg, #FBBF24, #60A5FA)', width: '0%' }} />
      </div>

      {/* Background Layers */}
      <ParticleCanvas />

      {/* Dot pattern background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, #FBBF24 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

      {/* Radial glow blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #FBBF24, transparent)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #1D4ED8, transparent)' }} />
      </div>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-[500] px-4 py-6 flex items-center justify-between"
        style={{ transition: 'background 0.3s' }}>
        <MagneticBtn
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-white text-sm transition-all hover:scale-105"
          style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Kembali</span>
        </MagneticBtn>

        {/* Center logo/title */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)' }}>
            <Camera className="h-4 w-4 text-blue-900" />
          </div>
          <span className="text-white font-black text-sm tracking-wider uppercase">FotoMap</span>
        </div>

        <div className="flex items-center gap-2">
          <MagneticBtn
            onClick={handleShare}
            title="Share"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
            style={{
              background: 'rgba(251,191,36,0.15)',
              border: '1px solid rgba(251,191,36,0.4)',
            }}
          >
            <Share2 className="h-4 w-4" />
          </MagneticBtn>

          {isPhotographer() && (
            <>
              <MagneticBtn
                onClick={() => navigateToPhotographerManagement(`/photographer/events/${event.id}`)}
                title="Kelola Event"
                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                style={{
                  background: 'rgba(96,165,250,0.15)',
                  border: '1px solid rgba(96,165,250,0.4)',
                }}
              >
                <Settings className="h-4 w-4" />
              </MagneticBtn>
              <MagneticBtn
                onClick={() => navigateToPhotographerManagement(`/photographer/fotomap/${event.id}`)}
                title="Lihat Peta"
                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                style={{
                  background: 'rgba(96,165,250,0.15)',
                  border: '1px solid rgba(96,165,250,0.4)',
                }}
              >
                <MapIconLucide className="h-4 w-4" />
              </MagneticBtn>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO / EVENT INFO ───────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative z-10 container mx-auto px-4 pt-28 pb-8 max-w-5xl">

        {/* Event Info Card */}
        <div ref={infoCardRef} className="relative rounded-3xl overflow-hidden mb-10"
          style={{
            background: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(251,191,36,0.2)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
          }}>

          {/* Top accent bar */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #FBBF24, #60A5FA, #FBBF24)' }} />

          {/* Diagonal accent */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at top right, #FBBF24, transparent)',
            }} />

          <div className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-start gap-6">

              {/* Event Icon */}
              <div className="event-icon flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center glow-yellow"
                style={{
                  background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                  boxShadow: '0 8px 32px rgba(251,191,36,0.4)',
                }}>
                <Camera className="h-10 w-10 md:h-12 md:w-12 text-blue-900" />
              </div>

              <div className="flex-1 min-w-0">
                {/* Title */}
                <h1 ref={titleRef}
                  className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight"
                  style={{ textShadow: '0 0 40px rgba(251,191,36,0.3)' }}>
                  {event.event_name}
                </h1>

                {/* Slug */}
                {event.event_slug && (
                  <div className="mb-4 inline-flex items-center gap-2">
                    <Globe className="h-3 w-3 text-yellow-400" />
                    <code className="text-xs text-yellow-300 px-3 py-1 rounded-full"
                      style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
                      ambilfoto.id/event/{event.event_slug}
                    </code>
                  </div>
                )}

                {/* Stats Row */}
                <div ref={statsRef} className="flex flex-wrap gap-3 mb-5">
                  <div className="stat-item flex items-center gap-2 px-4 py-2 rounded-2xl text-white font-bold text-sm"
                    style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
                    <ImageIcon className="h-4 w-4 text-yellow-400" />
                    {event.total_photos} Foto
                  </div>

                  {event.geo_enabled_photos > 0 && (
                    <div className="stat-item flex items-center gap-2 px-4 py-2 rounded-2xl text-white font-bold text-sm"
                      style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                      <MapPin className="h-4 w-4 text-green-400" />
                      {event.geo_enabled_photos} GPS · {event.geo_percentage || 0}%
                    </div>
                  )}

                  <div className="stat-item flex items-center gap-2 px-4 py-2 rounded-2xl text-white font-bold text-sm"
                    style={{ background: event.is_public ? 'rgba(96,165,250,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${event.is_public ? 'rgba(96,165,250,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                    {event.is_public
                      ? <><Globe className="h-4 w-4 text-blue-400" /> Public</>
                      : <><Lock className="h-4 w-4 text-red-400" /> Private</>
                    }
                  </div>
                </div>

                {/* Location & Date */}
                <div className="space-y-2 mb-5">
                  {event.location && (
                    <div className="flex items-center gap-2 text-blue-200">
                      <MapPin className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-blue-200">
                    <Calendar className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-sm">{formatEventDate(event.event_date)}</span>
                  </div>
                  {event.event_latitude && event.event_longitude && (
                    <div className="flex items-center gap-2 text-blue-200">
                      <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                      <span className="text-sm font-mono text-xs">
                        {Number(event.event_latitude).toFixed(5)}, {Number(event.event_longitude).toFixed(5)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {event.description && (
                  <div className="p-4 rounded-2xl mb-5 text-sm text-blue-100 leading-relaxed"
                    style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)' }}>
                    {event.description}
                  </div>
                )}

                {/* Photographer */}
                {event.photographer && (
                  <div className="flex items-center gap-3 pt-4"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent">
                      {event.photographer.photo
                        ? <img src={event.photographer.photo} alt={event.photographer.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
                            <Camera className="h-5 w-5 text-blue-900" />
                          </div>
                      }
                    </div>
                    <div>
                      <p className="text-xs text-blue-300">Fotografer</p>
                      <p className="text-sm font-bold text-white">{event.photographer.name}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs px-3 py-1 rounded-full font-bold text-blue-900"
                        style={{ background: 'linear-gradient(135deg,#FBBF24,#FCD34D)' }}>
                        ✦ PRO
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── GALLERY SECTION ─────────────────────────────────────────────── */}
        <div ref={galleryTitleRef} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(180deg,#FBBF24,#60A5FA)' }} />
            <h2 className="text-2xl md:text-3xl font-black text-white">Galeri Foto</h2>
            <span className="px-3 py-1 rounded-full text-sm font-bold text-blue-900"
              style={{ background: 'linear-gradient(135deg,#FBBF24,#FCD34D)' }}>
              {photos.length}
            </span>
          </div>

          {event.geo_enabled_photos > 0 && isPhotographer() && (
            <button
              onClick={() => navigateToPhotographerManagement(`/photographer/fotomap/${event.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-white text-sm transition-all hover:scale-105 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
                boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
              }}>
              <MapIconLucide className="h-4 w-4" />
              Lihat di Peta
            </button>
          )}
        </div>

        {/* Photo Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 pb-16">
            {photos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={index}
                onClick={() => openModal(photo)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 relative z-10">
            <div className="w-28 h-28 mx-auto mb-6 rounded-3xl flex items-center justify-center animate-pulse"
              style={{ background: 'rgba(251,191,36,0.1)', border: '2px dashed rgba(251,191,36,0.3)' }}>
              <ImageIcon className="h-14 w-14 text-yellow-400 opacity-50" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Belum Ada Foto</h3>
            <p className="text-blue-300 mb-8">Event ini belum memiliki foto yang tersedia</p>
            {isPhotographer() && (
              <button
                onClick={() => navigateToPhotographerManagement(`/photographer/events/${event.id}`)}
                className="px-8 py-3 rounded-full font-bold text-blue-900 transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)' }}>
                <Camera className="h-4 w-4 inline mr-2" />
                Upload Foto
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── PHOTO MODAL ─────────────────────────────────────────────────────── */}
      {selectedPhoto && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-[800] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
          onClick={closeModal}
        >
          <div
            ref={modalContentRef}
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button onClick={closeModal}
              className="absolute -top-14 right-0 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 hover:bg-red-500"
              style={{ background: 'rgba(255,255,255,0.15)' }}>
              <X className="h-5 w-5" />
            </button>

            {/* Image */}
            <div className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ boxShadow: '0 0 60px rgba(251,191,36,0.2)' }}>
              <img
                src={selectedPhoto.preview_url}
                alt={selectedPhoto.filename}
                className="w-full h-auto max-h-[65vh] object-contain"
                style={{ background: '#0f172a' }}
              />
            </div>

            {/* Info Panel */}
            <div className="mt-4 rounded-3xl p-5"
              style={{
                background: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(251,191,36,0.2)',
                backdropFilter: 'blur(20px)',
              }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-black text-white text-lg">{selectedPhoto.filename}</h3>
                  <div className="flex items-center gap-4 text-sm text-blue-300 mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-yellow-400" />
                      {selectedPhoto.matched_users} matches
                    </span>
                    <span className="flex items-center gap-1">
                      <Camera className="h-3.5 w-3.5 text-yellow-400" />
                      {selectedPhoto.faces_count} faces
                    </span>
                    {selectedPhoto.has_location && (
                      <span className="flex items-center gap-1 text-green-400 font-bold">
                        <MapPin className="h-3.5 w-3.5" />
                        GPS
                      </span>
                    )}
                  </div>
                </div>

                {selectedPhoto.is_for_sale && (
                  <div className="px-4 py-2 rounded-2xl text-center"
                    style={{ background: 'linear-gradient(135deg,rgba(251,191,36,0.15),rgba(251,191,36,0.05))', border: '1px solid rgba(251,191,36,0.3)' }}>
                    <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Harga</p>
                    <p className="text-lg font-black text-white">
                      {selectedPhoto.price_points > 0 ? `${selectedPhoto.price_points} Poin` : 'Gratis'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {isPhotographer() && (
                  <button
                    onClick={() => {
                      closeModal();
                      setTimeout(() => navigateToPhotographerManagement(`/photographer/events/${event.id}?photoId=${selectedPhoto.id}`), 350);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
                      boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
                    }}>
                    <Edit2 className="h-4 w-4" />
                    Edit Detail
                  </button>
                )}
                <button
                  onClick={() => window.open(selectedPhoto.download_url, '_blank')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-blue-900 transition-all hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg,#FBBF24,#F59E0B)',
                    boxShadow: '0 4px 20px rgba(251,191,36,0.4)',
                  }}>
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}