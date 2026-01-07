import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Phone, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Property {
  id: string;
  title: string;
  type: string;
  city: string;
  area: string;
  price: number;
  priceUnit: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  image: string;
  isFeatured?: boolean;
  brochureUrl?: string;
}

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const whatsappMessage = `Hi Houses Adda, I'm interested in this property: ${property.title} in ${property.area}, ${property.city}`;
  const whatsappUrl = `https://wa.me/916301575658?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="bg-card rounded-2xl overflow-hidden card-shadow card-hover">
      {/* Image */}
      <Link to={`/property/${property.id}`} className="block property-image aspect-[4/3]">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full"
        />
        {/* Featured Badge */}
        {property.isFeatured && (
          <span className="absolute top-3 left-3 featured-badge">Featured</span>
        )}
        {/* Property Type */}
        <span className="absolute top-3 right-3 bg-foreground/80 text-background text-xs font-medium px-3 py-1 rounded-full">
          {property.type}
        </span>
      </Link>

      {/* Content */}
      <div className="p-4 md:p-5 space-y-3">
        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-xl md:text-2xl font-bold text-price">
            {formatPrice(property.price)}
          </span>
          {property.priceUnit && (
            <span className="text-xs text-muted-foreground">{property.priceUnit}</span>
          )}
        </div>

        {/* Title */}
        <Link to={`/property/${property.id}`}>
          <h3 className="text-base md:text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
            {property.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm truncate">{property.area}, {property.city}</span>
        </div>

        {/* Specs */}
        {(property.bedrooms || property.bathrooms || property.sqft) && (
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            {property.bedrooms && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms} BHK</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.sqft && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Square className="h-4 w-4" />
                <span>{property.sqft} sqft</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <a href="tel:+916301575658" className="flex-1">
            <Button variant="outline" className="w-full text-sm">
              <Phone className="h-4 w-4 mr-1.5" />
              Call
            </Button>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button className="w-full whatsapp-btn text-sm">
              <MessageCircle className="h-4 w-4 mr-1.5" />
              WhatsApp
            </Button>
          </a>
          {property.brochureUrl && (
            <a href={property.brochureUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="flex-shrink-0">
                <FileText className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
