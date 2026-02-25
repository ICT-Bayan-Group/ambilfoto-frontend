import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Download,
  Search,
  Filter,
  Grid3x3,
  List,
  Camera,
  Eye,
  Heart,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Loader2,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/api/ai.service";
import { userService, UserPhoto } from "@/services/api/user.service";
import { paymentService } from "@/services/api/payment.service";
import { PhotoCard } from "@/components/PhotoCard";
import { PhotoListItem } from "@/components/PhotoListItem";
import { PhotoDetailModal } from "@/components/PhotoDetailModal";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { PhotoPurchaseModal } from "@/components/PhotoPurchaseModal";
import { toast as sonnerToast } from "sonner";
import { buyerEscrowService } from "@/services/api/buyer.escrow.service";

type TabType = "temuan" | "favorite" | "koleksi";

// ─── Auto-match banner ────────────────────────────────────────────────────────

type MatchState = "idle" | "loading" | "done" | "empty";

const AutoMatchBanner = ({
  state,
  count,
  source,
}: {
  state: MatchState;
  count: number;
  source: string;
}) => {
  if (state === "idle") return null;

  if (state === "loading") {
    return (
      <div className="mb-5 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 px-5 py-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
        </div>
        <div>
          <p className="font-semibold text-blue-800 text-sm">
            {source === "register"
              ? "Mencari semua foto Anda dari event yang tersedia..."
              : "Memuat foto-foto Anda..."}
          </p>
          <p className="text-xs text-blue-600 mt-0.5">
            Teknologi AI kami sedang mencocokkan wajah Anda
          </p>
        </div>
      </div>
    );
  }

  if (state === "done" && count > 0) {
    return (
      <div className="mb-5 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-emerald-800 text-sm">
            Ditemukan {count} foto yang cocok dengan wajah Anda! 🎉
          </p>
          <p className="text-xs text-emerald-600 mt-0.5">
            Foto-foto ini diambil dari semua event yang ada di platform
          </p>
        </div>
        <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
      </div>
    );
  }

  if (state === "empty" || (state === "done" && count === 0)) {
    return (
      <div className="mb-5 rounded-2xl border-2 border-amber-200 bg-amber-50 px-5 py-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Camera className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-amber-800 text-sm">
            Belum ada foto yang cocok ditemukan
          </p>
          <p className="text-xs text-amber-600 mt-0.5">
            Foto Anda akan muncul di sini saat fotografer mengunggah foto dari event yang Anda hadiri
          </p>
        </div>
      </div>
    );
  }

  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const PhotoGallery = () => {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [favoritePhotos, setFavoritePhotos] = useState<UserPhoto[]>([]);
  const [purchasedPhotos, setPurchasedPhotos] = useState<UserPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [isLoadingPurchased, setIsLoadingPurchased] = useState(false);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("temuan");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState<UserPhoto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [photoToPurchase, setPhotoToPurchase] = useState<UserPhoto | null>(null);
  const [userPointBalance, setUserPointBalance] = useState(0);

  // ── Auto-match state ──
  const [matchState, setMatchState] = useState<MatchState>("idle");
  const [matchSource, setMatchSource] = useState<string>("");

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Detect auto-match flag on mount ──
  useEffect(() => {
    const shouldAutoMatch =
      sessionStorage.getItem("auto_match_photos") === "true" ||
      (location.state as any)?.autoMatch === true;

    const source = sessionStorage.getItem("auto_match_source") || "manual";

    if (shouldAutoMatch) {
      // Clear flag immediately so it doesn't retrigger on refresh
      sessionStorage.removeItem("auto_match_photos");
      sessionStorage.removeItem("auto_match_source");

      setMatchSource(source);
      setMatchState("loading");
      loadPhotosWithMatchFeedback();
    } else {
      loadData();
    }
  }, []);

  // ── Load with match feedback (for auto-match flow) ──
  const loadPhotosWithMatchFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getMyPhotos();

      if (response.success && response.data) {
        const unmatched = response.data.filter((p) => !p.is_purchased);
        setPhotos(response.data);
        setError("");
        setMatchState(unmatched.length > 0 ? "done" : "empty");
      } else {
        setPhotos([]);
        setMatchState("empty");
      }
    } catch (err) {
      console.error("Error loading photos:", err);
      setError("Gagal memuat foto");
      setPhotos([]);
      setMatchState("empty");
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await loadPhotos();
    setIsLoading(false);
  };

  const loadPhotos = async () => {
    try {
      const response = await userService.getMyPhotos();

      if (response.success && response.data) {
        setPhotos(response.data);
        setError("");
      } else {
        setPhotos([]);
        setError("Foto tidak ditemukan. Coba pindai wajah Anda terlebih dahulu.");
      }
    } catch (err) {
      console.error("Error loading photos:", err);
      setError("Gagal memuat foto");
      setPhotos([]);
    }
  };

  const loadFavoritePhotos = async () => {
    try {
      setIsLoadingFavorites(true);
      const response = await userService.getFavoritePhotos();

      if (response.success && response.data) {
        setFavoritePhotos(response.data);
      } else {
        setFavoritePhotos([]);
      }
    } catch (err) {
      console.error("Error loading favorite photos:", err);
      setFavoritePhotos([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const loadPurchasedPhotos = async () => {
    try {
      setIsLoadingPurchased(true);
      const response = await userService.getPurchasedPhotos();

      if (response.success && response.data) {
        setPurchasedPhotos(response.data);
      } else {
        setPurchasedPhotos([]);
      }
    } catch (err) {
      console.error("Error loading purchased photos:", err);
      setPurchasedPhotos([]);
    } finally {
      setIsLoadingPurchased(false);
    }
  };

  useEffect(() => {
    if (activeTab === "favorite" && favoritePhotos.length === 0) {
      loadFavoritePhotos();
    } else if (activeTab === "koleksi" && purchasedPhotos.length === 0) {
      loadPurchasedPhotos();
    }
  }, [activeTab]);

  // ── Derived data ──
  const currentPhotos = useMemo(() => {
    switch (activeTab) {
      case "temuan":
        return photos.filter((p) => !p.is_purchased);
      case "favorite":
        return favoritePhotos;
      case "koleksi":
        return purchasedPhotos;
      default:
        return photos;
    }
  }, [activeTab, photos, favoritePhotos, purchasedPhotos]);

  const events = useMemo(() => {
    const uniqueEvents = new Set<string>();
    currentPhotos.forEach((photo) => {
      if (photo.event_name) uniqueEvents.add(photo.event_name);
    });
    return [
      { value: "all", label: "Semua Acara" },
      ...Array.from(uniqueEvents).map((event) => ({
        value: event.toLowerCase().replace(/\s+/g, "-"),
        label: event,
      })),
    ];
  }, [currentPhotos]);

  const filteredPhotos = useMemo(() => {
    let result = [...currentPhotos];

    if (selectedEvent !== "all") {
      result = result.filter(
        (photo) =>
          photo.event_name?.toLowerCase().replace(/\s+/g, "-") === selectedEvent
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (photo) =>
          photo.event_name?.toLowerCase().includes(query) ||
          photo.event_location?.toLowerCase().includes(query) ||
          photo.filename?.toLowerCase().includes(query) ||
          photo.photographer_name?.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.event_date || 0).getTime() -
            new Date(a.event_date || 0).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.event_date || 0).getTime() -
            new Date(b.event_date || 0).getTime()
        );
        break;
      case "match":
        result.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
        break;
      case "event":
        result.sort((a, b) =>
          (a.event_name || "").localeCompare(b.event_name || "")
        );
        break;
    }

    return result;
  }, [currentPhotos, selectedEvent, searchQuery, sortBy]);

  // ── Handlers ──
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedEvent("all");
    setSearchQuery("");
  };

  const handleToggleFavorite = async (photo: UserPhoto) => {
    try {
      const photoId = photo.event_photo_id || photo.photo_id;
      if (!photoId) {
        sonnerToast.error("ID foto tidak valid");
        return;
      }

      if (photo.is_favorited) {
        await userService.removeFromFavorites(photoId);
        setPhotos((prev) =>
          prev.map((p) =>
            p.event_photo_id === photoId || p.photo_id === photoId
              ? { ...p, is_favorited: false }
              : p
          )
        );
        setFavoritePhotos((prev) =>
          prev.filter(
            (p) => p.event_photo_id !== photoId && p.photo_id !== photoId
          )
        );
        sonnerToast.success("Foto dihapus dari favorit");
      } else {
        await userService.addToFavorites(photoId);
        setPhotos((prev) =>
          prev.map((p) =>
            p.event_photo_id === photoId || p.photo_id === photoId
              ? { ...p, is_favorited: true }
              : p
          )
        );
        sonnerToast.success("Foto ditambahkan ke favorit");
        if (activeTab === "favorite") loadFavoritePhotos();
      }
    } catch (err) {
      sonnerToast.error("Gagal mengubah status favorit");
    }
  };

  const handleDownloadPhoto = async (photoId: string) => {
    try {
      const photo = [...photos, ...favoritePhotos, ...purchasedPhotos].find(
        (p) => p.event_photo_id === photoId || p.photo_id === photoId
      );

      if (!photo) {
        toast({ title: "Error", description: "Foto tidak ditemukan", variant: "destructive" });
        return;
      }

      const cta =
        photo.cta ||
        (photo.is_purchased
          ? "DOWNLOAD"
          : photo.is_for_sale === false
          ? "FREE_DOWNLOAD"
          : "BUY");

      if (cta === "BUY") {
        toast({
          title: "Foto belum dibeli",
          description: "Silakan beli foto terlebih dahulu untuk mengunduh.",
          variant: "destructive",
        });
        handleBuyPhoto(photo);
        return;
      }

      setDownloadingIds((prev) => new Set(prev).add(photoId));

      const filename = photo.filename || `foto-${photoId}.jpg`;

      try {
        const blob = await userService.downloadPhotoBlob(photo.event_photo_id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast({ title: "Download berhasil! 🎉", description: `${filename} telah diunduh` });
      } catch (downloadErr: any) {
        if (downloadErr.response?.status === 403) {
          toast({
            title: "Foto belum dibeli",
            description: downloadErr.response?.data?.error || "Silakan beli foto terlebih dahulu.",
            variant: "destructive",
          });
          handleBuyPhoto(photo);
          return;
        }
        const downloadUrl =
          photo.download_url ||
          photo.preview_url ||
          aiService.getDownloadUrl(photo.photo_id);
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error("Download gagal");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast({ title: "Download berhasil! 🎉", description: `${filename} telah diunduh` });
      }
    } catch (err) {
      toast({ title: "Download gagal", description: "Gagal mengunduh foto.", variant: "destructive" });
    } finally {
      setDownloadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(photoId);
        return newSet;
      });
    }
  };

  const handleDownloadAll = async () => {
    toast({ title: "Mempersiapkan unduhan", description: `Mengunduh ${filteredPhotos.length} foto...` });
    for (const photo of filteredPhotos) {
      await handleDownloadPhoto(photo.photo_id);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  const handlePhotoClick = (photo: UserPhoto) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  const handleViewFullscreen = () => {
    setIsModalOpen(false);
    setIsLightboxOpen(true);
  };

  const handleBuyPhoto = (photo: UserPhoto) => {
    setPhotoToPurchase(photo);
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSuccess = async (downloadUrl?: string) => {
    if (photoToPurchase) {
      setPhotos((prev) =>
        prev.map((p) =>
          p.event_photo_id === photoToPurchase.event_photo_id
            ? { ...p, is_purchased: true, cta: "DOWNLOAD" as const, download_url: downloadUrl }
            : p
        )
      );
      setFavoritePhotos((prev) =>
        prev.map((p) =>
          p.event_photo_id === photoToPurchase.event_photo_id
            ? { ...p, is_purchased: true, cta: "DOWNLOAD" as const, download_url: downloadUrl }
            : p
        )
      );

      try {
        const escrowResponse = await buyerEscrowService.getMyPurchases();
        if (escrowResponse.success && escrowResponse.data) {
          const purchasesWithEscrow: UserPhoto[] = escrowResponse.data.map((purchase) => {
            const canDownload = purchase.escrow.can_download;
            return {
              photo_id: purchase.photo.id,
              event_photo_id: purchase.photo.id,
              filename: purchase.photo.filename,
              event_id: purchase.transaction_id,
              event_name: purchase.photo.event_name,
              event_date: purchase.purchased_at,
              event_location: null,
              preview_url: purchase.photo.preview_url || "",
              download_url: purchase.photo.download_url || "",
              thumbnail_url: purchase.photo.preview_url || "",
              is_purchased: true,
              is_favorited: false,
              is_for_sale: false,
              price: purchase.payment.amount,
              price_cash: purchase.payment.amount,
              price_points: null,
              price_in_points: null,
              cta: canDownload ? "DOWNLOAD" : "VIEW",
              photographer_name: purchase.photographer.name,
              photographer_id: purchase.photographer.id,
              escrow_status: purchase.escrow.status,
              escrow_transaction_id: purchase.transaction_id,
              escrow_can_confirm: purchase.escrow.can_confirm,
              escrow_can_download: purchase.escrow.can_download,
              escrow_deadline: purchase.escrow.deadline,
              escrow_hours_remaining: purchase.escrow.hours_remaining,
              escrow_revision_count: purchase.escrow.revision_count,
              escrow_max_revisions: purchase.escrow.max_revisions,
              escrow_status_message: purchase.escrow.status_message,
              delivery_version: purchase.delivery?.version || null,
              delivery_uploaded_at: purchase.delivery?.uploaded_at || null,
              similarity: null,
              uploaded_at: purchase.purchased_at,
            } as UserPhoto;
          });
          setPurchasedPhotos(purchasesWithEscrow);
        } else {
          loadPurchasedPhotos();
        }
      } catch {
        loadPurchasedPhotos();
      }
    }

    setIsPurchaseModalOpen(false);
    setPhotoToPurchase(null);
    sonnerToast.success("Foto berhasil dibeli! Anda sekarang bisa mengunduh foto ini.");
  };

  const handleNext = () => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(
      (p) => p.photo_id === selectedPhoto.photo_id
    );
    if (currentIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(
      (p) => p.photo_id === selectedPhoto.photo_id
    );
    if (currentIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentIndex - 1]);
    }
  };

  const selectedPhotoIndex = selectedPhoto
    ? filteredPhotos.findIndex(
        (p) => p.event_photo_id === selectedPhoto.event_photo_id
      )
    : -1;

  // Tab config
  const tabs = [
    {
      id: "temuan" as TabType,
      label: "Temuan",
      icon: Eye,
      count: photos.filter((p) => !p.is_purchased).length,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500",
    },
    {
      id: "favorite" as TabType,
      label: "Favorit",
      icon: Heart,
      count: favoritePhotos.length,
      color: "from-pink-500 to-red-500",
      bgColor: "bg-pink-500",
    },
    {
      id: "koleksi" as TabType,
      label: "Koleksi",
      icon: ShoppingBag,
      count: purchasedPhotos.length,
      color: "from-lime-400 to-green-500",
      bgColor: "bg-lime-400",
    },
  ];

  const currentTabLoading =
    (activeTab === "favorite" && isLoadingFavorites) ||
    (activeTab === "koleksi" && isLoadingPurchased);

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-7xl">
            {/* Loading banner for auto-match flow */}
            {matchState === "loading" && (
              <AutoMatchBanner state="loading" count={0} source={matchSource} />
            )}
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-12 w-full mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3">
                    <Skeleton className="h-8 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Empty state ──
  if (
    !isLoading &&
    photos.length === 0 &&
    favoritePhotos.length === 0 &&
    purchasedPhotos.length === 0
  ) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-7xl">
            <Link
              to="/user/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Link>

            {/* Auto-match empty result banner */}
            {(matchState === "done" || matchState === "empty") && (
              <AutoMatchBanner state="empty" count={0} source={matchSource} />
            )}

            <Card className="border-2 border-blue-200 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <Camera className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent">
                  {matchState === "empty"
                    ? "Belum Ada Foto Ditemukan"
                    : "Mulai Petualangan Foto Anda"}
                </h2>
                <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                  {matchState === "empty"
                    ? "Foto Anda akan otomatis muncul di sini ketika fotografer mengunggah dari event yang Anda hadiri."
                    : error || "Temukan foto-foto Anda dengan teknologi pengenalan wajah AI."}
                </p>
                <Button
                  onClick={() => navigate("/user/scan-face")}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-yellow-600 hover:from-blue-700 hover:to-yellow-700 shadow-lg"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Pindai Wajah Sekarang
                </Button>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main render ──
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <main className="flex-1 py-6">
        <div className="container max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <Link
              to="/user/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3 transition-all group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Dashboard
            </Link>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black mb-1 bg-blue-900 bg-clip-text text-transparent">
                  Ambil Foto{" "}
                  {activeTab === "temuan"
                    ? "Temuan"
                    : activeTab === "favorite"
                    ? "Favorit"
                    : "Koleksi"}
                </h1>
                <p className="text-muted-foreground">
                  {filteredPhotos.length === 0
                    ? "Tidak ada foto di tab ini"
                    : `${filteredPhotos.length} foto ditemukan`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link to="/user/scan-face">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 hover:border-blue-400 hover:bg-blue-50 rounded-xl"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Pindai Lagi
                  </Button>
                </Link>
                {filteredPhotos.length > 0 && activeTab === "koleksi" && (
                  <Button
                    onClick={handleDownloadAll}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 rounded-xl shadow-lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download ({filteredPhotos.length})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Auto-match result banner */}
          {activeTab === "temuan" && (
            <AutoMatchBanner
              state={matchState}
              count={photos.filter((p) => !p.is_purchased).length}
              source={matchSource}
            />
          )}

          {/* Tabs */}
          <div className="mb-5">
            <div className="inline-flex gap-1.5 p-1.5 bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative group transition-all duration-200 ${
                      isActive ? "" : "hover:scale-[1.02]"
                    }`}
                  >
                    <div
                      className={`relative px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-br ${tab.color} shadow-md`
                          : "bg-transparent hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1 rounded-lg ${
                            isActive ? "bg-white/20" : "bg-gray-100"
                          } transition-all`}
                        >
                          <Icon
                            className={`h-3.5 w-3.5 ${
                              isActive ? "text-white" : "text-gray-600"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-sm font-bold whitespace-nowrap ${
                            isActive ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {tab.label}
                        </span>
                        <div
                          className={`px-2 py-0.5 rounded-full text-xs font-bold min-w-[24px] text-center ${
                            isActive
                              ? "bg-white/30 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {tab.count}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter & Controls */}
          {filteredPhotos.length > 0 && (
            <Card className="mb-5 border-2 border-gray-100 shadow-md bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden">
              <div className="p-3">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari foto..."
                      className="pl-9 border-2 focus:border-blue-400 rounded-xl bg-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger className="w-full md:w-[180px] border-2 rounded-xl bg-white">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Acara" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.value} value={event.value}>
                          {event.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[160px] border-2 rounded-xl bg-white">
                      <SelectValue placeholder="Urutkan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Terbaru</SelectItem>
                      <SelectItem value="oldest">Terlama</SelectItem>
                      {activeTab === "temuan" && (
                        <SelectItem value="match">Kecocokan Terbaik</SelectItem>
                      )}
                      <SelectItem value="event">Acara</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-1 border-2 border-gray-200 rounded-xl p-1 bg-white">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Photo Grid/List */}
          {currentTabLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-2 rounded-2xl">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3">
                    <Skeleton className="h-8 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredPhotos.length === 0 ? (
            <Card className="border-2 border-gray-200 shadow-xl p-12 text-center bg-white/80 backdrop-blur-sm rounded-2xl">
              {activeTab === "temuan" && (
                <>
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-yellow-400 rounded-full animate-pulse" />
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-blue-500" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-2 bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent">
                    Semua Foto Sudah Dibeli!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Luar biasa! Coba pindai wajah lagi untuk menemukan foto baru.
                  </p>
                </>
              )}
              {activeTab === "favorite" && (
                <>
                  <Heart className="h-16 w-16 text-pink-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-black mb-2">Belum Ada Foto Favorit</h3>
                  <p className="text-muted-foreground mb-6">
                    Tandai foto favorit dengan tekan tombol hati ❤️
                  </p>
                </>
              )}
              {activeTab === "koleksi" && (
                <>
                  <ShoppingBag className="h-16 w-16 text-lime-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-black mb-2">Koleksi Masih Kosong</h3>
                  <p className="text-muted-foreground mb-6">
                    Mulai beli foto favorit untuk membangun koleksi! 🛍️
                  </p>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedEvent("all");
                  setSearchQuery("");
                  if (activeTab !== "temuan") handleTabChange("temuan");
                }}
                className="border-2 rounded-xl"
              >
                {activeTab === "temuan" ? "Hapus Filter" : "Lihat Temuan"}
              </Button>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredPhotos.map((photo) => (
                <PhotoCard
                  key={photo.photo_id}
                  photo={photo}
                  onDownload={handleDownloadPhoto}
                  onBuy={() => handleBuyPhoto(photo)}
                  onToggleFavorite={() => handleToggleFavorite(photo)}
                  isDownloading={downloadingIds.has(photo.photo_id)}
                  onClick={() => handlePhotoClick(photo)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPhotos.map((photo) => (
                <PhotoListItem
                  key={photo.photo_id}
                  photo={photo}
                  onDownload={handleDownloadPhoto}
                  onBuy={() => handleBuyPhoto(photo)}
                  onToggleFavorite={() => handleToggleFavorite(photo)}
                  isDownloading={downloadingIds.has(photo.photo_id)}
                  onClick={() => handlePhotoClick(photo)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <PhotoDetailModal
        photo={selectedPhoto as any}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onDownload={() =>
          selectedPhoto && handleDownloadPhoto(selectedPhoto.event_photo_id)
        }
        onBuy={() => selectedPhoto && handleBuyPhoto(selectedPhoto)}
        onToggleFavorite={() =>
          selectedPhoto && handleToggleFavorite(selectedPhoto)
        }
        onView={handleViewFullscreen}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isDownloading={
          selectedPhoto
            ? downloadingIds.has(selectedPhoto.event_photo_id)
            : false
        }
        hasNext={selectedPhotoIndex < filteredPhotos.length - 1}
        hasPrevious={selectedPhotoIndex > 0}
      />

      <PhotoLightbox
        photo={selectedPhoto as any}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onDownload={() =>
          selectedPhoto && handleDownloadPhoto(selectedPhoto.event_photo_id)
        }
        onNext={handleNext}
        onPrevious={handlePrevious}
        isDownloading={
          selectedPhoto
            ? downloadingIds.has(selectedPhoto.event_photo_id)
            : false
        }
        hasNext={selectedPhotoIndex < filteredPhotos.length - 1}
        hasPrevious={selectedPhotoIndex > 0}
      />

      {photoToPurchase && (
        <PhotoPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => {
            setIsPurchaseModalOpen(false);
            setPhotoToPurchase(null);
          }}
          photo={{
            id: photoToPurchase.event_photo_id,
            filename: photoToPurchase.filename || "Foto",
            event_name: photoToPurchase.event_name || "Acara",
            price_cash:
              photoToPurchase.price_cash || photoToPurchase.price || 30000,
            price_points:
              photoToPurchase.price_points ||
              photoToPurchase.price_in_points ||
              6,
          }}
          userPointBalance={userPointBalance}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
};

export default PhotoGallery;