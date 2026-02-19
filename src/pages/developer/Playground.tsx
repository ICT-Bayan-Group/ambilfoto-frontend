import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { DeveloperLayout } from "@/components/developer/DeveloperLayout";
import { developerService, ApiKey } from "@/services/api/developer.service";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FlaskConical,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Loader2,
  Key,
  Globe,
  Code2,
  Trash2,
  Info,
  AlertTriangle,
  FileJson,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Header {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestHistory {
  id: string;
  method: string;
  url: string;
  status: number | null;
  duration: number | null;
  timestamp: Date;
  success: boolean;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  duration: number;
  size: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  POST: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  PUT: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  PATCH: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  DELETE: "text-red-400 bg-red-400/10 border-red-400/30",
};

const PRESET_ENDPOINTS = [
  {
    label: "Analyze Photo",
    method: "POST" as HttpMethod,
    path: "/photo/analyze",
    description: "Analyze a photo using AI — returns tags, labels, and metadata",
    body: '{\n  "image_url": "https://example.com/photo.jpg",\n  "options": {\n    "tags": true,\n    "faces": false,\n    "nsfw": true\n  }\n}',
    contentType: "application/json",
  },
  {
    label: "Upload Photo",
    method: "POST" as HttpMethod,
    path: "/photo/upload",
    description: "Upload a photo (consumes upload quota). Send as multipart/form-data.",
    body: '// This endpoint expects multipart/form-data.\n// Use a tool like Postman or attach a file.\n{\n  "title": "My Photo",\n  "description": "Optional description"\n}',
    contentType: "multipart/form-data",
  },
  {
    label: "Match Photos",
    method: "POST" as HttpMethod,
    path: "/photo/match",
    description: "Find visually similar photos from the database",
    body: '{\n  "image_url": "https://example.com/query.jpg",\n  "threshold": 0.8,\n  "limit": 10\n}',
    contentType: "application/json",
  },
  {
    label: "Get Usage",
    method: "GET" as HttpMethod,
    path: "/usage",
    description: "Retrieve current API usage stats for the authenticated key",
    body: "",
    contentType: "application/json",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).slice(2, 9);

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const syntaxHighlight = (json: string): string => {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "text-amber-300"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-sky-300"; // key
          } else {
            cls = "text-emerald-300"; // string
          }
        } else if (/true|false/.test(match)) {
          cls = "text-purple-300"; // boolean
        } else if (/null/.test(match)) {
          cls = "text-red-400"; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
};

// ─── Component ───────────────────────────────────────────────────────────────

const DeveloperPlayground = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // API Keys
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [keysLoading, setKeysLoading] = useState(true);

  // Request state
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [baseUrl, setBaseUrl] = useState(
    import.meta.env.VITE_API_BASE_URL
      ? `${import.meta.env.VITE_API_BASE_URL}/v1`
      : "http://localhost:5000/api/v1"
  );
  const [path, setPath] = useState("/usage");
  const [headers, setHeaders] = useState<Header[]>([
    { id: generateId(), key: "Content-Type", value: "application/json", enabled: true },
    { id: generateId(), key: "Accept", value: "application/json", enabled: true },
  ]);
  const [body, setBody] = useState("");
  const [queryParams, setQueryParams] = useState<Header[]>([
    { id: generateId(), key: "page", value: "1", enabled: false },
    { id: generateId(), key: "limit", value: "10", enabled: false },
  ]);

  // Response state
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [activeResponseTab, setActiveResponseTab] = useState("body");
  const [showHistory, setShowHistory] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const responseRef = useRef<HTMLDivElement>(null);

  // Load API keys
  useEffect(() => {
    if (!id) return;
    developerService
      .getKeys(id)
      .then((res) => {
        if (res.success) {
          setKeys(res.data);
          const activeKey = res.data.find((k) => k.is_active && k.key_type === "dev");
          if (activeKey) setSelectedKey(activeKey.id);
        }
      })
      .catch(() => toast({ title: "Failed to load API keys", variant: "destructive" }))
      .finally(() => setKeysLoading(false));
  }, [id]);

  const getActiveKeyPrefix = () => {
    const k = keys.find((k) => k.id === selectedKey);
    return k ? `${k.key_prefix}••••••••••` : null;
  };

  // Build full URL
  const buildUrl = () => {
    const activeParams = queryParams.filter((p) => p.enabled && p.key);
    const qs = activeParams.length
      ? "?" + activeParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&")
      : "";
    return `${baseUrl}${path}${qs}`;
  };

  // Send request (simulated — real implementation would use the key's actual endpoint)
  const sendRequest = async () => {
    if (!selectedKey) {
      toast({ title: "Select an API key first", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResponse(null);

    const start = performance.now();
    const url = buildUrl();

    const activeHeaders: Record<string, string> = {};
    headers
      .filter((h) => h.enabled && h.key)
      .forEach((h) => (activeHeaders[h.key] = h.value));

    // Inject API key
    const selectedKeyObj = keys.find((k) => k.id === selectedKey);
    if (selectedKeyObj) {
      activeHeaders["X-API-Key"] = `${selectedKeyObj.key_prefix}[hidden]`;
    }

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: activeHeaders,
      };
      if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
        fetchOptions.body = body;
      }

      const res = await fetch(url, fetchOptions);
      const duration = Math.round(performance.now() - start);

      let responseBody: unknown;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        responseBody = await res.json();
      } else {
        responseBody = await res.text();
      }

      const bodyStr = JSON.stringify(responseBody, null, 2);
      const size = formatBytes(new TextEncoder().encode(bodyStr).length);

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => (responseHeaders[k] = v));

      const apiResponse: ApiResponse = {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        duration,
        size,
      };

      setResponse(apiResponse);
      setActiveResponseTab("body");

      const historyEntry: RequestHistory = {
        id: generateId(),
        method,
        url,
        status: res.status,
        duration,
        timestamp: new Date(),
        success: res.ok,
      };
      setHistory((prev) => [historyEntry, ...prev].slice(0, 20));

      setTimeout(() => responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - start);
      const errorMessage = err instanceof Error ? err.message : "Network error";

      setResponse({
        status: 0,
        statusText: "Network Error",
        headers: {},
        body: { error: errorMessage },
        duration,
        size: "—",
      });

      setHistory((prev) =>
        [
          {
            id: generateId(),
            method,
            url,
            status: null,
            duration,
            timestamp: new Date(),
            success: false,
          } as RequestHistory,
          ...prev,
        ].slice(0, 20)
      );
    } finally {
      setLoading(false);
    }
  };

  const [isMultipart, setIsMultipart] = useState(false);

  const applyPreset = (preset: (typeof PRESET_ENDPOINTS)[0]) => {
    setMethod(preset.method);
    setPath(preset.path);
    setBody(preset.body ?? "");

    const isMultipartPreset = preset.contentType === "multipart/form-data";
    setIsMultipart(isMultipartPreset);

    // Update Content-Type header to match preset
    setHeaders((prev) =>
      prev.map((h) =>
        h.key === "Content-Type"
          ? { ...h, value: isMultipartPreset ? "multipart/form-data" : "application/json", enabled: true }
          : h
      )
    );
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.body, null, 2));
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const addHeader = () =>
    setHeaders((prev) => [...prev, { id: generateId(), key: "", value: "", enabled: true }]);
  const removeHeader = (hid: string) => setHeaders((prev) => prev.filter((h) => h.id !== hid));
  const updateHeader = (hid: string, field: "key" | "value" | "enabled", val: string | boolean) =>
    setHeaders((prev) => prev.map((h) => (h.id === hid ? { ...h, [field]: val } : h)));

  const addParam = () =>
    setQueryParams((prev) => [...prev, { id: generateId(), key: "", value: "", enabled: true }]);
  const removeParam = (pid: string) => setQueryParams((prev) => prev.filter((p) => p.id !== pid));
  const updateParam = (pid: string, field: "key" | "value" | "enabled", val: string | boolean) =>
    setQueryParams((prev) => prev.map((p) => (p.id === pid ? { ...p, [field]: val } : p)));

  const getStatusColor = (status: number | null) => {
    if (!status) return "text-red-400 bg-red-400/10 border-red-400/30";
    if (status < 300) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
    if (status < 400) return "text-amber-400 bg-amber-400/10 border-amber-400/30";
    return "text-red-400 bg-red-400/10 border-red-400/30";
  };

  if (!id) return null;

  return (
    <DeveloperLayout developerId={id}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-primary" /> API Playground
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Test your API endpoints directly using your developer keys.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={() => setShowHistory((p) => !p)}
            >
              <Clock className="h-4 w-4" />
              History ({history.length})
              {showHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* History panel */}
        {showHistory && history.length > 0 && (
          <Card className="shadow-soft">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Request History
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {history.map((h) => (
                  <button
                    key={h.id}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs hover:bg-muted/60 transition-colors text-left"
                    onClick={() => {
                      setMethod(h.method as HttpMethod);
                      const urlObj = new URL(h.url);
                      setBaseUrl(urlObj.origin);
                      setPath(urlObj.pathname);
                    }}
                  >
                    <span className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded border ${METHOD_COLORS[h.method as HttpMethod]}`}>
                      {h.method}
                    </span>
                    <span className="flex-1 truncate text-muted-foreground font-mono">{h.url}</span>
                    {h.status && (
                      <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${getStatusColor(h.status)}`}>
                        {h.status}
                      </span>
                    )}
                    {h.duration !== null && (
                      <span className="text-muted-foreground">{h.duration}ms</span>
                    )}
                    <span className="text-muted-foreground/60">
                      {h.timestamp.toLocaleTimeString()}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
          {/* LEFT: Request Builder */}
          <div className="space-y-4">
            {/* Key selector */}
            <Card className="shadow-soft">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Key className="h-4 w-4 text-primary shrink-0" />
                  <Label className="text-sm font-medium shrink-0">API Key</Label>
                  {keysLoading ? (
                    <Skeleton className="h-9 w-64 rounded-md" />
                  ) : (
                    <Select value={selectedKey} onValueChange={setSelectedKey}>
                      <SelectTrigger className="w-72 font-mono text-sm h-9">
                        <SelectValue placeholder="Select an API key…" />
                      </SelectTrigger>
                      <SelectContent>
                        {keys.length === 0 && (
                          <SelectItem value="none" disabled>
                            No active keys found
                          </SelectItem>
                        )}
                        {keys.map((k) => (
                          <SelectItem key={k.id} value={k.id} disabled={!k.is_active}>
                            <span className="flex items-center gap-2">
                              <span
                                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                  k.is_active ? "bg-emerald-400" : "bg-muted-foreground"
                                }`}
                              />
                              <span className="font-mono text-xs">{k.key_prefix}••••</span>
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-1 h-4 capitalize"
                              >
                                {k.key_type}
                              </Badge>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedKey && (
                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                      {getActiveKeyPrefix()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Presets */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Info className="h-3 w-3" /> Quick presets
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_ENDPOINTS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
                    title={preset.description}
                  >
                    <span className={`font-mono font-bold text-[10px] ${METHOD_COLORS[preset.method].split(" ")[0]}`}>
                      {preset.method}
                    </span>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* URL bar */}
            <Card className="shadow-soft">
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex gap-2">
                  {/* Method */}
                  <Select value={method} onValueChange={(v) => setMethod(v as HttpMethod)}>
                    <SelectTrigger
                      className={`w-28 font-mono font-bold text-sm h-10 border ${METHOD_COLORS[method]}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HTTP_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          <span className={`font-mono font-bold text-sm ${METHOD_COLORS[m].split(" ")[0]}`}>
                            {m}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Base URL */}
                  <div className="flex flex-1 gap-0">
                    <Input
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="https://api.example.com/v1"
                      className="rounded-r-none h-10 font-mono text-sm border-r-0 text-muted-foreground bg-muted/30"
                    />
                    <Input
                      value={path}
                      onChange={(e) => setPath(e.target.value)}
                      placeholder="/endpoint"
                      className="rounded-l-none h-10 font-mono text-sm flex-1"
                    />
                  </div>
                  {/* Send */}
                  <Button
                    className="h-10 px-5 gap-2 shrink-0"
                    onClick={sendRequest}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                    {loading ? "Sending…" : "Send"}
                  </Button>
                </div>

                {/* Full URL preview */}
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-lg">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <code className="text-xs text-muted-foreground truncate flex-1 font-mono">
                    {buildUrl()}
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Tabs: Headers / Params / Body */}
            <Card className="shadow-soft">
              <CardContent className="pt-4 pb-4">
                <Tabs defaultValue="headers">
                  <TabsList className="mb-4 h-8">
                    <TabsTrigger value="headers" className="text-xs h-7">
                      Headers
                      <Badge variant="secondary" className="ml-1.5 text-[10px] px-1 py-0 h-4">
                        {headers.filter((h) => h.enabled && h.key).length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="params" className="text-xs h-7">
                      Query Params
                      <Badge variant="secondary" className="ml-1.5 text-[10px] px-1 py-0 h-4">
                        {queryParams.filter((p) => p.enabled && p.key).length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="body" className="text-xs h-7" disabled={method === "GET" || method === "DELETE"}>
                      Body
                    </TabsTrigger>
                  </TabsList>

                  {/* Headers tab */}
                  <TabsContent value="headers" className="space-y-2 mt-0">
                    {headers.map((h) => (
                      <div key={h.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={h.enabled}
                          onChange={(e) => updateHeader(h.id, "enabled", e.target.checked)}
                          className="accent-primary"
                        />
                        <Input
                          value={h.key}
                          onChange={(e) => updateHeader(h.id, "key", e.target.value)}
                          placeholder="Header name"
                          className="h-8 text-xs font-mono flex-1"
                        />
                        <Input
                          value={h.value}
                          onChange={(e) => updateHeader(h.id, "value", e.target.value)}
                          placeholder="Value"
                          className="h-8 text-xs font-mono flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeHeader(h.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addHeader}>
                      + Add Header
                    </Button>
                    <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        The <code className="bg-muted px-1 rounded">X-API-Key</code> header will be injected automatically from your selected key. Do not add it manually.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Query Params tab */}
                  <TabsContent value="params" className="space-y-2 mt-0">
                    {queryParams.map((p) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={p.enabled}
                          onChange={(e) => updateParam(p.id, "enabled", e.target.checked)}
                          className="accent-primary"
                        />
                        <Input
                          value={p.key}
                          onChange={(e) => updateParam(p.id, "key", e.target.value)}
                          placeholder="Parameter"
                          className="h-8 text-xs font-mono flex-1"
                        />
                        <Input
                          value={p.value}
                          onChange={(e) => updateParam(p.id, "value", e.target.value)}
                          placeholder="Value"
                          className="h-8 text-xs font-mono flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeParam(p.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addParam}>
                      + Add Parameter
                    </Button>
                  </TabsContent>

                  {/* Body tab */}
                  <TabsContent value="body" className="mt-0 space-y-2">
                    {isMultipart && (
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          <span className="font-medium text-amber-500">multipart/form-data</span> — endpoint ini menggunakan file upload. Gunakan tool seperti Postman atau implementasi langsung di kode untuk mengirim file. Preview di bawah hanya untuk referensi field yang dibutuhkan.
                        </p>
                      </div>
                    )}
                    <div className="relative">
                      <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder='{\n  "key": "value"\n}'
                        className="font-mono text-sm min-h-40 resize-y"
                        spellCheck={false}
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2 text-muted-foreground"
                          onClick={() => {
                            try {
                              const lines = body.split("\n").filter((l) => !l.trim().startsWith("//"));
                              const parsed = JSON.parse(lines.join("\n"));
                              setBody(JSON.stringify(parsed, null, 2));
                            } catch {
                              toast({ title: "Invalid JSON", variant: "destructive" });
                            }
                          }}
                        >
                          <Code2 className="h-3 w-3 mr-1" /> Format
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2 text-muted-foreground"
                          onClick={() => setBody("")}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <FileJson className="h-3 w-3" />
                      {isMultipart ? "Reference fields (actual request harus multipart/form-data)" : "Expected: JSON body"}
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Response panel */}
          <div ref={responseRef} className="space-y-4">
            <Card className="shadow-soft min-h-[400px]">
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    Response
                    {response && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-bold ${getStatusColor(response.status)}`}
                      >
                        {response.status || "ERR"} {response.statusText}
                      </span>
                    )}
                  </CardTitle>
                  {response && (
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {response.duration}ms
                      </span>
                      <span>{response.size}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={copyResponse}
                      >
                        {copiedResponse ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm">Sending request…</p>
                  </div>
                )}

                {!loading && !response && (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <FlaskConical className="h-10 w-10 opacity-20" />
                    <p className="text-sm">Hit Send to see the response</p>
                    <p className="text-xs opacity-60">Configure your request on the left</p>
                  </div>
                )}

                {!loading && response && (
                  <Tabs value={activeResponseTab} onValueChange={setActiveResponseTab}>
                    <TabsList className="mb-3 h-8">
                      <TabsTrigger value="body" className="text-xs h-7">Body</TabsTrigger>
                      <TabsTrigger value="headers" className="text-xs h-7">
                        Headers
                        <Badge variant="secondary" className="ml-1.5 text-[10px] px-1 py-0 h-4">
                          {Object.keys(response.headers).length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="body" className="mt-0">
                      <div className="relative rounded-lg overflow-hidden bg-zinc-950 border border-border">
                        {/* Status bar */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
                          <div className="flex items-center gap-2">
                            {response.status >= 200 && response.status < 300 ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-400" />
                            )}
                            <span className="text-xs text-zinc-400 font-mono">JSON</span>
                          </div>
                          <span className="text-[10px] text-zinc-500">{response.size}</span>
                        </div>
                        <pre
                          className="p-4 text-xs font-mono overflow-auto max-h-96 text-zinc-100 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: syntaxHighlight(
                              JSON.stringify(response.body, null, 2)
                            ),
                          }}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="headers" className="mt-0">
                      <div className="rounded-lg border overflow-hidden bg-muted/20">
                        {Object.entries(response.headers).map(([k, v], i) => (
                          <div
                            key={k}
                            className={`flex items-start gap-3 px-3 py-2 text-xs font-mono ${
                              i % 2 === 0 ? "" : "bg-muted/30"
                            }`}
                          >
                            <span className="text-sky-400 shrink-0 min-w-[140px] truncate">{k}</span>
                            <span className="text-muted-foreground break-all">{v}</span>
                          </div>
                        ))}
                        {Object.keys(response.headers).length === 0 && (
                          <div className="text-xs text-muted-foreground text-center py-6">
                            No response headers
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>

            {/* cURL snippet */}
            {selectedKey && (
              <Card className="shadow-soft">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-muted-foreground" /> cURL Snippet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative rounded-lg bg-zinc-950 border border-border overflow-hidden">
                    <pre className="p-3 text-[11px] font-mono text-zinc-300 overflow-auto whitespace-pre-wrap break-all leading-relaxed">
                      <span className="text-emerald-400">curl</span>
                      {` -X ${method} \\\n`}
                      {`  "${buildUrl()}" \\\n`}
                      {`  -H "X-API-Key: ${getActiveKeyPrefix()}" \\\n`}
                      {headers
                        .filter((h) => h.enabled && h.key && h.key !== "Content-Type")
                        .map((h) => `  -H "${h.key}: ${h.value}" \\\n`)
                        .join("")}
                      {isMultipart
                        ? `  -F "file=@/path/to/photo.jpg" \\\n  -F "title=My Photo"`
                        : ["POST", "PUT", "PATCH"].includes(method) && body
                        ? `  -H "Content-Type: application/json" \\\n  -d '${body.replace(/\n/g, " ").replace(/'/g, "\\'")}'`
                        : ""}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 text-[10px] px-2 text-zinc-400 hover:text-zinc-100"
                      onClick={() => {
                        const headerStr = headers
                          .filter((h) => h.enabled && h.key && h.key !== "Content-Type")
                          .map((h) => ` -H "${h.key}: ${h.value}"`)
                          .join("");
                        const bodyStr = isMultipart
                          ? ` -F "file=@/path/to/photo.jpg" -F "title=My Photo"`
                          : ["POST", "PUT", "PATCH"].includes(method) && body
                          ? ` -H "Content-Type: application/json" -d '${body.replace(/\n/g, " ")}'`
                          : "";
                        const curl = `curl -X ${method} "${buildUrl()}" -H "X-API-Key: ${getActiveKeyPrefix()}"${headerStr}${bodyStr}`;
                        navigator.clipboard.writeText(curl);
                        toast({ title: "cURL copied!" });
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DeveloperLayout>
  );
};

export default DeveloperPlayground;