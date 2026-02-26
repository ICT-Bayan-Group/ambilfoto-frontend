import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Star, Camera, Image, MessageCircle, ArrowLeft } from "lucide-react";
import { chatService, Photographer } from "@/services/api/chat.service";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PhotographerSearch = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [filteredPhotographers, setFilteredPhotographers] = useState<Photographer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const locations = [...new Set(photographers.map(p => p.location).filter(Boolean))];
  const specialties = [...new Set(photographers.flatMap(p => p.specialties || []))];

  useEffect(() => { loadPhotographers(); }, []);

  useEffect(() => {
    let filtered = photographers;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.business_name?.toLowerCase().includes(q) || p.full_name?.toLowerCase().includes(q) || p.bio?.toLowerCase().includes(q));
    }
    if (locationFilter) filtered = filtered.filter(p => p.location === locationFilter);
    if (specialtyFilter) filtered = filtered.filter(p => p.specialties?.includes(specialtyFilter));
    setFilteredPhotographers(filtered);
  }, [searchQuery, locationFilter, specialtyFilter, photographers]);

  const loadPhotographers = async () => {
    try {
      setIsLoading(true);
      const data = await chatService.getAllPhotographers();
      setPhotographers(data);
      setFilteredPhotographers(data);
    } catch (error) {
      console.error('Error loading photographers:', error);
      toast({ title: "Error", description: "Failed to load photographers", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async (photographer: Photographer) => {
    try {
      setIsStartingChat(photographer.id);
      const chat = await chatService.createOrGetDirectChat(photographer.id);
      navigate(`/user/chat/${chat.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({ title: "Error", description: "Failed to start conversation", variant: "destructive" });
    } finally {
      setIsStartingChat(null);
    }
  };

  const clearFilters = () => { setSearchQuery(""); setLocationFilter(""); setSpecialtyFilter(""); };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">Find Photographers</h1>
            <p className="text-muted-foreground text-sm">Discover and connect with professional photographers</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, business, or bio..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[180px]"><MapPin className="h-4 w-4 mr-2" /><SelectValue placeholder="Location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                {locations.map(loc => (<SelectItem key={loc} value={loc!}>{loc}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-[180px]"><Camera className="h-4 w-4 mr-2" /><SelectValue placeholder="Specialty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specialties</SelectItem>
                {specialties.map(spec => (<SelectItem key={spec} value={spec}>{spec}</SelectItem>))}
              </SelectContent>
            </Select>
            {(searchQuery || locationFilter || specialtyFilter) && <Button variant="ghost" size="sm" onClick={clearFilters}>Clear Filters</Button>}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{filteredPhotographers.length} photographer{filteredPhotographers.length !== 1 ? 's' : ''} found</p>

        <div className="grid gap-4 md:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-border/50"><CardContent className="p-6"><div className="flex items-start gap-4"><Skeleton className="h-16 w-16 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-full" /></div></div></CardContent></Card>
            ))
          ) : filteredPhotographers.length === 0 ? (
            <div className="col-span-full"><Card className="border-border/50"><CardContent className="p-12 text-center"><Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><h3 className="font-semibold text-lg mb-2">No photographers found</h3><p className="text-muted-foreground mb-4">Try adjusting your search or filters</p><Button variant="outline" onClick={clearFilters}>Clear All Filters</Button></CardContent></Card></div>
          ) : (
            filteredPhotographers.map((photographer) => (
              <Card key={photographer.id} className="border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-background shadow-md">
                      <AvatarImage src={photographer.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">{photographer.business_name?.charAt(0) || photographer.full_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{photographer.business_name || photographer.full_name}</h3>
                      {photographer.location && <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2"><MapPin className="h-3 w-3" /><span>{photographer.location}</span></div>}
                      {photographer.rating && <div className="flex items-center gap-1 mb-2"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="text-sm font-medium">{photographer.rating.toFixed(1)}</span></div>}
                      {photographer.bio && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{photographer.bio}</p>}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        {photographer.total_events !== undefined && <div className="flex items-center gap-1"><Camera className="h-3 w-3" /><span>{photographer.total_events} events</span></div>}
                        {photographer.total_photos !== undefined && <div className="flex items-center gap-1"><Image className="h-3 w-3" /><span>{photographer.total_photos} photos</span></div>}
                      </div>
                      {photographer.specialties && photographer.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {photographer.specialties.slice(0, 3).map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}
                          {photographer.specialties.length > 3 && <Badge variant="outline" className="text-xs">+{photographer.specialties.length - 3}</Badge>}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button onClick={() => handleStartChat(photographer)} disabled={isStartingChat === photographer.id} className="flex-1" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />{isStartingChat === photographer.id ? 'Starting...' : 'Message'}
                        </Button>
                        {photographer.portfolio_url && <Button variant="outline" size="sm" onClick={() => window.open(photographer.portfolio_url, '_blank')}>Portfolio</Button>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PhotographerSearch;
