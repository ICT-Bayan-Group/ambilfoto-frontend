import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import PhotographerHeader from "@/components/layout/HeaderPhoto";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { photographerService, PhotographerStats, Event } from "@/services/api/photographer.service";
import { 
  Camera, 
  Calendar, 
  Image, 
  Users, 
  Download, 
  DollarSign,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock
} from "lucide-react";
import { format } from "date-fns";

const PhotographerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PhotographerStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          photographerService.getStatistics(),
          photographerService.getMyEvents()
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
        if (eventsRes.success && eventsRes.data) {
          setEvents(eventsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentEvents = events.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <PhotographerHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.full_name?.split(' ')[0]}! 📸
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your events and photos from your dashboard
            </p>
          </div>
          <Link to="/photographer/events/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.events.total_events || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Events</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/20">
                      <Image className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.photos.total_photos || 0}</p>
                      <p className="text-sm text-muted-foreground">Photos Uploaded</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <Users className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.photos.total_faces_detected || 0}</p>
                      <p className="text-sm text-muted-foreground">Faces Detected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Download className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.downloads.total_downloads || 0}</p>
                      <p className="text-sm text-muted-foreground">Downloads</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions & Recent Events */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/photographer/events/new" className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Plus className="h-4 w-4" />
                  Create New Event
                </Button>
              </Link>
              <Link to="/photographer/events" className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Calendar className="h-4 w-4" />
                  View All Events
                </Button>
              </Link>
              <Link to="/photographer/profile" className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Camera className="h-4 w-4" />
                  Edit Business Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Events
                </CardTitle>
                <CardDescription>Your latest event activities</CardDescription>
              </div>
              <Link to="/photographer/events">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No events yet</p>
                  <Link to="/photographer/events/new">
                    <Button variant="link" className="mt-2">
                      Create your first event
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <Link
                      key={event.id}
                      to={`/photographer/events/${event.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{event.event_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.event_date), 'MMM dd, yyyy')} • {event.photo_count || 0} photos
                        </p>
                      </div>
                      <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{stats?.users.unique_users || 0}</p>
                  <p className="text-sm text-muted-foreground">Unique users matched</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{stats?.events.active_events || 0}</p>
                  <p className="text-sm text-muted-foreground">Active events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    Rp {(stats?.downloads.total_revenue || 0).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-muted-foreground">Total revenue</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{stats?.events.completed_events || 0}</p>
                  <p className="text-sm text-muted-foreground">Completed events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PhotographerDashboard;
