import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { MobileActionBar } from '@/components/MobileActionBar';
import { PropertyCard, Property } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { 
  Grid3X3, 
  List, 
  SlidersHorizontal, 
  X, 
  MapPin, 
  Home, 
  IndianRupee,
  ChevronDown 
} from 'lucide-react';

// Sample properties data
const allProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury 3 BHK Apartment in Gachibowli',
    type: 'Apartment',
    city: 'Hyderabad',
    area: 'Gachibowli',
    price: 15000000,
    priceUnit: 'onwards',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2100,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=80',
    isFeatured: true,
    brochureUrl: 'https://drive.google.com/file/d/example1',
  },
  {
    id: '2',
    title: 'Premium Villa in Jubilee Hills',
    type: 'Villa',
    city: 'Hyderabad',
    area: 'Jubilee Hills',
    price: 85000000,
    priceUnit: 'negotiable',
    bedrooms: 5,
    bathrooms: 6,
    sqft: 5500,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop&q=80',
    isFeatured: true,
  },
  {
    id: '3',
    title: 'Modern 2 BHK in Hitech City',
    type: 'Apartment',
    city: 'Hyderabad',
    area: 'Hitech City',
    price: 9500000,
    priceUnit: 'all inclusive',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1350,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&q=80',
    isFeatured: true,
  },
  {
    id: '4',
    title: 'HMDA Approved Plot in Shamirpet',
    type: 'Plot',
    city: 'Hyderabad',
    area: 'Shamirpet',
    price: 4500000,
    priceUnit: 'per acre',
    sqft: 200,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop&q=80',
  },
  {
    id: '5',
    title: 'Commercial Space in Madhapur',
    type: 'Commercial',
    city: 'Hyderabad',
    area: 'Madhapur',
    price: 25000000,
    priceUnit: 'onwards',
    sqft: 3000,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80',
  },
  {
    id: '6',
    title: 'Spacious 4 BHK in Kondapur',
    type: 'Apartment',
    city: 'Hyderabad',
    area: 'Kondapur',
    price: 22000000,
    priceUnit: 'onwards',
    bedrooms: 4,
    bathrooms: 4,
    sqft: 2800,
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop&q=80',
  },
  {
    id: '7',
    title: 'Independent House in Banjara Hills',
    type: 'Villa',
    city: 'Hyderabad',
    area: 'Banjara Hills',
    price: 120000000,
    priceUnit: 'negotiable',
    bedrooms: 6,
    bathrooms: 7,
    sqft: 8000,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop&q=80',
  },
  {
    id: '8',
    title: 'Ready to Move 2 BHK in Kukatpally',
    type: 'Apartment',
    city: 'Hyderabad',
    area: 'Kukatpally',
    price: 6500000,
    priceUnit: 'all inclusive',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop&q=80',
  },
  {
    id: '9',
    title: 'Commercial Plot in Financial District',
    type: 'Commercial',
    city: 'Hyderabad',
    area: 'Financial District',
    price: 50000000,
    priceUnit: 'per acre',
    sqft: 500,
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop&q=80',
  },
  {
    id: '10',
    title: 'Gated Community Villa in Kompally',
    type: 'Villa',
    city: 'Hyderabad',
    area: 'Kompally',
    price: 35000000,
    priceUnit: 'onwards',
    bedrooms: 4,
    bathrooms: 5,
    sqft: 3200,
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop&q=80',
  },
  {
    id: '11',
    title: 'Affordable 1 BHK in Miyapur',
    type: 'Apartment',
    city: 'Hyderabad',
    area: 'Miyapur',
    price: 3800000,
    priceUnit: 'negotiable',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 650,
    image: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop&q=80',
  },
  {
    id: '12',
    title: 'Premium 3 BHK in Financial District',
    type: 'Apartment',
    city: 'Hyderabad',
    area: 'Financial District',
    price: 18000000,
    priceUnit: 'onwards',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2200,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&q=80',
    isFeatured: true,
  },
];

const areas = ['All Areas', 'Gachibowli', 'Hitech City', 'Kondapur', 'Jubilee Hills', 'Banjara Hills', 'Madhapur', 'Kukatpally', 'Miyapur', 'Kompally', 'Financial District', 'Shamirpet'];
const propertyTypes = ['All Types', 'Apartment', 'Villa', 'Plot', 'Commercial'];
const budgetRanges = [
  { label: 'Any Budget', min: 0, max: Infinity },
  { label: 'Under ₹50 Lakh', min: 0, max: 5000000 },
  { label: '₹50L - ₹1 Crore', min: 5000000, max: 10000000 },
  { label: '₹1Cr - ₹2 Crore', min: 10000000, max: 20000000 },
  { label: '₹2Cr - ₹5 Crore', min: 20000000, max: 50000000 },
  { label: 'Above ₹5 Crore', min: 50000000, max: Infinity },
];

const Properties = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedBudget, setSelectedBudget] = useState(budgetRanges[0]);

  // Filter properties
  const filteredProperties = allProperties.filter((property) => {
    const areaMatch = selectedArea === 'All Areas' || property.area === selectedArea;
    const typeMatch = selectedType === 'All Types' || property.type === selectedType;
    const budgetMatch = property.price >= selectedBudget.min && property.price <= selectedBudget.max;
    return areaMatch && typeMatch && budgetMatch;
  });

  const clearFilters = () => {
    setSelectedArea('All Areas');
    setSelectedType('All Types');
    setSelectedBudget(budgetRanges[0]);
  };

  const hasActiveFilters = selectedArea !== 'All Areas' || selectedType !== 'All Types' || selectedBudget.label !== 'Any Budget';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Page Header */}
        <section className="hero-gradient text-primary-foreground py-12 md:py-16">
          <div className="container">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">All Properties</h1>
            <p className="text-primary-foreground/80">
              Discover {filteredProperties.length} properties in Hyderabad
            </p>
          </div>
        </section>

        {/* Filters & Content */}
        <section className="py-6 md:py-10">
          <div className="container">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Desktop Filters */}
              <div className="hidden md:flex items-center gap-3">
                {/* Area Filter */}
                <div className="relative">
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="appearance-none bg-card border border-border rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {areas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Type Filter */}
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="appearance-none bg-card border border-border rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <Home className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Budget Filter */}
                <div className="relative">
                  <select
                    value={selectedBudget.label}
                    onChange={(e) => setSelectedBudget(budgetRanges.find(b => b.label === e.target.value) || budgetRanges[0])}
                    className="appearance-none bg-card border border-border rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {budgetRanges.map((budget) => (
                      <option key={budget.label} value={budget.label}>{budget.label}</option>
                    ))}
                  </select>
                  <IndianRupee className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setShowFilters(true)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </Button>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-card shadow-sm' : ''}`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-card shadow-sm' : ''}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
            </p>

            {/* Properties Grid/List */}
            {filteredProperties.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
                : 'flex flex-col gap-4'
              }>
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters to see more results
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Mobile Filter Sheet */}
        {showFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-foreground/50" onClick={() => setShowFilters(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 animate-slide-in max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Area */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Location</label>
                  <div className="relative">
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full appearance-none bg-secondary rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {areas.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Property Type</label>
                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full appearance-none bg-secondary rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Budget Range</label>
                  <div className="relative">
                    <select
                      value={selectedBudget.label}
                      onChange={(e) => setSelectedBudget(budgetRanges.find(b => b.label === e.target.value) || budgetRanges[0])}
                      className="w-full appearance-none bg-secondary rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {budgetRanges.map((budget) => (
                        <option key={budget.label} value={budget.label}>{budget.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" className="flex-1 py-6" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button className="flex-1 py-6 accent-gradient" onClick={() => setShowFilters(false)}>
                  Show {filteredProperties.length} Properties
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
      <MobileActionBar />
    </div>
  );
};

export default Properties;
