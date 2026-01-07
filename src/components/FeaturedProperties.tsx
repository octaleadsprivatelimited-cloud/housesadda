import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { PropertyCard, Property } from './PropertyCard';
import { Button } from '@/components/ui/button';

const featuredProperties: Property[] = [
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
    brochureUrl: 'https://drive.google.com/file/d/example2',
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
    isFeatured: true,
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
    isFeatured: true,
  },
];

export function FeaturedProperties() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 md:py-20 bg-secondary/50">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-accent mb-2">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-sm font-semibold uppercase tracking-wide">Featured</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Premium Properties
            </h2>
            <p className="text-muted-foreground mt-2">
              Handpicked properties for discerning buyers
            </p>
          </div>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {featuredProperties.map((property) => (
            <div key={property.id} className="flex-shrink-0 w-[300px] md:w-[340px]">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button variant="outline" className="px-8">
            View All Featured Properties
          </Button>
        </div>
      </div>
    </section>
  );
}
