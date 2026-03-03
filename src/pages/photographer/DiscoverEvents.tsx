import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  photographerService,
  PublicEventBrowse,
} from "@/services/api/photographer.service";
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
  ArrowLeft,
  UserPlus,
  CheckCircle,
  Globe,
  Lock,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import PhotographerHeader from "@/components/layout/HeaderPhoto";
import { Footer } from "@/components/layout/Footer";

const TYPE_LABELS: Record<string, string> = {
  wedding: "Wedding",
  birthday: "Ulang Tahun",
  corporate: "Korporat",
  graduation: "Wisuda",
  concert: "Konser",
  sports: "Olahraga",
  other: "Lainnya",
};

const TYPE_COLORS: Record<string, string> = {
  wedding:    "bg-pink-100 text-pink-700",
  birthday:   "bg-yellow-100 text-yellow-700",
  corporate:  "bg-slate-100 text-slate-700",
  graduation: "bg-emerald-100 text-emerald-700",
  concert:    "bg-violet-100 text-violet-700",
  sports:     "bg-orange-100 text-orange-700",
  other:      "bg-gray-100 text-gray-600",
};

type FilterType = "all" | "collaborative" | "public";

const SkeletonCard = () => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden">
    <div className="h-1.5 bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse" />
    <div className="p-5 space-y-3 animate-pulse">
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
      </div>
      <div className="space-y-2 pt-1">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
      <div className="flex gap-3 py-3 border-y border-border">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 flex-1 rounded-xl" />
      </div>
    </div>
  </div>
);

const EmptyState = ({ search, filter }: { search: string; filter: FilterType }) => (
  <div className="col-span-full flex flex-col items-center py-24 text-center">
    <div className="relative mb-6">
      <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
        {search
          ? <Search className="h-10 w-10 text-blue-200" />
          : <Globe className="h-10 w-10 text-blue-200" />
        }
      </div>
      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
        <Sparkles className="h-4 w-4 text-indigo-400" />
      </div>
    </div>
    <h3 className="text-lg font-semibold mb-2">
      {search ? "Tidak ditemukan" : "Belum ada event tersedia"}
    </h3>
    <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
      {search
        ? `Tidak ada event yang cocok dengan "${search}". Coba kata kunci lain.`
        : filter === "collaborative"
        ? "Belum ada event kolaboratif yang open untuk umum saat ini."
        : "Belum ada event publik yang tersedia. Coba lagi nanti."}
    </p>
  </div>
);

export default function DiscoverEvents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchRef = useRef<HTMLInputElement>(null);

  const [events, setEvents]             = useState<PublicEventBrowse[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch]             = useState("");
  const [debSearch, setDebSearch]       = useState("");
  const [filter, setFilter]             = useState<FilterType>("all");
  const [joiningId, setJoiningId]       = useState<string | null>(null);
  // Map eventId → 'joined' (approved, can upload now)
  const [joinedMap, setJoinedMap]       = useState<Map<string, boolean>>(new Map());
  const [pagination, setPagination]     = useState({
    total: 0, page: 1, limit: 18, total_pages: 1,
  });

  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 420);
    return () => clearTimeout(t);
  }, [search]);

  const fetchEvents = useCallback(async (page = 1, replace = true) => {
    page === 1 ? setIsLoading(true) : setIsLoadingMore(true);
    try {
      const res = await photographerService.browsePublicEvents({
        search: debSearch || undefined,
        type:   filter,
        page,
        limit:  18,
      });
      if (res.success && res.data) {
        setEvents(prev => replace ? res.data! : [...prev, ...res.data!]);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch {
      toast({ title: "Gagal memuat event", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [debSearch, filter, toast]);

  useEffect(() => { fetchEvents(1, true); }, [fetchEvents]);

  const handleJoin = async (event: PublicEventBrowse) => {
    setJoiningId(event.id);
    try {
      const res = await photographerService.joinEvent(event.id);
      if (res.success) {
        // Langsung approved — update map dan refresh list
        setJoinedMap(prev => new Map(prev).set(event.id, true));
        toast({
          title: "Berhasil bergabung! 🎉",
          description: `Anda sekarang bisa upload foto ke "${event.event_name}".`,
        });
        // Refresh list supaya event hilang dari discover (sudah joined)
        fetchEvents(pagination.page, true);
      } else {
        toast({ title: "Gagal bergabung", description: res.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Terjadi kesalahan", variant: "destructive" });
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PhotographerHeader />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[32rem] h-[32rem] rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 rounded-full bg-indigo-500/15 blur-2xl" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/photographer/events")}
            className="mb-6 text-white/60 hover:text-white hover:bg-white/10 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Event Saya
          </Button>

          <div className="max-w-xl">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-400/30">
                <Globe className="h-4 w-4 text-blue-300" />
              </div>
              <span className="text-xs font-semibold text-blue-300 tracking-widest uppercase">
                Discover
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
              Temukan Event &{" "}
              <span className="text-blue-300">Berkolaborasi</span>
            </h1>
            <p className="text-white/55 text-base leading-relaxed">
              Jelajahi event publik fotografer lain. Bergabung ke event kolaboratif
              dan langsung upload foto — tanpa perlu menunggu persetujuan.
            </p>

            {/* Search */}
            <div className="mt-8 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama event atau lokasi..."
                className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400/40 focus:bg-white/15 transition-all text-sm md:text-base"
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {!isLoading && (
              <p className="mt-3 text-xs text-white/35">
                {pagination.total > 0
                  ? `${pagination.total} event ditemukan`
                  : debSearch ? "Tidak ada hasil" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <main className="container mx-auto px-4 py-8">

        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-7 overflow-x-auto pb-1">
          {(["all", "collaborative", "public"] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all
                ${filter === f
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-blue-300 hover:text-blue-600"
                }
              `}
            >
              {f === "all" ? "Semua Event" : f === "collaborative" ? "🤝 Kolaboratif" : "🌐 Publik saja"}
            </button>
          ))}

          {debSearch && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm">
              <Search className="h-3.5 w-3.5" />
              <span className="max-w-[140px] truncate">"{debSearch}"</span>
              <button onClick={() => setSearch("")}>
                <X className="h-3.5 w-3.5 hover:text-blue-900" />
              </button>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
          ) : events.length === 0 ? (
            <EmptyState search={debSearch} filter={filter} />
          ) : (
            events.map((event) => {
              const joined  = joinedMap.get(event.id) ?? false;
              const isFull  = event.slots_remaining !== null && event.slots_remaining <= 0;
              const joining = joiningId === event.id;
              const tColor  = TYPE_COLORS[event.event_type ?? "other"] ?? TYPE_COLORS.other;
              const tLabel  = TYPE_LABELS[event.event_type ?? "other"] ?? "Lainnya";

              return (
                <article
                  key={event.id}
                  className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-200"
                >
                  {/* accent stripe */}
                  <div className={`h-1.5 ${
                    event.is_collaborative
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                      : "bg-gradient-to-r from-slate-300 to-slate-200"
                  }`} />

                  <div className="p-5">
                    {/* Title + badges */}
                    <div className="mb-3">
                      <h3 className="font-semibold text-base truncate mb-2 leading-snug">
                        {event.event_name}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {event.event_type && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tColor}`}>
                            {tLabel}
                          </span>
                        )}
                        {event.is_collaborative ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                            <Users className="h-3 w-3" />
                            Kolaboratif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                            <Globe className="h-3 w-3" />
                            Publik
                          </span>
                        )}
                        {isFull && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-600">
                            Penuh
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="space-y-1.5 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>
                          {format(new Date(event.event_date), "d MMMM yyyy", { locale: localeId })}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Camera className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate font-medium text-foreground/70">
                          {event.business_name || event.photographer_name}
                        </span>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 py-3 border-y border-border/60 mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>{event.photo_count} foto</span>
                      </div>
                      {event.is_collaborative && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>
                            {event.collaborator_count}
                            {event.max_collaborators ? `/${event.max_collaborators}` : ""} kolaborator
                          </span>
                        </div>
                      )}
                      {event.is_collaborative && event.slots_remaining !== null && !isFull && (
                        <div className="ml-auto flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {event.slots_remaining} slot tersisa
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {event.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl h-9 text-xs font-medium"
                        onClick={() => navigate(`/photographer/events/public/${event.id}`)}
                      >
                        Lihat Detail
                      </Button>

                      {event.is_collaborative ? (
                        joined ? (
                          /* Sudah joined → langsung ke halaman upload */
                          <Button
                            size="sm"
                            className="flex-1 rounded-xl h-9 text-xs font-medium gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => navigate(`/photographer/events/${event.id}`)}
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Upload Foto
                          </Button>
                        ) : isFull ? (
                          <Button
                            size="sm"
                            className="flex-1 rounded-xl h-9 text-xs font-medium opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
                            disabled
                          >
                            <Lock className="h-3.5 w-3.5" />
                            Penuh
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1 rounded-xl h-9 text-xs font-medium gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={joining}
                            onClick={() => handleJoin(event)}
                          >
                            {joining
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <UserPlus className="h-3.5 w-3.5" />
                            }
                            {joining ? "Bergabung..." : "Gabung"}
                          </Button>
                        )
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 rounded-xl h-9 text-xs font-medium gap-1.5 opacity-70 cursor-default"
                          disabled
                        >
                          <Lock className="h-3.5 w-3.5" />
                          Read Only
                        </Button>
                      )}
                    </div>

                    {/* Success notice — langsung bisa upload */}
                    {joined && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        <p className="text-xs text-emerald-700 leading-snug">
                          Berhasil bergabung! Anda bisa langsung upload foto.
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!isLoading && pagination.total_pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl"
              disabled={pagination.page <= 1 || isLoadingMore}
              onClick={() => fetchEvents(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>

            <span className="text-sm text-muted-foreground px-2">
              Halaman{" "}
              <span className="font-semibold text-foreground">{pagination.page}</span>
              {" "}dari{" "}
              <span className="font-semibold text-foreground">{pagination.total_pages}</span>
            </span>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl"
              disabled={pagination.page >= pagination.total_pages || isLoadingMore}
              onClick={() => fetchEvents(pagination.page + 1)}
            >
              {isLoadingMore
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <><span>Selanjutnya</span><ChevronRight className="h-4 w-4" /></>
              }
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}