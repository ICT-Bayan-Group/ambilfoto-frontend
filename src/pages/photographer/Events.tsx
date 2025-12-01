import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhotographerHeader from "@/components/layout/HeaderPhoto";
import { Footer } from "@/components/layout/Footer";
import { photographerService, Event } from "@/services/api/photographer.service";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  Image, 
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, activeTab]);

  const fetchEvents = async () => {
    try {
      const response = await photographerService.getMyEvents();
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Filter by status
    if (activeTab !== "all") {
      filtered = filtered.filter(event => event.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      const response = await photographerService.deleteEvent(eventToDelete.id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Event archived successfully",
        });
        fetchEvents();
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PhotographerHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Events</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your photography events
            </p>
          </div>
          <Link to="/photographer/events/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search" : "Create your first event to get started"}
              </p>
              {!searchQuery && (
                <Link to="/photographer/events/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate">{event.event_name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(event.event_date), 'MMM dd, yyyy')}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/photographer/events/${event.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/photographer/events/${event.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Event
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setEventToDelete(event);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Archive Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {event.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Image className="h-4 w-4 text-muted-foreground" />
                      <span>{event.photo_count || 0} photos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{event.matched_users_count || 0} users</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                    <Link to={`/photographer/events/${event.id}`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive "{eventToDelete?.event_name}". The event and its photos will be hidden but not permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Events;
