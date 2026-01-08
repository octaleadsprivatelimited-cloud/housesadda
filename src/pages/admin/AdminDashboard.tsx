import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Plus,
  ArrowUpRight,
  Loader2,
  Home,
  Key,
  FileText,
  Users,
  MapPin,
  Clock,
  Search,
  UserPlus,
  Activity,
  BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { propertiesAPI } from '@/lib/api';

const transactionTypes = ['All', 'Sale', 'Rent', 'Lease', 'PG'];

// Mini bar chart component for stat cards
const MiniBarChart = ({ color }: { color: string }) => {
  const bars = [40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 55, 90];
  return (
    <div className="flex items-end gap-0.5 h-8 mt-2">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-t ${color}`}
          style={{ height: `${height}%`, opacity: 0.7 + (i * 0.025) }}
        />
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    active: 0,
    inactive: 0,
  });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [selectedFilter]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedFilter !== 'All') {
        params.transactionType = selectedFilter;
      }
      
      const allProperties = await propertiesAPI.getAll(params);
      const filteredProperties = allProperties;
      
      const activeProperties = filteredProperties.filter((p: any) => p.isActive);
      const featuredProperties = filteredProperties.filter((p: any) => p.isFeatured);

      setStats({
        total: filteredProperties.length,
        featured: featuredProperties.length,
        active: activeProperties.length,
        inactive: filteredProperties.length - activeProperties.length,
      });

      const recent = filteredProperties
        .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 4)
        .map((p: any) => ({
          id: String(p.id),
          title: p.title,
          area: p.area || '',
          price: formatPrice(p.price),
          status: p.isActive ? 'Active' : 'Inactive',
          transactionType: p.transactionType || 'Sale',
          createdAt: p.createdAt
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

  const statCards = [
    { 
      label: 'Total Properties', 
      value: stats.total, 
      icon: UserPlus,
      bgColor: 'bg-gradient-to-br from-teal-400 to-teal-500',
      barColor: 'bg-teal-200',
      suffix: '',
      link: '/admin/properties'
    },
    { 
      label: 'Featured', 
      value: stats.featured, 
      icon: Users,
      bgColor: 'bg-gradient-to-br from-amber-400 to-amber-500',
      barColor: 'bg-amber-200',
      suffix: '',
      link: '/admin/properties?filter=featured'
    },
    { 
      label: 'Active', 
      value: stats.active, 
      icon: Search,
      bgColor: 'bg-gradient-to-br from-purple-400 to-purple-500',
      barColor: 'bg-purple-200',
      suffix: '',
      link: '/admin/properties?filter=active'
    },
    { 
      label: 'Inactive', 
      value: stats.inactive, 
      icon: Activity,
      bgColor: 'bg-gradient-to-br from-rose-400 to-rose-500',
      barColor: 'bg-rose-200',
      suffix: '',
      link: '/admin/properties?filter=inactive'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <Link to="/admin/properties/new">
          <Button className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/30">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {transactionTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedFilter(type)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${selectedFilter === type 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {type === 'All' && <Building2 className="h-4 w-4" />}
              {type === 'Sale' && <Home className="h-4 w-4" />}
              {type === 'Rent' && <Key className="h-4 w-4" />}
              {type === 'Lease' && <FileText className="h-4 w-4" />}
              {type === 'PG' && <Users className="h-4 w-4" />}
              {type}
            </span>
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link 
            key={stat.label}
            to={stat.link}
            className={`${stat.bgColor} rounded-xl p-4 text-white shadow-lg relative overflow-hidden hover:scale-105 hover:shadow-xl transition-all cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white/80 text-xs font-medium mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}{stat.suffix}</p>
              </div>
              <stat.icon className="h-8 w-8 text-white/50" />
            </div>
            <MiniBarChart color={stat.barColor} />
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Properties */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Recent Properties</h3>
                    <p className="text-xs text-gray-500">Latest additions to your portfolio</p>
                  </div>
                </div>
                <Link to="/admin/properties" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="p-4">
              {recentProperties.length > 0 ? (
                <div className="space-y-3">
                  {recentProperties.map((property) => (
                    <Link
                      key={property.id}
                      to={`/admin/properties/${property.id}/edit`}
                      className="group flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-red-500 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 group-hover:text-primary transition-colors line-clamp-1">
                            {property.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{property.area}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              property.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {property.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{property.price}</p>
                        <p className="text-xs text-gray-500">{property.transactionType}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-1">No properties found</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    {selectedFilter === 'All' 
                      ? 'Get started by adding your first property' 
                      : `No ${selectedFilter} properties available`}
                  </p>
                  <Link to="/admin/properties/new">
                    <Button className="bg-primary text-white hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Property
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Activity & Quick Stats */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Activity Feed</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div>
                  <p className="text-sm text-gray-700">New property added: <span className="font-medium">2 BHK in Kondapur</span></p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div>
                  <p className="text-sm text-gray-700">Property status changed to <span className="font-medium text-green-600">Active</span></p>
                  <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                <div>
                  <p className="text-sm text-gray-700">Location <span className="font-medium">Madhapur</span> added</p>
                  <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                <div>
                  <p className="text-sm text-gray-700">Property marked as <span className="font-medium text-amber-600">Featured</span></p>
                  <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-primary to-red-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <BarChart2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Quick Overview</h3>
                <p className="text-white/70 text-sm">This month's stats</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-white/70 text-xs">Total Properties</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-white/70 text-xs">Active Listings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
