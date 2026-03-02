import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { photographerService } from "@/services/api/photographer.service";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Calendar, Loader2, MapPin, Locate, Users,
  ImageIcon, Info, Globe, Lock, Sparkles, Camera,
  ChevronRight, CheckCircle, Map as MapIcon, X,
} from "lucide-react";

// Leaflet loaded from CDN
declare global {
  interface Window { L: any; }
}

type Step = 1 | 2 | 3;

const STEPS = [
  { num: 1 as Step, label: "Info Dasar",   icon: Calendar },
  { num: 2 as Step, label: "Lokasi & Peta", icon: MapPin },
  { num: 3 as Step, label: "Pengaturan",   icon: Users },
];

const EVENT_TYPES = [
  { value: "wedding",    label: "💍 Wedding" },
  { value: "birthday",   label: "🎂 Ulang Tahun" },
  { value: "corporate",  label: "🏢 Korporat" },
  { value: "graduation", label: "🎓 Wisuda" },
  { value: "concert",    label: "🎵 Konser" },
  { value: "sports",     label: "⚽ Olahraga" },
  { value: "other",      label: "✨ Lainnya" },
];

const CreateEvent = () => {
  const navigate  = useNavigate();
  const { toast } = useToast();
  const mapRef    = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markerRef  = useRef<any>(null);

  const [step,       setStep]       = useState<Step>(1);
  const [isLoading,  setIsLoading]  = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapReady,   setMapReady]   = useState(false);

  const [form, setForm] = useState({
    event_name:        "",
    event_type:        "",
    event_date:        "",
    location:          "",
    description:       "",
    is_public:         true,
    access_code:       "",
    watermark_enabled: true,
    is_collaborative:  true,         // default ON — platform kolaboratif
    max_collaborators: null as number | null,
    event_latitude:    null as number | null,
    event_longitude:   null as number | null,
  });

  const set = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // ── Load Leaflet dari CDN ───────────────────────────────────────────────────
  useEffect(() => {
    if (window.L) { setMapReady(true); return; }
    if (document.getElementById("leaflet-css")) return;

    const css = document.createElement("link");
    css.id    = "leaflet-css";
    css.rel   = "stylesheet";
    css.href  = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(css);

    const script    = document.createElement("script");
    script.src      = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload   = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  // ── Init peta saat masuk step 2 ────────────────────────────────────────────
  useEffect(() => {
    if (step !== 2 || !mapReady || !mapRef.current || leafletMap.current) return;

    const L   = window.L;
    const lat = form.event_latitude  ?? -2.5489;
    const lng = form.event_longitude ?? 118.0149;
    const zoom = form.event_latitude ? 14 : 5;

    const map = L.map(mapRef.current, { center: [lat, lng], zoom, zoomControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const makeIcon = () => L.divIcon({
      html: `<div style="
        width:36px;height:36px;
        background:linear-gradient(135deg,#3b82f6,#1d4ed8);
        border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        border:3px solid white;box-shadow:0 4px 15px rgba(59,130,246,0.5);
        display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(45deg);font-size:14px;">📸</span>
      </div>`,
      className: "", iconSize: [36, 36], iconAnchor: [18, 36],
    });

    const addMarker = (lt: number, ln: number) => {
      if (markerRef.current) markerRef.current.setLatLng([lt, ln]);
      else {
        markerRef.current = L.marker([lt, ln], { icon: makeIcon(), draggable: true }).addTo(map);
        markerRef.current.on("dragend", (e: any) => {
          const p = e.target.getLatLng();
          set("event_latitude",  parseFloat(p.lat.toFixed(6)));
          set("event_longitude", parseFloat(p.lng.toFixed(6)));
        });
      }
    };

    if (form.event_latitude && form.event_longitude)
      addMarker(form.event_latitude, form.event_longitude);

    map.on("click", (e: any) => {
      const { lat: lt, lng: ln } = e.latlng;
      set("event_latitude",  parseFloat(lt.toFixed(6)));
      set("event_longitude", parseFloat(ln.toFixed(6)));
      addMarker(lt, ln);
    });

    leafletMap.current = map;
    setTimeout(() => map.invalidateSize(), 300);
  }, [step, mapReady]);

  // ── Hapus map saat unmount ─────────────────────────────────────────────────
  useEffect(() => () => {
    if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; markerRef.current = null; }
  }, []);

  // ── GPS deteksi otomatis ───────────────────────────────────────────────────
  const handleGPS = () => {
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocation tidak didukung", variant: "destructive" });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lt = parseFloat(pos.coords.latitude.toFixed(6));
        const ln = parseFloat(pos.coords.longitude.toFixed(6));
        set("event_latitude", lt);
        set("event_longitude", ln);

        if (leafletMap.current) {
          leafletMap.current.setView([lt, ln], 15, { animate: true });
          if (markerRef.current) markerRef.current.setLatLng([lt, ln]);
          else {
            const L = window.L;
            markerRef.current = L.marker([lt, ln], {
              icon: L.divIcon({
                html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 15px rgba(59,130,246,.5);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:14px;">📸</span></div>`,
                className: "", iconSize: [36, 36], iconAnchor: [18, 36],
              }),
              draggable: true,
            }).addTo(leafletMap.current);
            markerRef.current.on("dragend", (e: any) => {
              const p = e.target.getLatLng();
              set("event_latitude",  parseFloat(p.lat.toFixed(6)));
              set("event_longitude", parseFloat(p.lng.toFixed(6)));
            });
          }
        }
        toast({ title: "📍 Lokasi terdeteksi!", description: `${lt.toFixed(4)}, ${ln.toFixed(4)}` });
        setIsLocating(false);
      },
      () => {
        toast({ title: "Gagal mendapatkan lokasi", variant: "destructive" });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const clearLocation = () => {
    set("event_latitude", null);
    set("event_longitude", null);
    if (markerRef.current && leafletMap.current) {
      leafletMap.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  };

  const canProceed = () => {
    if (step === 1) return form.event_name.trim() !== "" && form.event_date !== "";
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.event_name || !form.event_date) return;
    setIsLoading(true);
    try {
      const res = await photographerService.createEvent({
        event_name:        form.event_name,
        event_type:        form.event_type || undefined,
        event_date:        form.event_date,
        location:          form.location   || undefined,
        description:       form.description || undefined,
        is_public:         form.is_public,
        access_code:       form.access_code || undefined,
        watermark_enabled: form.watermark_enabled,
        price_per_photo:   0,
        is_collaborative:  form.is_collaborative,
        max_collaborators: form.max_collaborators || null,
        event_latitude:    form.event_latitude,
        event_longitude:   form.event_longitude,
      });

      if (res.success && res.data) {
        toast({
          title: "🎉 Event Berhasil Dibuat!",
          description: form.is_collaborative
            ? "Event kolaboratif siap — fotografer lain bisa langsung bergabung."
            : "Event berhasil dibuat.",
        });
        navigate(`/photographer/events/${res.data.event_id}`);
      } else {
        throw new Error(res.error || "Gagal membuat event");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">

        {/* Back */}
        <Button variant="ghost" onClick={() => navigate("/photographer/events")} className="mb-6 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />Kembali ke Events
        </Button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            Buat Event Baru
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Platform kolaboratif murni — setiap fotografer menentukan harga fotonya sendiri.
          </p>
        </div>

        {/* ── Step Indicator ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => {
            const Icon     = s.icon;
            const isDone   = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="flex items-center flex-1">
                <button
                  onClick={() => isDone && setStep(s.num)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium flex-shrink-0 ${
                    isCurrent ? "bg-primary text-primary-foreground shadow-sm"
                    : isDone  ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                    :            "bg-muted text-muted-foreground cursor-default"
                  }`}
                >
                  {isDone ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded transition-all ${step > s.num ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ────────────────────── STEP 1 ────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="event_name" className="text-sm font-semibold">
                Nama Event <span className="text-destructive">*</span>
              </Label>
              <Input
                id="event_name" autoFocus
                placeholder="cth: Pernikahan Budi & Ani, Wisuda FEB 2025..."
                value={form.event_name}
                onChange={e => set("event_name", e.target.value)}
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Tipe Event</Label>
                <Select value={form.event_type} onValueChange={v => set("event_type", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Pilih tipe" /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_date" className="text-sm font-semibold">
                  Tanggal <span className="text-destructive">*</span>
                </Label>
                <Input id="event_date" type="date" value={form.event_date}
                  onChange={e => set("event_date", e.target.value)} className="h-11" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Nama Lokasi / Venue</Label>
              <Input placeholder="cth: Grand Ballroom Hotel Indonesia, Jakarta"
                value={form.location} onChange={e => set("location", e.target.value)} className="h-11" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Deskripsi</Label>
              <Textarea placeholder="Ceritakan sedikit tentang event ini..."
                value={form.description} onChange={e => set("description", e.target.value)}
                rows={3} className="resize-none" />
            </div>

            {/* Info kolaboratif */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="p-1.5 bg-blue-100 rounded-full mt-0.5 flex-shrink-0">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800">Platform Kolaboratif Murni</p>
                <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                  Setiap fotografer yang bergabung mengatur harga fotonya sendiri saat upload.
                  Tidak ada harga default event — fleksibel untuk semua kontributor.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────────── STEP 2 ────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/60 border text-sm text-muted-foreground">
              <MapIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
              <span>
                <strong className="text-foreground">Klik pada peta</strong> untuk menentukan lokasi GPS event,
                atau gunakan tombol deteksi otomatis.
                Lokasi ini akan tampil di <strong className="text-foreground">FotoMap</strong>.
                Marker bisa digeser setelah dipasang.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button type="button" variant="outline" size="sm" onClick={handleGPS}
                disabled={isLocating} className="gap-1.5">
                {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
                {isLocating ? "Mendeteksi..." : "Gunakan Lokasi Saya"}
              </Button>
              {form.event_latitude && form.event_longitude && (
                <Button type="button" variant="ghost" size="sm" onClick={clearLocation}
                  className="gap-1.5 text-destructive hover:text-destructive">
                  <X className="h-4 w-4" />Hapus Lokasi
                </Button>
              )}
            </div>

            {/* Map Container */}
            <div className="rounded-2xl overflow-hidden border shadow-sm relative bg-muted">
              {!mapReady && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-muted">
                  <div className="text-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">Memuat peta...</p>
                  </div>
                </div>
              )}
              <div ref={mapRef} style={{ height: "360px", width: "100%" }} />
            </div>

            {/* Koordinat manual */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Latitude (manual)</Label>
                <Input type="number" step="0.000001" placeholder="-6.200000"
                  value={form.event_latitude ?? ""}
                  onChange={e => {
                    const v = parseFloat(e.target.value) || null;
                    set("event_latitude", v);
                    if (v && form.event_longitude && leafletMap.current)
                      leafletMap.current.setView([v, form.event_longitude], 14);
                  }}
                  className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Longitude (manual)</Label>
                <Input type="number" step="0.000001" placeholder="106.816666"
                  value={form.event_longitude ?? ""}
                  onChange={e => {
                    const v = parseFloat(e.target.value) || null;
                    set("event_longitude", v);
                    if (form.event_latitude && v && leafletMap.current)
                      leafletMap.current.setView([form.event_latitude, v], 14);
                  }}
                  className="h-9 text-sm font-mono" />
              </div>
            </div>

            {/* Status */}
            {form.event_latitude && form.event_longitude ? (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  Lokasi tersimpan — {form.event_latitude.toFixed(5)}, {form.event_longitude.toFixed(5)}
                  {" · "}event akan muncul di FotoMap
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Belum ada lokasi GPS — event tidak akan muncul di FotoMap (opsional)</span>
              </div>
            )}
          </div>
        )}

        {/* ────────────────────── STEP 3 ────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Kolaboratif */}
            <div className="space-y-3 p-4 rounded-xl border bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2 font-semibold">
                    <Users className="h-4 w-4 text-blue-600" />Event Kolaboratif
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fotografer lain bisa bergabung dan upload foto ke event ini
                  </p>
                </div>
                <Switch checked={form.is_collaborative}
                  onCheckedChange={v => { set("is_collaborative", v); if (!v) set("max_collaborators", null); }} />
              </div>

              {form.is_collaborative && (
                <div className="pt-3 border-t space-y-1.5">
                  <Label className="text-sm">Maks. Kolaborator (opsional)</Label>
                  <Input type="number" min={1} max={100}
                    placeholder="Kosongkan = tidak terbatas"
                    value={form.max_collaborators ?? ""}
                    onChange={e => set("max_collaborators", parseInt(e.target.value) || null)}
                    className="h-9" />
                  <p className="text-xs text-muted-foreground">Maks. fotografer yang bisa bergabung</p>
                </div>
              )}

              {form.is_collaborative && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <ImageIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <strong>Harga per foto</strong> ditentukan masing-masing oleh fotografer saat upload —
                    setiap kontributor bebas menentukan harganya sendiri.
                  </p>
                </div>
              )}
            </div>

            {/* Visibilitas */}
            <div className="space-y-4 p-4 rounded-xl border bg-muted/30">
              <h3 className="font-semibold text-sm">Visibilitas Event</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {form.is_public
                    ? <Globe className="h-4 w-4 text-blue-500" />
                    : <Lock  className="h-4 w-4 text-amber-500" />}
                  <div>
                    <p className="text-sm font-medium">{form.is_public ? "Event Publik" : "Event Privat"}</p>
                    <p className="text-xs text-muted-foreground">
                      {form.is_public
                        ? "Siapapun bisa menemukan dan mencari foto dari event ini"
                        : "Hanya yang punya kode akses yang bisa menemukan foto"}
                    </p>
                  </div>
                </div>
                <Switch checked={form.is_public} onCheckedChange={v => set("is_public", v)} />
              </div>
              {!form.is_public && (
                <div className="space-y-1.5">
                  <Label className="text-sm">Kode Akses</Label>
                  <Input placeholder="Masukkan kode akses..."
                    value={form.access_code} onChange={e => set("access_code", e.target.value)} className="h-9" />
                </div>
              )}
            </div>

            {/* Watermark */}
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
              <div>
                <p className="text-sm font-medium">Watermark pada Preview</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tambahkan watermark di foto preview sebelum pembelian
                </p>
              </div>
              <Switch checked={form.watermark_enabled} onCheckedChange={v => set("watermark_enabled", v)} />
            </div>

            {/* Ringkasan */}
            <div className="p-4 rounded-xl border bg-card space-y-2.5">
              <p className="text-sm font-semibold mb-3">Ringkasan Event</p>
              {[
                { label: "Nama",       value: form.event_name },
                { label: "Tanggal",    value: form.event_date || "-" },
                { label: "Venue",      value: form.location || "Tidak diisi" },
                { label: "GPS",        value: form.event_latitude && form.event_longitude
                    ? `${form.event_latitude.toFixed(4)}, ${form.event_longitude.toFixed(4)}`
                    : "Tidak ada" },
                { label: "Mode",       value: form.is_collaborative ? "Kolaboratif" : "Solo" },
                { label: "Visibilitas", value: form.is_public ? "Publik" : "Privat" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium truncate max-w-[60%] text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Navigation Buttons ──────────────────────────────────────────── */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => (s - 1) as Step)}
              className="flex-1" disabled={isLoading}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />Sebelumnya
            </Button>
          )}

          {step < 3 ? (
            <Button onClick={() => setStep(s => (s + 1) as Step)}
              disabled={!canProceed()} className="flex-1 gap-1.5">
              Selanjutnya<ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}
              disabled={isLoading || !form.event_name || !form.event_date}
              className="flex-1 gap-2">
              {isLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Membuat Event...</>
                : <><Sparkles className="h-4 w-4" />Buat Event</>
              }
            </Button>
          )}
        </div>

        {/* Skip lokasi */}
        {step === 2 && (
          <p className="text-center text-xs text-muted-foreground mt-3">
            Lokasi bersifat opsional.{" "}
            <button className="text-primary hover:underline font-medium"
              onClick={() => setStep(3)}>
              Lewati langkah ini →
            </button>
          </p>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default CreateEvent;