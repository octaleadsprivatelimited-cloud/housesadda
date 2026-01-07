import { useEffect, useState } from 'react';
import { PropertyCard, Property } from './PropertyCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { propertiesAPI } from '@/lib/api';

export function LatestProperties() {
  const [latestProperties, setLatestProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLatestProperties();
  }, []);

  const loadLatestProperties = async () => {
    try {
      setIsLoading(true);
      const data = await propertiesAPI.getAll({ active: true });
      
      // Sort by created date and take latest 6
      const sorted = data.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      
      const transformed: Property[] = sorted.slice(0, 6).map((prop: any) => ({
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
      
      setLatestProperties(transformed);
    } catch (error) {
      console.error('Error loading latest properties:', error);
      setLatestProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-10 md:py-14">
      <div className="container">
        <div className="mb-section-header">
          <h2 className="mb-section-title">Latest Properties</h2>
          <Link to="/properties" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : latestProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {latestProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No properties available
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/properties">
            <Button className="mb-btn-outline">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
