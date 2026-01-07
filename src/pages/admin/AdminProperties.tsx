import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Star, 
  MoreVertical,
  Filter,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Sample data - replace with API calls when connected to MySQL
const initialProperties = [
  {
    id: '1',
    title: 'Luxury 3 BHK Apartment in Gachibowli',
    type: 'Apartment',
    area: 'Gachibowli',
    city: 'Hyderabad',
    price: 15000000,
    bedrooms: 3,
    sqft: 2100,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80',
    isFeatured: true,
    isActive: true,
    createdAt: '2024-01-05',
  },
  {
    id: '2',
    title: 'Premium Villa in Jubilee Hills',
    type: 'Villa',
    area: 'Jubilee Hills',
    city: 'Hyderabad',
    price: 85000000,
    bedrooms: 5,
    sqft: 5500,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop&q=80',
    isFeatured: true,
    isActive: true,
    createdAt: '2024-01-04',
  },
  {
    id: '3',
    title: 'Modern 2 BHK in Hitech City',
    type: 'Apartment',
    area: 'Hitech City',
    city: 'Hyderabad',
    price: 9500000,
    bedrooms: 2,
    sqft: 1350,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop&q=80',
    isFeatured: true,
    isActive: true,
    createdAt: '2024-01-03',
  },
  {
    id: '4',
    title: 'HMDA Approved Plot in Shamirpet',
    type: 'Plot',
    area: 'Shamirpet',
    city: 'Hyderabad',
    price: 4500000,
    bedrooms: 0,
    sqft: 200,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&q=80',
    isFeatured: false,
    isActive: false,
    createdAt: '2024-01-02',
  },
];

const AdminProperties = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState(initialProperties);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const toggleFeatured = (id: string) => {
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
    ));
    toast({ title: "Property updated", description: "Featured status changed successfully." });
  };

  const toggleActive = (id: string) => {
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
    toast({ title: "Property updated", description: "Active status changed successfully." });
  };

  const deleteProperty = (id: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      setProperties(prev => prev.filter(p => p.id !== id));
      toast({ title: "Property deleted", description: "Property removed successfully.", variant: "destructive" });
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || p.type.toLowerCase() === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Link to="/admin/properties/new">
          <Button className="accent-gradient text-accent-foreground font-semibold">
            <Plus className="h-5 w-5 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border bg-card text-sm"
          >
            <option value="all">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-card rounded-2xl card-shadow overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold">Property</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Type</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Location</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Price</th>
                <th className="text-center px-6 py-4 text-sm font-semibold">Featured</th>
                <th className="text-center px-6 py-4 text-sm font-semibold">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        <img src={property.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[200px]">{property.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {property.bedrooms > 0 ? `${property.bedrooms} BHK • ` : ''}{property.sqft} sqft
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-secondary rounded-lg text-sm">{property.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">{property.area}</td>
                  <td className="px-6 py-4 font-semibold text-price">{formatPrice(property.price)}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => toggleFeatured(property.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        property.isFeatured ? 'text-amber-500 bg-amber-50' : 'text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <Star className={`h-5 w-5 ${property.isFeatured ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Switch
                      checked={property.isActive}
                      onCheckedChange={() => toggleActive(property.id)}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={`/property/${property.id}`} target="_blank">
                            <Eye className="h-4 w-4 mr-2" /> View
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/properties/${property.id}/edit`}>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteProperty(property.id)}
                          className="text-destructive"
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

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {filteredProperties.map((property) => (
            <div key={property.id} className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  <img src={property.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-2">{property.title}</p>
                  <p className="text-sm text-muted-foreground">{property.area}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-price">{formatPrice(property.price)}</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleFeatured(property.id)}
                    className={property.isFeatured ? 'text-amber-500' : 'text-muted-foreground'}
                  >
                    <Star className={`h-5 w-5 ${property.isFeatured ? 'fill-current' : ''}`} />
                  </button>
                  <Switch
                    checked={property.isActive}
                    onCheckedChange={() => toggleActive(property.id)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/properties/${property.id}/edit`}>
                          <Edit2 className="h-4 w-4 mr-2" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteProperty(property.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Link to="/admin/properties/new">
              <Button>Add Your First Property</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProperties;
