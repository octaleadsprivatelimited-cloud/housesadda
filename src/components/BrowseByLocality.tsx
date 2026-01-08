import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { locationsAPI, propertiesAPI } from '@/lib/api';

interface Locality {
  name: string;
  count: number;
}

export function BrowseByLocality() {
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLocalities();
  }, []);

  const loadLocalities = async () => {
    try {
      setIsLoading(true);
      // Fetch locations and properties count
      const [locations, properties] = await Promise.all([
        locationsAPI.getAll(),
        propertiesAPI.getAll({ active: true })
      ]);

      // Count properties by area
      const areaCounts: Record<string, number> = {};
      properties.forEach((p: any) => {
        const area = p.area || '';
        if (area) {
          areaCounts[area] = (areaCounts[area] || 0) + 1;
        }
      });

      // Map locations with counts
      const mappedLocalities = locations.map((l: any) => ({
        name: l.name,
        count: areaCounts[l.name] || 0,
      }));

      // Sort by count (most properties first) and take top 10
      mappedLocalities.sort((a: Locality, b: Locality) => b.count - a.count);
      setLocalities(mappedLocalities.slice(0, 10));
    } catch (error) {
      console.error('Error loading localities:', error);
      setLocalities([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-10 md:py-14 bg-secondary/30">
        <div className="container flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (localities.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-14 bg-secondary/30">
      <div className="container">
        <div className="mb-section-header">
          <h2 className="mb-section-title">Top Localities in Hyderabad</h2>
          <Link to="/properties" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {localities.map((locality) => (
            <Link
              key={locality.name}
              to={`/properties?area=${encodeURIComponent(locality.name)}`}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all group"
            >
              <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                {locality.name}
              </p>
              <p className="text-sm text-muted-foreground">{locality.count} Properties</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
