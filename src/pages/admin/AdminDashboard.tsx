import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Eye, 
  TrendingUp, 
  Star, 
  Plus,
  ArrowUpRight,
  Phone,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { propertiesAPI } from '@/lib/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Properties', value: '0', icon: Building2, change: 'Loading...', color: 'bg-blue-500' },
    { label: 'Featured', value: '0', icon: Star, change: 'Loading...', color: 'bg-amber-500' },
    { label: 'Active', value: '0', icon: Eye, change: 'Loading...', color: 'bg-green-500' },
    { label: 'Total Properties', value: '0', icon: Phone, change: 'Loading...', color: 'bg-purple-500' },
  ]);
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const allProperties = await propertiesAPI.getAll();
      const activeProperties = allProperties.filter((p: any) => p.isActive);
      const featuredProperties = allProperties.filter((p: any) => p.isFeatured);

      setStats([
        { label: 'Total Properties', value: String(allProperties.length), icon: Building2, change: 'All properties', color: 'bg-blue-500' },
        { label: 'Featured', value: String(featuredProperties.length), icon: Star, change: `${Math.round((featuredProperties.length / allProperties.length) * 100) || 0}% of total`, color: 'bg-amber-500' },
        { label: 'Active', value: String(activeProperties.length), icon: Eye, change: 'Currently active', color: 'bg-green-500' },
        { label: 'Inactive', value: String(allProperties.length - activeProperties.length), icon: Phone, change: 'Not visible', color: 'bg-purple-500' },
      ]);

      // Get recent properties (last 4)
      const recent = allProperties
        .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 4)
        .map((p: any) => ({
          id: String(p.id),
          title: p.title,
          area: p.area || '',
          price: formatPrice(p.price),
          status: p.isActive ? 'Active' : 'Inactive'
        }));
      
      setRecentProperties(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="hero-gradient rounded-2xl p-6 md:p-8 text-primary-foreground">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
            <p className="text-primary-foreground/80">
              Here's what's happening with your properties today.
            </p>
          </div>
          <Link to="/admin/properties/new">
            <Button className="accent-gradient text-accent-foreground font-semibold">
              <Plus className="h-5 w-5 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl p-5 card-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xs text-green-600 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Properties */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Properties</h3>
          <Link to="/admin/properties" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {recentProperties.map((property) => (
            <div key={property.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{property.title}</p>
                <p className="text-sm text-muted-foreground">{property.area}</p>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-price">{property.price}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  property.status === 'Active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {property.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/admin/properties/new">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span>Add Property</span>
            </Button>
          </Link>
          <Link to="/admin/locations">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Building2 className="h-6 w-6" />
              <span>Manage Locations</span>
            </Button>
          </Link>
          <a href="/" target="_blank">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Eye className="h-6 w-6" />
              <span>View Website</span>
            </Button>
          </a>
          <Link to="/admin/properties">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Star className="h-6 w-6" />
              <span>Featured Props</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
