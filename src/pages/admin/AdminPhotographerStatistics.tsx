import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  TrendingUp, 
  Users, 
  Download,
  BarChart3,
  Globe,
  RefreshCw
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000/api';

// Create authenticated axios instance
const adminApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface Summary {
  total_photographers: number;
  photographers_with_location: number;
  location_completion_rate: number;
  top_province: string | null;
  top_province_count: number;
  top_city: string | null;
  top_city_count: number;
}

interface ProvinceData {
  province: string;
  province_id: string;
  total: number;
  percentage: number;
}

interface CityData {
  city: string;
  city_id: string;
  province: string;
  province_id: string;
  total: number;
}

interface CoverageData {
  total_provinces: number;
  total_cities: number;
  provinces: Array<{
    province_name: string;
    province_id: string;
    photographers: number;
  }>;
}

const AdminPhotographerStatistics = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [cities, setCities] = useState<CityData[]>([]);
  const [coverage, setCoverage] = useState<CoverageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, provincesRes, citiesRes, coverageRes] = await Promise.all([
        adminApi.get('/admin/statistics/photographers/summary'),
        adminApi.get('/admin/statistics/photographers/province'),
        adminApi.get('/admin/statistics/photographers/city'),
        adminApi.get('/admin/statistics/photographers/coverage'),
      ]);

      if (summaryRes.data.success) setSummary(summaryRes.data.data);
      if (provincesRes.data.success) setProvinces(provincesRes.data.data);
      if (citiesRes.data.success) setCities(citiesRes.data.data);
      if (coverageRes.data.success) setCoverage(coverageRes.data.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Gagal memuat statistik",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminApi.get('/admin/statistics/photographers/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `photographers_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Berhasil",
        description: "Data berhasil diexport",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal export data",
        variant: "destructive",
      });
    }
  };

  const filteredCities = selectedProvince
    ? cities.filter(c => c.province_id === selectedProvince)
    : cities;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Photographer Location Analytics</h1>
            <p className="text-muted-foreground">
              Statistik dan analisis sebaran photographer berdasarkan lokasi
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold">{summary.total_photographers}</p>
                  <p className="text-sm text-muted-foreground">Total Photographers</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-3xl font-bold">{summary.photographers_with_location}</p>
                  <p className="text-sm text-muted-foreground">With Location</p>
                  <p className="text-xs text-muted-foreground">
                    ({summary.location_completion_rate.toFixed(1)}%)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-xl font-bold truncate">{summary.top_province || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Top Province</p>
                  <p className="text-xs text-muted-foreground">
                    {summary.top_province_count} photographers
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-xl font-bold truncate">{summary.top_city || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Top City</p>
                  <p className="text-xs text-muted-foreground">
                    {summary.top_city_count} photographers
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Coverage Overview */}
        {!loading && coverage && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Coverage Indonesia
              </CardTitle>
              <CardDescription>
                Total jangkauan photographer di seluruh Indonesia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-4xl font-bold text-primary">{coverage.total_provinces}</p>
                  <p className="text-sm text-muted-foreground">Provinsi Terjangkau</p>
                  <p className="text-xs text-muted-foreground">dari 34 provinsi</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-green-600">{coverage.total_cities}</p>
                  <p className="text-sm text-muted-foreground">Kota Terjangkau</p>
                  <p className="text-xs text-muted-foreground">seluruh Indonesia</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-blue-600">
                    {coverage.total_provinces > 0 
                      ? ((coverage.total_provinces / 34) * 100).toFixed(1) 
                      : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Coverage Rate</p>
                  <p className="text-xs text-muted-foreground">dari total provinsi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Province & City Data */}
        <Tabs defaultValue="provinces" className="space-y-4">
          <TabsList>
            <TabsTrigger value="provinces">
              <MapPin className="h-4 w-4 mr-2" />
              By Province
            </TabsTrigger>
            <TabsTrigger value="cities">
              <MapPin className="h-4 w-4 mr-2" />
              By City
            </TabsTrigger>
          </TabsList>

          {/* Provinces Tab */}
          <TabsContent value="provinces">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Provinces</CardTitle>
                <CardDescription>
                  Provinsi dengan photographer terbanyak
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : provinces.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Belum ada data
                  </p>
                ) : (
                  <div className="space-y-3">
                    {provinces.map((prov, idx) => (
                      <div
                        key={prov.province_id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedProvince(prov.province_id)}
                      >
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-lg font-bold w-10 h-10 flex items-center justify-center">
                            {idx + 1}
                          </Badge>
                          <div>
                            <p className="font-semibold">{prov.province}</p>
                            <p className="text-sm text-muted-foreground">
                              {prov.percentage.toFixed(1)}% dari total
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{prov.total}</p>
                          <p className="text-xs text-muted-foreground">photographers</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cities Tab */}
          <TabsContent value="cities">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Top 20 Cities</CardTitle>
                    <CardDescription>
                      Kota dengan photographer terbanyak
                    </CardDescription>
                  </div>
                  {selectedProvince && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProvince("")}
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredCities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Belum ada data
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredCities.slice(0, 20).map((city, idx) => (
                      <div
                        key={city.city_id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="font-bold w-10 h-10 flex items-center justify-center">
                            {idx + 1}
                          </Badge>
                          <div>
                            <p className="font-semibold">{city.city}</p>
                            <p className="text-sm text-muted-foreground">{city.province}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">{city.total}</p>
                          <p className="text-xs text-muted-foreground">photographers</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPhotographerStatistics;