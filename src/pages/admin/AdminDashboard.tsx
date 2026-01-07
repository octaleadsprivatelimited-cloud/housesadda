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
  Loader2,
  Home,
  Key,
  FileText,
  Users,
  DollarSign,
  Activity,
  Calendar,
  MapPin,
  BarChart3,
  Zap,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { propertiesAPI } from '@/lib/api';

const transactionTypes = ['All', 'Sale', 'Rent', 'Lease', 'PG'];

const AdminDashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [stats, setStats] = useState([
    { label: 'Total Properties', value: '0', icon: Building2, change: 'Loading...', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-200' },
    { label: 'Featured', value: '0', icon: Star, change: 'Loading...', color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', textColor: 'text-red-600', borderColor: 'border-red-200' },
    { label: 'Active', value: '0', icon: Eye, change: 'Loading...', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-200' },
    { label: 'Inactive', value: '0', icon: Phone, change: 'Loading...', color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', textColor: 'text-red-600', borderColor: 'border-red-200' },
  ]);
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

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
      
      // The API already filters by transactionType, so we can use allProperties directly
      const filteredProperties = allProperties;
      
      const activeProperties = filteredProperties.filter((p: any) => p.isActive);
      const featuredProperties = filteredProperties.filter((p: any) => p.isFeatured);
      
      // Calculate total value
      const total = filteredProperties.reduce((sum: number, p: any) => sum + (p.price || 0), 0);
      setTotalValue(total);

      setStats([
        { 
          label: 'Total Properties', 
          value: String(filteredProperties.length), 
          icon: Building2, 
          change: selectedFilter === 'All' ? 'All properties' : `${selectedFilter} only`, 
          color: 'from-blue-500 to-blue-600', 
          bgColor: 'bg-blue-50', 
          textColor: 'text-blue-600',
          borderColor: 'border-blue-200'
        },
        { 
          label: 'Featured', 
          value: String(featuredProperties.length), 
          icon: Star, 
          change: `${Math.round((featuredProperties.length / filteredProperties.length) * 100) || 0}% of total`, 
          color: 'from-red-500 to-red-600', 
          bgColor: 'bg-red-50', 
          textColor: 'text-red-600',
          borderColor: 'border-red-200'
        },
        { 
          label: 'Active', 
          value: String(activeProperties.length), 
          icon: Eye, 
          change: 'Currently active', 
          color: 'from-blue-500 to-blue-600', 
          bgColor: 'bg-blue-50', 
          textColor: 'text-blue-600',
          borderColor: 'border-blue-200'
        },
        { 
          label: 'Inactive', 
          value: String(filteredProperties.length - activeProperties.length), 
          icon: Phone, 
          change: 'Not visible', 
          color: 'from-red-500 to-red-600', 
          bgColor: 'bg-red-50', 
          textColor: 'text-red-600',
          borderColor: 'border-red-200'
        },
      ]);

      // Get recent properties (last 4) based on filter
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

  const formatTotalValue = (price: number) => {
    if (price >= 100000000) {
      return `₹${(price / 100000000).toFixed(2)} Cr`;
    } else if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/90 rounded-lg p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold mb-1">Welcome back! 👋</h1>
            <p className="text-white/90 text-sm">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-white/80 text-sm mt-1">
              Here's an overview of your property portfolio.
            </p>
          </div>
          <Link to="/admin/properties/new">
            <Button className="bg-white text-primary hover:bg-white/90 font-medium shadow-md px-4 py-2 text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-gray-900">Filter by Transaction Type</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {transactionTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selectedFilter === type 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className="flex items-center gap-1.5">
                {type === 'All' && <Building2 className="h-3.5 w-3.5" />}
                {type === 'Sale' && <Home className="h-3.5 w-3.5" />}
                {type === 'Rent' && <Key className="h-3.5 w-3.5" />}
                {type === 'Lease' && <FileText className="h-3.5 w-3.5" />}
                {type === 'PG' && <Users className="h-3.5 w-3.5" />}
                {type}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            className={`
              relative overflow-hidden rounded-xl p-4 
              bg-white border-2 ${stat.borderColor}
              shadow-md hover:shadow-lg hover:border-opacity-60 transition-all
              group
            `}
          >
            {/* Gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}></div>
            
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div>
              <p className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-gray-800 mb-1.5">
                {stat.label}
              </p>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${stat.textColor}`}></div>
                <p className={`text-xs ${stat.textColor} font-medium`}>
                  {stat.change}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Portfolio Value Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-white/90 text-xs font-medium">Total Portfolio Value</p>
              <p className="text-xl font-bold mt-0.5">
                {formatTotalValue(totalValue)}
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-semibold">Active</span>
          </div>
        </div>
      </div>

      {/* Recent Properties */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Recent Properties</h3>
                <p className="text-xs text-gray-500">Latest additions</p>
              </div>
            </div>
            <Link to="/admin/properties" className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              View All
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        
        <div className="p-4">
          {recentProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentProperties.map((property) => (
                <Link
                  key={property.id}
                  to={`/admin/properties/${property.id}/edit`}
                  className="group p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 group-hover:text-primary transition-colors line-clamp-1 mb-1">
                        {property.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{property.area}</span>
                      </div>
                    </div>
                    <div className={`ml-2 p-1 rounded ${
                      property.status === 'Active' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {property.status === 'Active' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div>
                      <p className="text-base font-bold text-primary">{property.price}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {property.transactionType}
                      </p>
                    </div>
                    {property.createdAt && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(property.createdAt).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                No properties found
              </h4>
              <p className="text-xs text-gray-500 mb-4">
                {selectedFilter === 'All' 
                  ? 'Get started by adding your first property' 
                  : `No ${selectedFilter} properties available`}
              </p>
              <Link to="/admin/properties/new">
                <Button className="bg-primary text-white hover:bg-primary/90 text-sm px-4 py-2">
                  <Plus className="h-3 w-3 mr-1.5" />
                  Add Property
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/admin/properties/new">
            <div className="group p-4 rounded-lg bg-blue-50 border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <p className="font-medium text-sm text-gray-900">Add Property</p>
              <p className="text-xs text-gray-600 mt-0.5">Create new</p>
            </div>
          </Link>
          
          <Link to="/admin/locations">
            <div className="group p-4 rounded-lg bg-blue-50 border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <p className="font-medium text-sm text-gray-900">Locations</p>
              <p className="text-xs text-gray-600 mt-0.5">Manage areas</p>
            </div>
          </Link>
          
          <a href="/" target="_blank">
            <div className="group p-4 rounded-lg bg-red-50 border border-red-200 hover:border-red-400 hover:shadow-md transition-all cursor-pointer">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mb-3">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <p className="font-medium text-sm text-gray-900">View Site</p>
              <p className="text-xs text-gray-600 mt-0.5">Preview</p>
            </div>
          </a>
          
          <Link to="/admin/properties">
            <div className="group p-4 rounded-lg bg-red-50 border border-red-200 hover:border-red-400 hover:shadow-md transition-all cursor-pointer">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mb-3">
                <Star className="h-5 w-5 text-white" />
              </div>
              <p className="font-medium text-sm text-gray-900">Properties</p>
              <p className="text-xs text-gray-600 mt-0.5">Manage all</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
