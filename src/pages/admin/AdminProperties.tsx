import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Star, 
  MoreVertical,
  Building2,
  MapPin,
  Bed,
  Square,
  X,
  Loader2,
  Grid3X3,
  List,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { propertiesAPI } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminProperties = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [transactionFilter, setTransactionFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('filter') || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadProperties();
  }, [transactionFilter]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (transactionFilter !== 'All') {
        params.transactionType = transactionFilter;
      }
      const data = await propertiesAPI.getAll(params);
      setProperties(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load properties",
        variant: "destructive",
      });
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

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    try {
      await propertiesAPI.toggleFeatured(id, !currentValue);
      await loadProperties();
      toast({ title: "Success", description: "Featured status updated" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentValue: boolean) => {
    try {
      await propertiesAPI.toggleActive(id, !currentValue);
      await loadProperties();
      toast({ title: "Success", description: "Status updated" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    }
  };

  const deleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await propertiesAPI.delete(id);
      await loadProperties();
      toast({ title: "Deleted", description: "Property removed successfully", variant: "destructive" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.area?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || p.type?.toLowerCase() === filterType.toLowerCase();
    
    let matchesStatus = true;
    if (statusFilter === 'featured') {
      matchesStatus = p.isFeatured === true;
    } else if (statusFilter === 'active') {
      matchesStatus = p.isActive === true;
    } else if (statusFilter === 'inactive') {
      matchesStatus = p.isActive === false;
    }
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Properties</h1>
          <p className="text-gray-500 text-sm">Manage your property listings ({filteredProperties.length} total)</p>
        </div>
        <Link to="/admin/properties/new">
          <Button className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/30">
            <Plus className="h-5 w-5 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Status Filter Banner */}
      {statusFilter !== 'all' && (
        <div className={`px-4 py-3 rounded-xl flex items-center justify-between ${
          statusFilter === 'featured' ? 'bg-amber-50 border border-amber-200 text-amber-800' :
          statusFilter === 'active' ? 'bg-green-50 border border-green-200 text-green-800' :
          'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              statusFilter === 'featured' ? 'bg-amber-500' :
              statusFilter === 'active' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium">
              Showing: {statusFilter === 'featured' ? 'Featured' : statusFilter === 'active' ? 'Active' : 'Inactive'} Properties
            </span>
          </div>
          <button 
            onClick={() => {
              setStatusFilter('all');
              setSearchParams({});
            }}
            className="flex items-center gap-1 text-sm hover:underline"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
          </div>
          
          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                if (e.target.value === 'all') {
                  setSearchParams({});
                } else {
                  setSearchParams({ filter: e.target.value });
                }
              }}
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="all">All Status</option>
              <option value="featured">⭐ Featured</option>
              <option value="active">✅ Active</option>
              <option value="inactive">❌ Inactive</option>
            </select>
            <select
              value={transactionFilter}
              onChange={(e) => setTransactionFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="All">All Types</option>
              <option value="Sale">For Sale</option>
              <option value="Rent">For Rent</option>
              <option value="Lease">Lease</option>
              <option value="PG">PG</option>
            </select>
            
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid/List */}
      {filteredProperties.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div 
                key={property.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {property.image ? (
                    <img src={property.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {property.isFeatured && (
                      <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" /> Featured
                      </span>
                    )}
                    <span className={`px-2 py-1 text-white text-xs font-bold rounded-lg ${
                      property.transactionType === 'Sale' ? 'bg-blue-500' :
                      property.transactionType === 'Rent' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}>
                      {property.transactionType}
                    </span>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                      property.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {property.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a 
                      href={`/property/${property.id}`} 
                      target="_blank"
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Eye className="h-5 w-5 text-gray-700" />
                    </a>
                    <Link 
                      to={`/admin/properties/${property.id}/edit`}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Edit2 className="h-5 w-5 text-gray-700" />
                    </Link>
                    <button 
                      onClick={() => deleteProperty(String(property.id))}
                      className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 line-clamp-1 mb-2">{property.title}</h3>
                  
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{property.area}</span>
                  </div>
                  
                  {/* Specs */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    {property.bedrooms > 0 && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms} BHK</span>
                      </div>
                    )}
                    {property.sqft > 0 && (
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        <span>{property.sqft} sqft</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Price & Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <p className="text-xl font-bold text-primary">{formatPrice(property.price)}</p>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleFeatured(String(property.id), property.isFeatured)}
                        className={`p-2 rounded-lg transition-colors ${
                          property.isFeatured ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={property.isFeatured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star className={`h-5 w-5 ${property.isFeatured ? 'fill-current' : ''}`} />
                      </button>
                      <Switch
                        checked={property.isActive}
                        onCheckedChange={() => toggleActive(String(property.id), property.isActive)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Featured</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {property.image ? (
                            <img src={property.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate max-w-[180px]">{property.title}</p>
                          <p className="text-xs text-gray-500">
                            {property.bedrooms > 0 ? `${property.bedrooms} BHK • ` : ''}{property.sqft || 0} sqft
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        property.transactionType === 'Sale' ? 'bg-blue-100 text-blue-700' :
                        property.transactionType === 'Rent' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {property.transactionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{property.area}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary">{formatPrice(property.price)}</span>
                    </td>
                    <td className="px-6 py-4 text-center hidden sm:table-cell">
                      <button 
                        onClick={() => toggleFeatured(String(property.id), property.isFeatured)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          property.isFeatured ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        <Star className={`h-5 w-5 ${property.isFeatured ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Switch
                        checked={property.isActive}
                        onCheckedChange={() => toggleActive(String(property.id), property.isActive)}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <a href={`/property/${property.id}`} target="_blank" className="flex items-center">
                              <Eye className="h-4 w-4 mr-2" /> View
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/properties/${property.id}/edit`} className="flex items-center">
                              <Edit2 className="h-4 w-4 mr-2" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteProperty(String(property.id))}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
          <Link to="/admin/properties/new">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Property
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminProperties;
