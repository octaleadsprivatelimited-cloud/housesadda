import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Loader2, Star } from 'lucide-react';
import { PropertyCard, Property } from './PropertyCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { propertiesAPI } from '@/lib/api';

const categories = [
  { id: 'all', label: 'Properties', filter: null },
  { id: 'apartment', label: 'Apartments', filter: 'Apartment' },
  { id: 'flat', label: 'Flats', filter: 'Flat' },
  { id: 'villa', label: 'Villas', filter: 'Villa' },
  { id: 'plot', label: 'Plots', filter: 'Plot' },
  { id: 'commercial', label: 'Commercial', filter: 'Commercial' },
  { id: 'farmhouse', label: 'Farm Houses', filter: 'Farm House' },
  { id: 'farmland', label: 'Farm Lands', filter: 'Farm Land' },
];

export function FeaturedPropertiesTabs() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    loadProperties();
  }, [activeCategory]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const params: any = { active: true, featured: true };
      
      // Find the category filter
      const category = categories.find(c => c.id === activeCategory);
      if (category && category.filter) {
        params.type = category.filter;
      }
      
      const data = await propertiesAPI.getAll(params);
      
      // If no featured properties found for the category, try without featured filter
      let propertiesData = data;
      if (data.length === 0 && category && category.filter) {
        const allData = await propertiesAPI.getAll({ active: true, type: category.filter });
        propertiesData = allData;
      }
      
      // Also filter by title containing the category keyword for better matching
      if (category && category.filter && propertiesData.length === 0) {
        const allPropertiesData = await propertiesAPI.getAll({ active: true });
        const keyword = category.filter.toLowerCase();
        propertiesData = allPropertiesData.filter((p: any) => 
          p.title?.toLowerCase().includes(keyword) ||
          p.type?.toLowerCase().includes(keyword)
        );
      }
      
      const transformed: Property[] = propertiesData.slice(0, 8).map((prop: any) => ({
        id: String(prop.id),
        title: prop.title,
        type: prop.type || 'Apartment',
        city: prop.city || 'Hyderabad',
        area: prop.area || '',
        price: prop.price,
        priceUnit: 'onwards',
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        sqft: prop.sqft,
        image: prop.image || prop.images?.[0] || '',
        imageCount: prop.images?.length || 0,
        isFeatured: prop.isFeatured,
        isVerified: true,
        brochureUrl: prop.brochureUrl,
      }));
      
      setProperties(transformed);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getFilterLink = () => {
    const category = categories.find(c => c.id === activeCategory);
    if (category && category.filter) {
      return `/properties?type=${encodeURIComponent(category.filter)}`;
    }
    return '/properties?featured=true';
  };

  return (
    <section className="py-10 md:py-14 bg-background">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-primary fill-primary" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Featured Properties</h2>
          </div>
          <div className="flex items-center gap-3">
            <Link to={getFilterLink()} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="hidden md:flex gap-1">
              <Button variant="outline" size="icon" onClick={() => scroll('left')} className="rounded-full h-9 w-9">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => scroll('right')} className="rounded-full h-9 w-9">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${activeCategory === category.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Properties */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : properties.length > 0 ? (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0"
          >
            {properties.map((property) => (
              <div key={property.id} className="flex-shrink-0 w-[280px] md:w-[300px]">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No properties found in this category</p>
            <p className="text-sm mt-1">Add properties with type "{categories.find(c => c.id === activeCategory)?.filter || 'any'}" to see them here</p>
          </div>
        )}
      </div>
    </section>
  );
}

