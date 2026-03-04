import { useState, useEffect, useRef, useCallback } from "react";
import { userService, UserPhoto } from "@/services/api/user.service";

export type MatchState = "idle" | "searching" | "found" | "empty";

interface UseMyPhotosReturn {
  photos: UserPhoto[];
  loading: boolean;
  reloading: boolean;
  matchState: MatchState;
  newPhotosCount: number;
  showNewBanner: boolean;
  reloadPhotos: () => Promise<void>;
  dismissBanner: () => void;
}

const normalisePhoto = (photo: UserPhoto): UserPhoto => ({
  ...photo,
  event_photo_id: photo.event_photo_id || photo.photo_id,
  photo_id: photo.photo_id || photo.event_photo_id,
  type: photo.type || "event",
});

export function useMyPhotos(autoRefresh = false): UseMyPhotosReturn {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [matchState, setMatchState] = useState<MatchState>("idle");
  const [newPhotosCount, setNewPhotosCount] = useState(0);
  const [showNewBanner, setShowNewBanner] = useState(false);

  const prevCountRef = useRef(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const pollCountRef = useRef(0);
  const MAX_POLLS = 12;

  // ── Gabungkan event + standalone ──────────────────────────────
  const fetchAllPhotos = useCallback(async (): Promise<UserPhoto[]> => {
    const [eventRes, standaloneRes] = await Promise.all([
      userService.getMyPhotos({ limit: 100 }),
      userService.getMyStandalonePhotos({ limit: 100 }),
    ]);

    const eventPhotos: UserPhoto[] =
      eventRes.success && eventRes.data
        ? eventRes.data.map(normalisePhoto)
        : [];

    const standalonePhotos: UserPhoto[] =
      standaloneRes.success && standaloneRes.data
        ? standaloneRes.data.map(normalisePhoto)
        : [];

    return [...eventPhotos, ...standalonePhotos];
  }, []);

  // ── Step 1: Ambil cache dari DB (instant) ─────────────────────
  const loadCached = useCallback(async () => {
    try {
      const merged = await fetchAllPhotos();
      if (!isMountedRef.current) return;

      setPhotos(merged);
      prevCountRef.current = merged.length;
      setMatchState(merged.length > 0 ? "found" : "searching");
    } catch {
      if (isMountedRef.current) setMatchState("empty");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [fetchAllPhotos]);

  // ── Step 2: Trigger AI background match (fire & forget) ───────
  const triggerBackgroundMatch = useCallback(() => {
    // Tidak di-await — backend proses di background thread Python
    // Backend endpoint: GET /api/user/my-photos?refresh=true
    userService.getMyPhotos({ limit: 1 } as any).catch(() => {});

    // Alternatif kalau backend support query param refresh:
    // fetch(`${API_URL}/user/my-photos?refresh=true`, { headers: { Authorization: `Bearer ${token}` } })
    //   .catch(() => {});
  }, []);

  // ── Step 3: Polling — cek total foto di DB ────────────────────
  const checkForNewPhotos = useCallback(async () => {
    try {
      // Cukup ambil limit=1 untuk dapat pagination.total
      const res = await userService.getMyPhotos({ page: 1, limit: 1 });
      if (!isMountedRef.current) return;

      const currentCount =
        (res.pagination?.total ?? 0) +
        // Hitung standalone juga (optional, kalau mau akurat)
        0;

      if (currentCount > prevCountRef.current) {
        const diff = currentCount - prevCountRef.current;
        setNewPhotosCount(diff);
        setShowNewBanner(true);
        // Stop polling — sudah ada foto baru
        if (pollingRef.current) clearInterval(pollingRef.current);
      }

      pollCountRef.current += 1;
      if (pollCountRef.current >= MAX_POLLS) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        // Kalau setelah 60 detik tidak ada match baru
        if (prevCountRef.current === 0) setMatchState("empty");
      }
    } catch {
      // Abaikan error polling
    }
  }, []);

  // ── Step 4: User klik banner → reload daftar ─────────────────
  const reloadPhotos = useCallback(async () => {
    if (!isMountedRef.current) return;
    setReloading(true);
    setShowNewBanner(false);
    setNewPhotosCount(0);

    try {
      const merged = await fetchAllPhotos();
      if (!isMountedRef.current) return;
      setPhotos(merged);
      prevCountRef.current = merged.length;
      setMatchState(merged.length > 0 ? "found" : "empty");
    } catch {
      // Biarkan foto lama tetap tampil
    } finally {
      if (isMountedRef.current) setReloading(false);
    }
  }, [fetchAllPhotos]);

  const dismissBanner = useCallback(() => {
    setShowNewBanner(false);
  }, []);

  // ── Mount ─────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    pollCountRef.current = 0;

    // Step 1: Langsung tampilkan cache
    loadCached();

    // Step 2: Trigger AI matching di background (kalau diminta)
    if (autoRefresh) {
      triggerBackgroundMatch();

      // Step 3: Mulai polling setelah 5 detik (beri waktu AI server proses)
      const startPollingAfter = setTimeout(() => {
        if (!isMountedRef.current) return;
        pollingRef.current = setInterval(checkForNewPhotos, 5000);
      }, 5000);

      return () => {
        isMountedRef.current = false;
        clearTimeout(startPollingAfter);
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }

    return () => {
      isMountedRef.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return {
    photos,
    loading,
    reloading,
    matchState,
    newPhotosCount,
    showNewBanner,
    reloadPhotos,
    dismissBanner,
  };
}