import { PropertyCard, Property } from './PropertyCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp } from 'lucide-react';

const latestProperties: Property[] = [
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
];

export function LatestProperties() {
  return (
    <section className="py-12 md:py-20">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Latest</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              New Listings
            </h2>
            <p className="text-muted-foreground mt-2">
              Fresh properties added to our collection
            </p>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {latestProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Button className="hero-gradient px-8 py-6 text-base font-semibold">
            View All Properties
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
